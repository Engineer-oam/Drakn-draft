import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PageTransition } from '../../components/PageTransition';
import { useAuth } from '../../hooks/useAuth';
import { useCustomer } from '../../hooks/useCustomer';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function AccountPrivate() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useCustomer();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'private_requests'),
          where('customerId', '==', user.uid)
        );
        const snap = await getDocs(q);
        // Note: orderBy might require an index, sorting client side for simplicity if no index exists
        const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        reqs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setRequests(reqs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [user]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (profile && profile.membershipLevel === 'STANDARD')) {
    return <Navigate to="/account" replace />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-[#D4CFC9] pt-32 pb-32 px-6 md:px-12 selection:bg-[#F4F0EB] selection:text-[#050505]">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-6 mb-12">
            <div>
              <h1 className="text-3xl font-display uppercase tracking-widest text-white mb-2">DRAKN Private</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39E98]">{profile?.membershipLevel || 'MEMBER'} ACCESS</p>
            </div>
            <Link to="/account" className="text-[10px] uppercase tracking-widest text-[#A39E98] hover:text-white transition-colors">
              Return to Standard Account
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3 space-y-4">
              <div className="p-6 border border-[#1A1A1A] bg-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Concierge</h3>
                <p className="text-[10px] uppercase tracking-widest text-[#A39E98] leading-relaxed mb-6">
                  For immediate assistance with your commissions, contact your private advisor.
                </p>
                <a href="mailto:private@drakn.com" className="block w-full border border-white text-white text-center py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                  Contact Atelier
                </a>
              </div>
            </div>

            <div className="md:col-span-9">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-8">My Commissions & Requests</h2>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="border border-[#1A1A1A] p-12 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#A39E98] mb-6">
                    You have no active commissions.
                  </p>
                  <Link to="/private" className="inline-block border-b border-white text-white pb-1 text-[10px] uppercase tracking-widest hover:text-[#A39E98] hover:border-[#A39E98] transition-colors">
                    Explore Private Collection
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {requests.map(req => (
                    <div key={req.id} className="border border-[#1A1A1A] p-6 md:p-8 hover:border-[#333] transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1A1A1A] pb-6 mb-6 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#A39E98] mb-1">
                            Ref: {req.id.slice(0, 8)}
                          </p>
                          <h3 className="text-sm font-display uppercase tracking-widest text-white">
                            {req.productName}
                          </h3>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="inline-block bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            {req.status}
                          </span>
                          <p className="text-[10px] uppercase tracking-widest text-[#666] mt-2">
                            Requested {req.createdAt ? new Date(req.createdAt.toMillis()).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.keys(req.selections || {}).length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#A39E98] mb-4">Configuration</h4>
                            <ul className="space-y-2">
                              {Object.entries(req.selections).map(([key, val]) => (
                                <li key={key} className="flex justify-between text-[10px] uppercase tracking-widest">
                                  <span className="text-[#666]">{key}</span>
                                  <span className="text-[#D4CFC9]">{String(val)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#A39E98] mb-4">Status Updates</h4>
                          <p className="text-[10px] uppercase tracking-widest text-[#D4CFC9] leading-relaxed">
                            {req.status === 'REQUEST RECEIVED' && 'Your request is currently being reviewed by our atelier. A formal quote and production timeline will be provided shortly.'}
                            {req.status === 'UNDER REVIEW' && 'Our master tailors are reviewing your configuration specifications.'}
                            {req.status === 'QUOTE READY' && 'Your private quote has been prepared. Please review to proceed with production.'}
                            {req.status === 'IN PRODUCTION' && 'Your piece is currently in the construction phase at our atelier.'}
                            {req.status === 'SHIPPED' && 'Your commission has been dispatched.'}
                          </p>
                          
                          {req.status === 'QUOTE READY' && req.quote && (
                            <div className="mt-6 border-t border-[#1A1A1A] pt-4 flex justify-between items-center">
                              <span className="text-xs uppercase tracking-widest text-white font-bold">Quote: ${req.quote.total?.toLocaleString()}</span>
                              <button className="bg-white text-black px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#D4CFC9] transition-colors">
                                Review & Accept
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
