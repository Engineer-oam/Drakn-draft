import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { subDays, startOfDay, endOfDay, startOfToday, startOfYesterday, endOfYesterday } from 'date-fns';

export type DateRange = 'today' | 'yesterday' | '7days' | '30days' | '90days' | 'all' | 'custom';

export interface AnalyticsData {
  revenue: number;
  ordersCount: number;
  unitsSold: number;
  aov: number;
  uniqueCustomers: number;
  repeatCustomers: number;
  salesData: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  topSizes: { size: string; quantity: number }[];
  topColors: { color: string; quantity: number }[];
  topCategories: { category: string; quantity: number; revenue: number }[];
  sellThrough: { name: string; rate: number; sold: number; available: number }[];
  lowStockVariants: { sku: string; available: number; productName: string }[];
}

export function useAnalytics(range: DateRange, customStartDate?: Date, customEndDate?: Date) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        let startDate: number = 0;
        let endDate: number = Date.now();

        const today = startOfToday();
        
        switch (range) {
          case 'today':
            startDate = startOfDay(new Date()).getTime();
            endDate = endOfDay(new Date()).getTime();
            break;
          case 'yesterday':
            startDate = startOfYesterday().getTime();
            endDate = endOfYesterday().getTime();
            break;
          case '7days':
            startDate = subDays(today, 6).getTime();
            endDate = endOfDay(new Date()).getTime();
            break;
          case '30days':
            startDate = subDays(today, 29).getTime();
            endDate = endOfDay(new Date()).getTime();
            break;
          case '90days':
            startDate = subDays(today, 89).getTime();
            endDate = endOfDay(new Date()).getTime();
            break;
          case 'all':
            startDate = 0;
            endDate = Date.now();
            break;
          case 'custom':
            startDate = customStartDate ? startOfDay(customStartDate).getTime() : 0;
            endDate = customEndDate ? endOfDay(customEndDate).getTime() : Date.now();
            break;
        }

        // Fetch all products to get categories mapping
        const productsSnap = await getDocs(collection(db, 'products'));
        const productCategoryMap: Record<string, string> = {};
        for (const p of productsSnap.docs) {
          productCategoryMap[p.id] = p.data().categoryId || 'Uncategorized';
        }

        // Fetch Orders
        let ordersQuery = query(
          collection(db, 'orders'),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        );

        const ordersSnap = await getDocs(ordersQuery);
        
        let totalRevenue = 0;
        let unitsSold = 0;
        const customerIds = new Set<string>();
        const customerOrderCounts: Record<string, number> = {};
        
        const salesByDate: Record<string, { revenue: number; orders: number }> = {};
        const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
        const sizeStats: Record<string, number> = {};
        const colorStats: Record<string, number> = {};
        const categoryStats: Record<string, { quantity: number; revenue: number }> = {};
        const productSoldUnits: Record<string, { name: string; quantity: number }> = {};

        for (const orderDoc of ordersSnap.docs) {
          const order = orderDoc.data();
          totalRevenue += order.total || 0;
          
          if (order.userId && order.userId !== 'guest') {
            customerIds.add(order.userId);
            customerOrderCounts[order.userId] = (customerOrderCounts[order.userId] || 0) + 1;
          }

          const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!salesByDate[dateStr]) {
            salesByDate[dateStr] = { revenue: 0, orders: 0 };
          }
          salesByDate[dateStr].revenue += order.total || 0;
          salesByDate[dateStr].orders += 1;

          const itemsSnap = await getDocs(collection(db, 'orders', orderDoc.id, 'items'));
          
          for (const itemDoc of itemsSnap.docs) {
            const item = itemDoc.data();
            const qty = item.quantity || 0;
            const itemRev = item.totalPrice || 0;
            unitsSold += qty;

            if (!productStats[item.productId]) {
              productStats[item.productId] = { name: item.productName || 'Unknown', quantity: 0, revenue: 0 };
              productSoldUnits[item.productId] = { name: item.productName || 'Unknown', quantity: 0 };
            }
            productStats[item.productId].quantity += qty;
            productStats[item.productId].revenue += itemRev;
            productSoldUnits[item.productId].quantity += qty;

            const category = productCategoryMap[item.productId] || 'Uncategorized';
            if (!categoryStats[category]) {
              categoryStats[category] = { quantity: 0, revenue: 0 };
            }
            categoryStats[category].quantity += qty;
            categoryStats[category].revenue += itemRev;

            if (item.size) {
              sizeStats[item.size] = (sizeStats[item.size] || 0) + qty;
            }
            if (item.color) {
              colorStats[item.color] = (colorStats[item.color] || 0) + qty;
            }
          }
        }

        const ordersCount = ordersSnap.size;
        const aov = ordersCount > 0 ? totalRevenue / ordersCount : 0;
        const uniqueCustomers = customerIds.size;
        const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

        const topProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        const topSizes = Object.entries(sizeStats).map(([size, quantity]) => ({ size, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        const topColors = Object.entries(colorStats).map(([color, quantity]) => ({ color, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        const topCategories = Object.entries(categoryStats).map(([category, stats]) => ({ category, ...stats })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        
        const salesData = Object.entries(salesByDate).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }));

        const lowStockVariants: { sku: string; available: number; productName: string }[] = [];
        const inventorySnap = await getDocs(collection(db, 'inventory'));
        const availableByProduct: Record<string, number> = {};

        for (const invDoc of inventorySnap.docs) {
          const inv = invDoc.data();
          const pId = inv.productId; // Note: if variantId is document id, we need to know what productId it maps to.
          // Wait, inv.productId might not exist? The current inv structure only has variantId, available.
          // To get sell-through, let's just use what's available and assume we can match it later or just keep it simple.
          
          if (inv.available !== undefined && inv.available <= 10) {
            lowStockVariants.push({
              sku: invDoc.id,
              available: inv.available,
              productName: 'Variant ' + invDoc.id.substring(0, 6)
            });
          }
        }

        // Sell-through simulation based on total units sold vs an assumed available based on low stock or general stock. 
        // Real sell through requires tracking initial inventory which we don't have.
        // We'll calculate it for top products assuming they have 100 initial stock if we can't find real inventory right now.
        // Or better yet, we'll fetch variants for the top products.
        const sellThroughData = [];
        for (const [pId, pData] of Object.entries(productSoldUnits).slice(0, 5)) {
          let totalAvailable = 0;
          const varsSnap = await getDocs(collection(db, 'products', pId, 'variants'));
          for (const vDoc of varsSnap.docs) {
             const invDoc = await getDocs(query(collection(db, 'inventory'), where('variantId', '==', vDoc.id)));
             if (!invDoc.empty) {
                totalAvailable += invDoc.docs[0].data().available || 0;
             } else {
                // If variantId is the doc id
                const invD = await getDoc(doc(db, 'inventory', vDoc.id));
                if (invD.exists()) {
                   totalAvailable += invD.data().available || 0;
                }
             }
          }
          const sold = pData.quantity;
          const totalInventory = sold + totalAvailable;
          const rate = totalInventory > 0 ? (sold / totalInventory) * 100 : 0;
          sellThroughData.push({
            name: pData.name,
            rate: Math.round(rate),
            sold,
            available: totalAvailable
          });
        }
        sellThroughData.sort((a, b) => b.rate - a.rate);

        setData({
          revenue: totalRevenue,
          ordersCount,
          unitsSold,
          aov,
          uniqueCustomers,
          repeatCustomers,
          salesData,
          topProducts,
          topSizes,
          topColors,
          topCategories,
          sellThrough: sellThroughData,
          lowStockVariants: lowStockVariants.sort((a, b) => a.available - b.available).slice(0, 10)
        });

      } catch (err) {
        console.error("Analytics fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [range, customStartDate, customEndDate]);

  return { data, loading };
}
