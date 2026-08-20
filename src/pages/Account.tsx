import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCustomer, Order } from '../hooks/useCustomer';
import { PageTransition } from '../components/PageTransition';

export function Account() {
  const { user, signOut } = useAuth();
  const { profile, orders, loading, updateProfile } = useCustomer();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ firstName: '', lastName: '' });

  if (!user && !loading) {
    navigate('/shop');
    return null;
  }

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12 border-b border-drakn-light/20 pb-6">
          <h1 className="text-3xl font-display uppercase tracking-widest">My Account</h1>
          <button onClick={signOut} className="text-drakn-muted hover:text-red-500 transition-colors uppercase text-[10px] tracking-widest">
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3 space-y-4">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`block w-full text-left px-4 py-3 uppercase tracking-widest text-xs transition-colors ${activeTab === 'orders' ? 'bg-drakn-light text-drakn-base' : 'text-drakn-muted hover:text-drakn-light hover:bg-drakn-light/5'}`}
              >
                Order History
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`block w-full text-left px-4 py-3 uppercase tracking-widest text-xs transition-colors ${activeTab === 'profile' ? 'bg-drakn-light text-drakn-base' : 'text-drakn-muted hover:text-drakn-light hover:bg-drakn-light/5'}`}
              >
                Profile & Settings
              </button>
              {profile?.membershipLevel && profile.membershipLevel !== 'STANDARD' && (
                <Link
                  to="/account/private"
                  className="block w-full text-left px-4 py-3 uppercase tracking-widest text-xs transition-colors text-[#A39E98] hover:text-white hover:bg-white/5 border border-[#1A1A1A] mt-8"
                >
                  DRAKN Private
                </Link>
              )}
            </div>

            <div className="md:col-span-9">
              {activeTab === 'orders' && (
                <div className="space-y-8">
                  {orders.length === 0 ? (
                    <div className="text-drakn-muted uppercase tracking-widest text-xs">No orders found.</div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="border border-drakn-light/20 p-6">
                        <div className="flex justify-between items-start mb-6 border-b border-drakn-light/10 pb-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-drakn-muted mb-1">Order No. {order.id}</p>
                            <p className="text-[10px] uppercase tracking-widest text-drakn-light">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-widest font-bold mb-1">{formatter.format(order.total)}</p>
                            <p className={`text-[10px] uppercase tracking-widest ${order.status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}`}>{order.status}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {order.items.map(item => (
                            <div key={item.variantId} className="flex gap-4">
                              <div className="w-16 aspect-[3/4] bg-drakn-dark flex-shrink-0">
                                {item.imageUrl && <OptimizedImage src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-luminosity" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-display uppercase tracking-wider text-xs mb-1">{item.productName}</h3>
                                <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-2">{item.color} / {item.size} — Qty: {item.quantity}</p>
                                <p className="text-[10px]">{formatter.format(item.priceAtPurchase)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="border border-drakn-light/20 p-6">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-drakn-muted">Personal Information</h2>
                  
                  {isEditing ? (
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      updateProfile({ firstName: editData.firstName, lastName: editData.lastName });
                      setIsEditing(false);
                    }}>
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="First Name" value={editData.firstName} onChange={e => setEditData(prev => ({...prev, firstName: e.target.value}))} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light" />
                        <input placeholder="Last Name" value={editData.lastName} onChange={e => setEditData(prev => ({...prev, lastName: e.target.value}))} className="w-full bg-transparent border border-drakn-light/20 p-4 uppercase text-xs tracking-widest placeholder:text-drakn-muted focus:outline-none focus:border-drakn-light" />
                      </div>
                      <div className="flex gap-4">
                        <button type="submit" className="bg-drakn-light text-drakn-base px-6 py-3 text-xs uppercase tracking-widest font-bold">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="border border-drakn-light/20 px-6 py-3 text-xs uppercase tracking-widest">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-1">First Name</p>
                          <p className="text-xs uppercase tracking-widest">{profile?.firstName || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-1">Last Name</p>
                          <p className="text-xs uppercase tracking-widest">{profile?.lastName || '--'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-1">Email</p>
                          <p className="text-xs tracking-widest text-drakn-muted">{profile?.email}</p>
                        </div>
                      </div>
                      <button onClick={() => {
                        setEditData({ firstName: profile?.firstName || '', lastName: profile?.lastName || '' });
                        setIsEditing(true);
                      }} className="border border-drakn-light/20 px-6 py-3 text-xs uppercase tracking-widest hover:bg-drakn-light hover:text-drakn-base transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
