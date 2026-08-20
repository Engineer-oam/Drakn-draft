import { useState } from 'react';
import { motion } from 'motion/react';
import { useAnalytics, DateRange } from '../../hooks/useAnalytics';
import { 
  TrendingUp, Package, Users, ShoppingCart, 
  DollarSign, Activity, AlertTriangle, Shirt, Palette, Tags, Percent
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  
  const startDate = customStart ? new Date(customStart) : undefined;
  const endDate = customEnd ? new Date(customEnd) : undefined;

  const { data, loading } = useAnalytics(dateRange, startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-drakn-base border border-drakn-graphite p-6 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-8 relative z-10">
        <h3 className="text-xs uppercase tracking-widest text-drakn-muted">{title}</h3>
        <Icon size={16} className="text-drakn-graphite group-hover:text-drakn-light transition-colors" />
      </div>
      <p className="text-3xl font-display tracking-wider relative z-10">
        {loading ? <span className="animate-pulse">--</span> : value}
      </p>
      
      <div className="absolute inset-0 bg-gradient-to-br from-drakn-charcoal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest mb-2">Analytics</h1>
          <p className="text-sm text-drakn-muted">Real-time telemetry and commercial intelligence.</p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)} 
                className="bg-transparent border border-drakn-graphite px-3 py-1.5 text-xs text-drakn-light uppercase tracking-widest focus:outline-none focus:border-drakn-light"
              />
              <span className="text-drakn-muted">-</span>
              <input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)} 
                className="bg-transparent border border-drakn-graphite px-3 py-1.5 text-xs text-drakn-light uppercase tracking-widest focus:outline-none focus:border-drakn-light"
              />
            </div>
          )}
          <div className="flex bg-drakn-charcoal p-1">
            {(['today', 'yesterday', '7days', '30days', '90days', 'all', 'custom'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-colors ${
                  dateRange === range ? 'bg-drakn-light text-drakn-base font-bold' : 'text-drakn-muted hover:text-drakn-light'
                }`}
              >
                {range.replace('days', ' Days')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Revenue" value={data ? formatCurrency(data.revenue) : '$0'} icon={DollarSign} delay={0.1} />
        <StatCard title="Orders" value={data?.ordersCount || 0} icon={ShoppingCart} delay={0.2} />
        <StatCard title="Units Sold" value={data?.unitsSold || 0} icon={Package} delay={0.3} />
        <StatCard title="Average Order Value" value={data ? formatCurrency(data.aov) : '$0'} icon={Activity} delay={0.4} />
        <StatCard title="Unique Customers" value={data?.uniqueCustomers || 0} icon={Users} delay={0.5} />
        <StatCard title="Repeat Customers" value={data?.repeatCustomers || 0} icon={TrendingUp} delay={0.6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Sales Over Time Chart */}
        <div className="lg:col-span-2 bg-drakn-base border border-drakn-graphite p-6">
          <div className="mb-6 pb-4 border-b border-drakn-graphite">
            <h3 className="text-xs uppercase tracking-widest font-bold">Sales Over Time</h3>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse text-drakn-muted uppercase tracking-widest text-xs">Loading telemetry...</div>
            ) : data && data.salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                    itemStyle={{ color: '#E5E5E5' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#E5E5E5" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-drakn-muted uppercase tracking-widest text-xs border border-drakn-graphite/50">
                No telemetry available for this period.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-drakn-base border border-drakn-graphite p-6 flex flex-col">
          <div className="mb-6 pb-4 border-b border-drakn-graphite flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-bold">Inventory Health</h3>
            <AlertTriangle size={16} className="text-yellow-500" />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
               <div className="space-y-4 animate-pulse">
                 {[1,2,3].map(i => <div key={i} className="h-10 bg-drakn-charcoal w-full" />)}
               </div>
            ) : data && data.lowStockVariants.length > 0 ? (
              <div className="space-y-4">
                {data.lowStockVariants.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-drakn-graphite/50 pb-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-drakn-light">{item.productName}</p>
                      <p className="text-[10px] text-drakn-muted uppercase tracking-widest">ID: {item.sku.substring(0, 8)}</p>
                    </div>
                    <div className={`text-xs font-bold ${item.available === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {item.available} Left
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Package size={24} className="text-drakn-graphite mb-4" />
                <p className="text-xs uppercase tracking-widest text-drakn-muted">Optimal Stock Levels</p>
                <p className="text-[10px] uppercase tracking-widest text-drakn-graphite mt-2">No critical shortages detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Men's Fashion Insights */}
      <h2 className="text-xl font-display uppercase tracking-widest mb-6 border-b border-drakn-graphite pb-4">Merchandising Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-drakn-base border border-drakn-graphite p-6">
          <div className="mb-6 pb-4 border-b border-drakn-graphite flex items-center gap-2">
            <Package size={14} className="text-drakn-muted" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Best Sellers</h3>
          </div>
          {loading ? (
             <div className="h-10 bg-drakn-charcoal animate-pulse w-full"></div>
          ) : data && data.topProducts.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest truncate max-w-[150px]" title={p.name}>{p.name}</span>
                  <div className="text-right">
                    <span className="block text-xs text-drakn-light">{p.quantity} units</span>
                    <span className="block text-[10px] text-drakn-muted">{formatCurrency(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[10px] text-drakn-muted uppercase tracking-widest border border-drakn-graphite/30">No data</div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-drakn-base border border-drakn-graphite p-6">
          <div className="mb-6 pb-4 border-b border-drakn-graphite flex items-center gap-2">
            <Tags size={14} className="text-drakn-muted" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Top Categories</h3>
          </div>
          {loading ? (
             <div className="h-10 bg-drakn-charcoal animate-pulse w-full"></div>
          ) : data && data.topCategories.length > 0 ? (
            <div className="space-y-4">
              {data.topCategories.map((c, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest">{c.category}</span>
                  <div className="text-right">
                    <span className="block text-xs text-drakn-light">{c.quantity} units</span>
                    <span className="block text-[10px] text-drakn-muted">{formatCurrency(c.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[10px] text-drakn-muted uppercase tracking-widest border border-drakn-graphite/30">No data</div>
          )}
        </div>

        {/* Product Sell-Through */}
        <div className="bg-drakn-base border border-drakn-graphite p-6">
          <div className="mb-6 pb-4 border-b border-drakn-graphite flex items-center gap-2">
            <Percent size={14} className="text-drakn-muted" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Sell-Through Rate</h3>
          </div>
          {loading ? (
             <div className="h-10 bg-drakn-charcoal animate-pulse w-full"></div>
          ) : data && data.sellThrough.length > 0 ? (
            <div className="space-y-4">
              {data.sellThrough.map((st, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest truncate max-w-[150px]">{st.name}</span>
                    <span className="text-xs font-bold text-drakn-light">{st.rate}%</span>
                  </div>
                  <div className="w-full bg-drakn-charcoal h-1.5 overflow-hidden">
                    <div className="bg-drakn-light h-full" style={{ width: `${st.rate}%` }}></div>
                  </div>
                  <span className="text-[10px] text-drakn-muted uppercase tracking-widest text-right">
                    {st.sold} sold / {st.available} remaining
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[10px] text-drakn-muted uppercase tracking-widest border border-drakn-graphite/30">No data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Sizes */}
        <div className="bg-drakn-base border border-drakn-graphite p-6">
          <div className="mb-6 pb-4 border-b border-drakn-graphite flex items-center gap-2">
            <Shirt size={14} className="text-drakn-muted" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Top Sizes</h3>
          </div>
          {loading ? (
             <div className="h-10 bg-drakn-charcoal animate-pulse w-full"></div>
          ) : data && data.topSizes.length > 0 ? (
            <div className="space-y-4">
              {data.topSizes.map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest px-3 py-1 border border-drakn-light/20">{s.size}</span>
                  <span className="text-xs text-drakn-light">{s.quantity} units</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[10px] text-drakn-muted uppercase tracking-widest border border-drakn-graphite/30">No data</div>
          )}
        </div>

        {/* Top Colors */}
        <div className="bg-drakn-base border border-drakn-graphite p-6">
          <div className="mb-6 pb-4 border-b border-drakn-graphite flex items-center gap-2">
            <Palette size={14} className="text-drakn-muted" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Top Colours</h3>
          </div>
          {loading ? (
             <div className="h-10 bg-drakn-charcoal animate-pulse w-full"></div>
          ) : data && data.topColors.length > 0 ? (
            <div className="space-y-4">
              {data.topColors.map((c, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-drakn-light/20" style={{ backgroundColor: c.color.toLowerCase() }}></div>
                    {c.color}
                  </span>
                  <span className="text-xs text-drakn-light">{c.quantity} units</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[10px] text-drakn-muted uppercase tracking-widest border border-drakn-graphite/30">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}

