import express from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';

if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Vercel deployment: Use explicit service account JSON
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", e);
      initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'composite-spanner-fskkt' });
    }
  } else {
    // Local / AI Studio: Use ADC (Application Default Credentials)
    initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'composite-spanner-fskkt'
    });
  }
}

const db = getFirestore();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/checkout/validate-coupon', async (req, res) => {
  try {
    const { code, subtotal, userId } = req.body;
    if (!code) return res.status(400).json({ error: "No code provided" });
    const couponDoc = await db.collection('coupons').doc(code.toUpperCase()).get();
    if (!couponDoc.exists) return res.status(404).json({ error: "Invalid coupon code" });
    const coupon = couponDoc.data()!;
    
    if (!coupon.active) return res.status(400).json({ error: "Coupon is inactive" });
    if (coupon.expiry && coupon.expiry < Date.now()) return res.status(400).json({ error: "Coupon has expired" });
    if (coupon.minOrder && subtotal < coupon.minOrder) return res.status(400).json({ error: `Minimum order of $${coupon.minOrder} required` });
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) return res.status(400).json({ error: "Coupon usage limit reached" });
    
    if (userId && coupon.userLimits && coupon.userLimits[userId] >= (coupon.perCustomerLimit || 1)) {
      return res.status(400).json({ error: "You have reached the usage limit for this coupon" });
    }
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
    res.json({ success: true, discount, type: coupon.type, value: coupon.value, code: code.toUpperCase() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { items, customer, shipping, couponCode } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    const orderRef = db.collection('orders').doc();
    let subtotal = 0;
    const orderItemsData: any[] = [];
    const taxRate = 0.08;
    await db.runTransaction(async (t) => {
      subtotal = 0;
      for (const item of items) {
        const variantRef = db.collection('products').doc(item.productId).collection('variants').doc(item.variantId);
        const invRef = db.collection('inventory').doc(item.variantId);
        const [vDoc, invDoc] = await Promise.all([t.get(variantRef), t.get(invRef)]);
        if (!vDoc.exists || !invDoc.exists) {
          throw new Error(`Item ${item.name} is no longer available.`);
        }
        const variant = vDoc.data()!;
        const inv = invDoc.data()!;
        if (inv.available < item.quantity) {
          throw new Error(`Insufficient inventory for ${variant.sku || item.name}. Available: ${inv.available}`);
        }
        const price = (variant.salePrice && variant.salePrice > 0) ? variant.salePrice : variant.price;
        subtotal += price * item.quantity;
        t.update(invRef, {
          available: inv.available - item.quantity,
          updatedAt: Date.now()
        });
        const txRef = db.collection('inventory').doc(item.variantId).collection('transactions').doc();
        t.set(txRef, {
          variantId: item.variantId,
          type: 'sale',
          quantity: -item.quantity,
          reason: `Order ${orderRef.id}`,
          createdAt: Date.now()
        });
        orderItemsData.push({
          orderId: orderRef.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          priceAtPurchase: price,
          quantity: item.quantity,
          totalPrice: price * item.quantity,
          imageUrl: item.imageUrl
        });
      }
      let discount = 0;
      if (couponCode) {
        const couponRef = db.collection('coupons').doc(couponCode.toUpperCase());
        const couponDoc = await t.get(couponRef);
        if (couponDoc.exists) {
          const coupon = couponDoc.data()!;
          const userId = customer.userId || 'guest';
          if (coupon.active &&
              (!coupon.expiry || coupon.expiry > Date.now()) &&
              (!coupon.minOrder || subtotal >= coupon.minOrder) &&
             (!coupon.usageLimit || coupon.currentUsage < coupon.usageLimit) &&
             (!coupon.userLimits || (coupon.userLimits[userId] || 0) < (coupon.perCustomerLimit || 1))) 
           {
            if (coupon.type === 'percentage') {
              discount = subtotal * (coupon.value / 100);
              if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
            } else {
              discount = coupon.value;
            }
            discount = Math.min(discount, subtotal);
            const userUsage = (coupon.userLimits && coupon.userLimits[userId]) ? coupon.userLimits[userId] + 1 : 1;
            t.update(couponRef, {
              currentUsage: (coupon.currentUsage || 0) + 1,
              [`userLimits.${userId}`]: userUsage
            });
          } else {
            throw new Error("Coupon is no longer valid or conditions not met.");
          }
        }
      }
      const subtotalAfterDiscount = subtotal - discount;
      const tax = subtotalAfterDiscount * taxRate;
      const shippingCost = subtotalAfterDiscount > 200 ? 0 : 15;
      const total = subtotalAfterDiscount + tax + shippingCost;
      t.set(orderRef, {
        userId: customer.userId || 'guest',
        status: 'Pending',
        subtotal,
        discount,
        couponCode: discount > 0 ? couponCode.toUpperCase() : null,
        tax,
        shipping: shippingCost,
        total,
        currency: 'USD',
        customerInfo: customer,
        shippingInfo: shipping,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      for (const oi of orderItemsData) {
        const oiRef = orderRef.collection('items').doc();
        t.set(oiRef, oi);
      }
    });
    res.json({ success: true, orderId: orderRef.id });
  } catch (err: any) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
