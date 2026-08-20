import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCoupons, Coupon } from '../../hooks/useCoupons';
import { Plus, Trash, Edit, Check, X } from 'lucide-react';

export function Marketing() {
  const [activeTab, setActiveTab] = useState<'homepage' | 'coupons'>('homepage');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-display uppercase tracking-[0.2em] mb-8 border-b border-drakn-light/20 pb-4">Marketing & Content</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('homepage')}
          className={`px-6 py-2 uppercase tracking-widest text-xs transition-colors ${activeTab === 'homepage' ? 'bg-drakn-light text-drakn-base font-bold' : 'border border-drakn-light/20 hover:bg-drakn-light/5'}`}
        >
          Homepage Content
        </button>
        <button 
          onClick={() => setActiveTab('coupons')}
          className={`px-6 py-2 uppercase tracking-widest text-xs transition-colors ${activeTab === 'coupons' ? 'bg-drakn-light text-drakn-base font-bold' : 'border border-drakn-light/20 hover:bg-drakn-light/5'}`}
        >
          Coupons
        </button>
      </div>

      {activeTab === 'homepage' && <HomepageEditor />}
      {activeTab === 'coupons' && <CouponsManager />}
    </div>
  );
}

function HomepageEditor() {
  const [content, setContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      const docSnap = await getDoc(doc(db, 'settings', 'homepage'));
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        setContent({
          hero: { headline: '', subheading: '', image: '', ctaText: '', ctaLink: '' },
          editorial: { title: '', body: '', image1: '', image2: '' },
          featuredCollection: { title: '', image: '', link: '' }
        });
      }
    }
    fetch();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'homepage'), content);
      alert("Homepage content saved!");
    } catch(err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (!content) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-12">
      <section className="border border-drakn-light/20 p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">Hero Section</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Headline" value={content.hero.headline} onChange={e => setContent({...content, hero: {...content.hero, headline: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="Subheading" value={content.hero.subheading} onChange={e => setContent({...content, hero: {...content.hero, subheading: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="Background Image URL" value={content.hero.image} onChange={e => setContent({...content, hero: {...content.hero, image: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="CTA Text" value={content.hero.ctaText} onChange={e => setContent({...content, hero: {...content.hero, ctaText: e.target.value}})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="CTA Link" value={content.hero.ctaLink} onChange={e => setContent({...content, hero: {...content.hero, ctaLink: e.target.value}})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
        </div>
      </section>

      <section className="border border-drakn-light/20 p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">Editorial Section</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Title" value={content.editorial.title} onChange={e => setContent({...content, editorial: {...content.editorial, title: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <textarea placeholder="Body Text" value={content.editorial.body} onChange={e => setContent({...content, editorial: {...content.editorial, body: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" rows={4} />
          <input placeholder="Image 1 URL" value={content.editorial.image1} onChange={e => setContent({...content, editorial: {...content.editorial, image1: e.target.value}})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="Image 2 URL" value={content.editorial.image2} onChange={e => setContent({...content, editorial: {...content.editorial, image2: e.target.value}})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
        </div>
      </section>

      <section className="border border-drakn-light/20 p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-widest">Featured Collection</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Title" value={content.featuredCollection.title} onChange={e => setContent({...content, featuredCollection: {...content.featuredCollection, title: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="Image URL" value={content.featuredCollection.image} onChange={e => setContent({...content, featuredCollection: {...content.featuredCollection, image: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input placeholder="Link URL" value={content.featuredCollection.link} onChange={e => setContent({...content, featuredCollection: {...content.featuredCollection, link: e.target.value}})} className="col-span-2 w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
        </div>
      </section>

      <button type="submit" disabled={saving} className="bg-drakn-light text-drakn-base px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Homepage Content'}
      </button>
    </form>
  );
}

function CouponsManager() {
  const { coupons, loading, saveCoupon, deleteCoupon } = useCoupons();
  const [isAdding, setIsAdding] = useState(false);
  
  const initForm: Coupon = {
    code: '', type: 'percentage', value: 10, currentUsage: 0, active: true
  };
  const [form, setForm] = useState<Coupon>(initForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCoupon({ ...form, code: form.code.toUpperCase() });
    setIsAdding(false);
    setForm(initForm);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold uppercase tracking-widest">Coupons</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-drakn-light text-drakn-base px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
          {isAdding ? <X size={16}/> : <Plus size={16}/>}
          {isAdding ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-drakn-light/20 p-6 mb-8 grid grid-cols-2 gap-4">
          <input required placeholder="CODE" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm uppercase focus:border-drakn-light" />
          
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-drakn-base border border-drakn-light/20 p-3 text-sm focus:border-drakn-light uppercase">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
          
          <input required type="number" placeholder="Value" value={form.value} onChange={e => setForm({...form, value: parseFloat(e.target.value)})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input type="number" placeholder="Min Order ($) (Optional)" value={form.minOrder || ''} onChange={e => setForm({...form, minOrder: parseFloat(e.target.value) || undefined})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input type="number" placeholder="Max Discount ($) (Optional)" value={form.maxDiscount || ''} onChange={e => setForm({...form, maxDiscount: parseFloat(e.target.value) || undefined})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input type="number" placeholder="Global Usage Limit (Optional)" value={form.usageLimit || ''} onChange={e => setForm({...form, usageLimit: parseInt(e.target.value) || undefined})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input type="number" placeholder="Per Customer Limit (Optional)" value={form.perCustomerLimit || ''} onChange={e => setForm({...form, perCustomerLimit: parseInt(e.target.value) || undefined})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          <input type="date" placeholder="Expiry Date" value={form.expiry ? new Date(form.expiry).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, expiry: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm uppercase tracking-widest">
              <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="w-4 h-4" />
              Active
            </label>
          </div>
          
          <button type="submit" className="col-span-2 bg-drakn-light text-drakn-base py-3 uppercase tracking-widest font-bold">Save Coupon</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.code} className={`border p-6 relative ${coupon.active ? 'border-drakn-light/40' : 'border-drakn-graphite opacity-50'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold uppercase tracking-widest">{coupon.code}</h3>
              <button onClick={() => deleteCoupon(coupon.code)} className="text-red-500 hover:text-red-400">
                <Trash size={16} />
              </button>
            </div>
            <div className="space-y-2 text-sm text-drakn-muted uppercase tracking-widest">
              <p>Type: {coupon.type}</p>
              <p>Value: {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</p>
              {coupon.minOrder && <p>Min Order: ${coupon.minOrder}</p>}
              <p>Uses: {coupon.currentUsage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
