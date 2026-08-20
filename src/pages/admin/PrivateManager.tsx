import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Edit2, Archive, Eye, Users, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { OptimizedImage } from '../../components/OptimizedImage';

export function PrivateManager() {
  const [activeTab, setActiveTab] = useState<'products' | 'requests' | 'members'>('products');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest text-drakn-light mb-2">DRAKN PRIVATE</h1>
          <p className="text-[10px] uppercase tracking-widest text-drakn-muted">Atelier & Commission Management</p>
        </div>
      </div>

      <div className="flex gap-8 border-b border-drakn-graphite mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "pb-4 text-xs uppercase tracking-widest transition-colors relative",
            activeTab === 'products' ? "text-drakn-light font-bold" : "text-drakn-muted hover:text-drakn-light"
          )}
        >
          Private Collection
          {activeTab === 'products' && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-drakn-light" />}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "pb-4 text-xs uppercase tracking-widest transition-colors relative",
            activeTab === 'requests' ? "text-drakn-light font-bold" : "text-drakn-muted hover:text-drakn-light"
          )}
        >
          Private Requests
          {activeTab === 'requests' && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-drakn-light" />}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={cn(
            "pb-4 text-xs uppercase tracking-widest transition-colors relative",
            activeTab === 'members' ? "text-drakn-light font-bold" : "text-drakn-muted hover:text-drakn-light"
          )}
        >
          Membership & Invitations
          {activeTab === 'members' && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-drakn-light" />}
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'products' && <PrivateProductsTab />}
        {activeTab === 'requests' && <PrivateRequestsTab />}
        {activeTab === 'members' && <PrivateMembersTab />}
      </div>
    </div>
  );
}

function PrivateProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), where('isPrivate', '==', true));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <div className="p-8 text-center text-drakn-muted uppercase text-xs">Loading...</div>;

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="border border-drakn-graphite p-12 text-center">
          <PackageIcon size={32} className="mx-auto text-drakn-muted mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-drakn-light mb-2">No Private Products</h3>
          <p className="text-xs text-drakn-muted uppercase tracking-widest">Mark products as 'Private' in the main Products catalog to see them here.</p>
        </div>
      ) : (
        products.map(p => (
          <div key={p.id} className="border border-drakn-graphite p-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-drakn-dark">
                {p.images?.[0] && <OptimizedImage src={p.images[0]} alt={p.name} className="w-full h-full object-cover mix-blend-luminosity" />}
              </div>
              <div>
                <h3 className="font-display uppercase tracking-widest text-drakn-light">{p.name}</h3>
                <p className="text-[10px] text-drakn-muted uppercase tracking-widest mt-1">
                  TYPE: {p.privateType || 'N/A'} | STATUS: {p.editionStatus || 'AVAILABLE'}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PrivateRequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReqs() {
      try {
        const q = query(collection(db, 'private_requests'));
        const snap = await getDocs(q);
        const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        reqs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setRequests(reqs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReqs();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, 'private_requests', id), { status: newStatus });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  if (loading) return <div className="p-8 text-center text-drakn-muted uppercase text-xs">Loading...</div>;

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="border border-drakn-graphite p-12 text-center">
          <FileText size={32} className="mx-auto text-drakn-muted mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-drakn-light mb-2">No Active Requests</h3>
          <p className="text-xs text-drakn-muted uppercase tracking-widest">Client commission requests will appear here.</p>
        </div>
      ) : (
        requests.map(r => (
          <div key={r.id} className="border border-drakn-graphite p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display uppercase tracking-widest text-drakn-light">{r.productName}</h3>
                <p className="text-[10px] text-drakn-muted uppercase tracking-widest mt-1">Client: {r.customerEmail}</p>
              </div>
              <div className="flex gap-2">
                <select 
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="bg-drakn-dark border border-drakn-graphite text-xs uppercase tracking-widest p-2 text-drakn-light focus:outline-none"
                >
                  <option value="REQUEST RECEIVED">Request Received</option>
                  <option value="UNDER REVIEW">Under Review</option>
                  <option value="QUOTE READY">Quote Ready</option>
                  <option value="IN PRODUCTION">In Production</option>
                  <option value="SHIPPED">Shipped</option>
                </select>
              </div>
            </div>
            {Object.keys(r.selections || {}).length > 0 && (
              <div className="mt-4 border-t border-drakn-graphite pt-4">
                <p className="text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Configurations:</p>
                {Object.entries(r.selections).map(([k, v]) => (
                  <p key={k} className="text-[10px] uppercase tracking-widest"><span className="text-drakn-muted">{k}:</span> {String(v)}</p>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function PrivateMembersTab() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const updateMembership = async (id: string, level: string) => {
    await updateDoc(doc(db, 'users', id), { membershipLevel: level });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, membershipLevel: level } : m));
  };

  if (loading) return <div className="p-8 text-center text-drakn-muted uppercase text-xs">Loading...</div>;

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="border border-drakn-graphite p-12 text-center">
          <Users size={32} className="mx-auto text-drakn-muted mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-drakn-light mb-2">No Members Found</h3>
        </div>
      ) : (
        members.map(m => (
          <div key={m.id} className="border border-drakn-graphite p-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-drakn-light">{m.email}</p>
              <p className="text-[10px] uppercase tracking-widest text-drakn-muted">{m.firstName || '-'} {m.lastName || '-'}</p>
            </div>
            <select
              value={m.membershipLevel || 'STANDARD'}
              onChange={(e) => updateMembership(m.id, e.target.value)}
              className="bg-drakn-dark border border-drakn-graphite text-xs uppercase tracking-widest p-2 text-drakn-light focus:outline-none"
            >
              <option value="STANDARD">Standard</option>
              <option value="VIP">VIP / Atelier Client</option>
              <option value="INVITE_ONLY">Invite Only</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}

function PackageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}
