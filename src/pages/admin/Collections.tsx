import { useState } from 'react';
import { useCollections, Collection } from '../../hooks/useCollections';
import { useCatalog } from '../../hooks/useCatalog';
import { Plus, Trash, Edit, Check, X } from 'lucide-react';

export function CollectionsManager() {
  const { collections, loading, saveCollection, deleteCollection } = useCollections();
  const { products } = useCatalog();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initForm: Omit<Collection, 'id'> = {
    name: '', slug: '', description: '', image: '', productIds: []
  };
  const [form, setForm] = useState<Omit<Collection, 'id'>>(initForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCollection(form, editingId || undefined);
    setIsAdding(false);
    setEditingId(null);
    setForm(initForm);
  };

  const handleEdit = (c: Collection) => {
    setForm({ name: c.name, slug: c.slug, description: c.description, image: c.image, productIds: c.productIds });
    setEditingId(c.id);
    setIsAdding(true);
  };

  const toggleProduct = (productId: string) => {
    setForm(prev => {
      if (prev.productIds.includes(productId)) {
        return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
      }
      return { ...prev, productIds: [...prev.productIds, productId] };
    });
  };

  if (loading) return <div>Loading collections...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-drakn-light/20 pb-4">
        <h1 className="text-3xl font-display uppercase tracking-[0.2em]">Collections</h1>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setForm(initForm); }} className="bg-drakn-light text-drakn-base px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
          {isAdding ? <X size={16}/> : <Plus size={16}/>}
          {isAdding ? 'Cancel' : 'New Collection'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-drakn-light/20 p-6 mb-8 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <input required placeholder="Name (e.g. Summer '24)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
            <input required placeholder="Slug (e.g. summer-24)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
            <input placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-transparent border border-drakn-light/20 p-3 text-sm focus:border-drakn-light" />
          </div>
          <div className="border border-drakn-light/20 p-4 h-64 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Select Products</h3>
            <div className="space-y-2">
              {products.map(p => (
                <label key={p.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="w-4 h-4 bg-drakn-base border-drakn-light/40" />
                  <span className="uppercase tracking-widest">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="col-span-2 bg-drakn-light text-drakn-base py-3 uppercase tracking-widest font-bold">
            {editingId ? 'Update Collection' : 'Create Collection'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map(c => (
          <div key={c.id} className="border border-drakn-light/20 overflow-hidden flex flex-col group">
            {c.image && (
              <div className="h-48 bg-drakn-dark overflow-hidden relative">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold uppercase tracking-widest">{c.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="text-drakn-muted hover:text-drakn-light"><Edit size={16} /></button>
                  <button onClick={() => deleteCollection(c.id)} className="text-red-500 hover:text-red-400"><Trash size={16} /></button>
                </div>
              </div>
              <p className="text-[10px] text-drakn-muted uppercase tracking-widest mb-4">/{c.slug}</p>
              <p className="text-sm text-drakn-muted mb-6 flex-1">{c.description}</p>
              <p className="text-xs font-bold uppercase tracking-widest">{c.productIds.length} Products</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
