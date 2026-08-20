import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../hooks/useAuth';
import { PageTransition } from '../components/PageTransition';
import { Tag } from 'lucide-react';
import { OptimizedImage } from '../components/OptimizedImage';

export function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  // If cart is empty, user shouldn't be here (ideally)
  if (items.length === 0 && !loading && !error) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-32 px-8 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-display uppercase tracking-widest mb-4">Cart Empty</h1>
          <button onClick={() => navigate('/shop')} className="border border-drakn-light px-8 py-4 text-xs uppercase tracking-widest hover:bg-drakn-light hover:text-drakn-base transition-colors">
            Return to Shop
          </button>
        </div>
      </PageTransition>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCode) return;

    try {
      const response = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          userId: user?.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid coupon');
      }

      setDiscountAmount(data.discount);
      setAppliedCoupon(data.code);
    } catch (err: any) {
      setCouponError(err.message);
      setDiscountAmount(0);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            quantity: i.quantity,
            imageUrl: i.imageUrl
          })),
          customer: {
            userId: user?.uid,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          },
          shipping: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
          },
          couponCode: appliedCoupon
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }

      clearCart();
      navigate(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * 0.08;
  const shippingCost = discountedSubtotal > 200 ? 0 : 15;
  const total = discountedSubtotal + tax + shippingCost;

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-32 max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-3xl font-display uppercase tracking-widest mb-12 border-b border-drakn-light/20 pb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-12">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 text-sm uppercase tracking-wider">
                  {error}
                </div>
              )}

              {/* Customer Info */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-drakn-muted">Customer Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required name="firstName" placeholder="First Name" onChange={handleInputChange} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  <input required name="lastName" placeholder="Last Name" onChange={handleInputChange} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  <input required type="email" name="email" value={formData.email} placeholder="Email" onChange={handleInputChange} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-drakn-muted">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input required name="address" placeholder="Address" onChange={handleInputChange} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  <input required name="city" placeholder="City" onChange={handleInputChange} className="col-span-2 sm:col-span-1 w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-4">
                    <input required name="state" placeholder="State/Prov" onChange={handleInputChange} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                    <input required name="zip" placeholder="ZIP/Postal" onChange={handleInputChange} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  </div>
                </div>
              </section>

              {/* Payment Information */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-drakn-muted">Payment Information</h2>
                <div className="p-6 border border-drakn-light/20 bg-drakn-light/5 text-drakn-muted text-xs uppercase tracking-widest mb-6 text-center">
                  Secure checkout environment. Card data is not saved.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required name="cardNumber" placeholder="Card Number" onChange={handleInputChange} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  <input required name="expiry" placeholder="MM/YY" onChange={handleInputChange} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                  <input required name="cvv" placeholder="CVV" onChange={handleInputChange} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors" />
                </div>
              </section>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-drakn-light/20 p-8 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-drakn-muted">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 aspect-[3/4] bg-drakn-dark flex-shrink-0">
                      {item.imageUrl && <OptimizedImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-luminosity" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display uppercase tracking-wider text-xs mb-1">{item.name}</h3>
                      <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-2">{item.color} / {item.size} — Qty: {item.quantity}</p>
                      <p className="text-xs font-medium">{formatter.format(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-drakn-light/20 pt-6 mt-6">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-drakn-muted" />
                    <input 
                      type="text" 
                      placeholder="Promo Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="w-full bg-transparent border border-drakn-light/20 p-3 pl-9 uppercase text-[10px] tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light transition-colors disabled:opacity-50" 
                    />
                  </div>
                  {appliedCoupon ? (
                    <button type="button" onClick={handleRemoveCoupon} className="border border-drakn-light/20 px-4 text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors">
                      Remove
                    </button>
                  ) : (
                    <button type="submit" disabled={!couponCode || loading} className="border border-drakn-light/20 px-4 text-[10px] uppercase tracking-widest hover:border-drakn-light hover:bg-drakn-light/5 transition-colors disabled:opacity-50">
                      Apply
                    </button>
                  )}
                </form>
                {couponError && <p className="text-[10px] text-red-500 mt-2 tracking-widest uppercase">{couponError}</p>}
                {appliedCoupon && <p className="text-[10px] text-green-500 mt-2 tracking-widest uppercase">Coupon '{appliedCoupon}' applied</p>}
              </div>

              <div className="border-t border-drakn-light/20 pt-6 mt-6 space-y-4 text-sm uppercase tracking-widest">
                <div className="flex justify-between text-drakn-muted">
                  <span>Subtotal</span>
                  <span>{formatter.format(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-{formatter.format(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-drakn-muted">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatter.format(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-drakn-muted">
                  <span>Tax (Est 8%)</span>
                  <span>{formatter.format(tax)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-drakn-light/20 font-bold text-lg text-drakn-light">
                  <span>Total</span>
                  <span>{formatter.format(total)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full mt-8 bg-drakn-light text-drakn-base font-bold uppercase tracking-[0.2em] py-5 flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </PageTransition>
  );
}
