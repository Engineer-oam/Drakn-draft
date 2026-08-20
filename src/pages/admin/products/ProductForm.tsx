import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';

interface Variant {
  id: string; // temp id for UI if new
  color: string;
  size: string;
  sku: string;
  price: number;
  salePrice: number;
  inventory: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface ImageObj {
  file?: File;
  url: string;
  isNew?: boolean;
  isDeleted?: boolean;
  id: string;
}

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [basic, setBasic] = useState({
    name: '', description: '', categoryId: '', collectionId: '', status: 'draft'
  });
  const [fashion, setFashion] = useState({
    fit: '', material: '', fabric: '', pattern: '', careInstructions: '', sizeInfo: ''
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ImageObj[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const pDoc = await getDoc(doc(db, 'products', productId));
      if (!pDoc.exists()) {
        setError("Product not found");
        setLoading(false);
        return;
      }
      const data = pDoc.data();
      setBasic({
        name: data.name || '', description: data.description || '', 
        categoryId: data.categoryId || '', collectionId: data.collectionId || '', status: data.status || 'draft'
      });
      setFashion({
        fit: data.fit || '', material: data.material || '', fabric: data.fabric || '',
        pattern: data.pattern || '', careInstructions: data.careInstructions || '', sizeInfo: data.sizeInfo || ''
      });

      // Fetch variants
      const vSnap = await getDocs(collection(db, 'products', productId, 'variants'));
      const fetchedVariants = await Promise.all(vSnap.docs.map(async (v) => {
        const vData = v.data();
        const invSnap = await getDoc(doc(db, 'inventory', v.id));
        return {
          id: v.id,
          color: vData.color || '', size: vData.size || '', sku: vData.sku || '',
          price: vData.price || 0, salePrice: vData.salePrice || 0,
          inventory: invSnap.exists() ? invSnap.data().available : 0,
        };
      }));
      setVariants(fetchedVariants);

      // Fetch images
      const iSnap = await getDocs(query(collection(db, 'products', productId, 'images')));
      setImages(iSnap.docs.map(i => ({ id: i.id, url: i.data().url })));

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load product data");
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, {
      id: crypto.randomUUID(), color: '', size: '', sku: '', price: 0, salePrice: 0, inventory: 0, isNew: true
    }]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, isDeleted: true } : v));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file), // Temp URL for preview
        isNew: true
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages(images.map(img => img.id === id ? { ...img, isDeleted: true } : img));
  };

  const validate = async () => {
    if (!basic.name) throw new Error("Product name is required.");
    const activeVariants = variants.filter(v => !v.isDeleted);
    if (activeVariants.length === 0) throw new Error("At least one variant is required.");
    
    // Check local duplicate SKUs
    const skus = activeVariants.map(v => v.sku);
    if (new Set(skus).size !== skus.length) throw new Error("Duplicate SKUs found within variants.");
    if (skus.some(s => !s.trim())) throw new Error("All variants must have a valid SKU.");
    if (activeVariants.some(v => v.price <= 0)) throw new Error("All variants must have a valid price.");
    if (activeVariants.some(v => v.inventory < 0)) throw new Error("Inventory cannot be negative.");
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      setError('');
      await validate();

      const batch = writeBatch(db);
      const productRef = isEdit ? doc(db, 'products', id as string) : doc(collection(db, 'products'));
      const productId = productRef.id;

      // 1. SKU Uniqueness check (Server-side validation equivalent using Firestore)
      const activeVariants = variants.filter(v => !v.isDeleted);
      for (const v of activeVariants) {
        if (v.isNew || v.sku) { // Only check if SKU changed or is new, to be truly safe check all active
           const skuRef = doc(db, 'skus', v.sku.toUpperCase());
           const skuDoc = await getDoc(skuRef);
           if (skuDoc.exists() && skuDoc.data().variantId !== v.id) {
             throw new Error(`SKU ${v.sku} is already in use by another product.`);
           }
           batch.set(skuRef, { productId, variantId: v.id });
        }
      }

      // 2. Base Product
      batch.set(productRef, {
        ...basic,
        ...fashion,
        updatedAt: Date.now(),
        ...(isEdit ? {} : { createdAt: Date.now() })
      }, { merge: true });

      // 3. Images (Upload to Storage, then write to DB)
      let order = 0;
      for (const img of images) {
        if (img.isDeleted) {
          if (!img.isNew) {
            batch.delete(doc(db, 'products', productId, 'images', img.id));
          }
          continue;
        }
        let finalUrl = img.url;
        if (img.isNew && img.file) {
          const storageRef = ref(storage, `products/${productId}/${img.id}_${img.file.name}`);
          await uploadBytes(storageRef, img.file);
          finalUrl = await getDownloadURL(storageRef);
        }
        batch.set(doc(db, 'products', productId, 'images', img.id), {
          url: finalUrl, order: order++, createdAt: Date.now()
        }, { merge: true });
      }

      // 4. Variants & Inventory
      for (const v of variants) {
        const vRef = doc(db, 'products', productId, 'variants', v.id);
        const invRef = doc(db, 'inventory', v.id);
        
        if (v.isDeleted) {
          if (!v.isNew) {
            batch.update(vRef, { isActive: false });
            // optionally delete SKU ref if desired, keeping simple for now
          }
          continue;
        }

        batch.set(vRef, {
          productId,
          color: v.color, size: v.size, sku: v.sku.toUpperCase(),
          price: Number(v.price), salePrice: Number(v.salePrice),
          isActive: true, updatedAt: Date.now(),
          ...(v.isNew ? { createdAt: Date.now() } : {})
        }, { merge: true });

        batch.set(invRef, {
          variantId: v.id,
          available: Number(v.inventory),
          reserved: 0,
          updatedAt: Date.now()
        }, { merge: true });
      }

      await batch.commit();
      navigate('/admin/products');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during save.');
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 border border-drakn-graphite hover:bg-drakn-dark transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-display uppercase tracking-widest">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        </div>
        <button 
          onClick={saveProduct}
          disabled={saving}
          className="flex items-center gap-2 bg-drakn-light text-drakn-base px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-drakn-muted transition-colors disabled:opacity-50"
        >
          {saving ? 'Committing...' : <><Save size={16} /> Save Product</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-900/50 text-red-500 p-4 mb-8 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* BASIC INFO */}
          <section className="bg-drakn-base border border-drakn-graphite p-6">
            <h2 className="text-xs uppercase tracking-widest text-drakn-muted mb-6 font-bold border-b border-drakn-graphite pb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Product Name</label>
                <input 
                  type="text" value={basic.name} onChange={e => setBasic({...basic, name: e.target.value})}
                  className="w-full bg-drakn-dark border border-drakn-graphite p-3 text-sm focus:outline-none focus:border-drakn-light transition-colors"
                  placeholder="e.g. The Obsidian Trench"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Description</label>
                <textarea 
                  value={basic.description} onChange={e => setBasic({...basic, description: e.target.value})}
                  className="w-full h-32 bg-drakn-dark border border-drakn-graphite p-3 text-sm focus:outline-none focus:border-drakn-light transition-colors resize-none"
                  placeholder="Cinematic product description..."
                />
              </div>
            </div>
          </section>

          {/* MEDIA */}
          <section className="bg-drakn-base border border-drakn-graphite p-6">
            <h2 className="text-xs uppercase tracking-widest text-drakn-muted mb-6 font-bold border-b border-drakn-graphite pb-4">Media Assets</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.filter(img => !img.isDeleted).map((img, idx) => (
                <div key={img.id} className="relative group aspect-[3/4] border border-drakn-graphite bg-drakn-dark">
                  <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  {idx === 0 && <div className="absolute bottom-2 left-2 bg-drakn-light text-drakn-base text-[8px] uppercase tracking-widest px-2 py-1 font-bold">Primary</div>}
                </div>
              ))}
              <label className="aspect-[3/4] border border-dashed border-drakn-graphite hover:border-drakn-muted transition-colors flex flex-col items-center justify-center cursor-pointer bg-drakn-dark/50">
                <ImageIcon size={24} className="text-drakn-muted mb-2" />
                <span className="text-[10px] uppercase tracking-widest text-drakn-muted">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </section>

          {/* VARIANTS & INVENTORY */}
          <section className="bg-drakn-base border border-drakn-graphite p-6">
            <div className="flex justify-between items-center mb-6 border-b border-drakn-graphite pb-4">
              <h2 className="text-xs uppercase tracking-widest text-drakn-muted font-bold">Variants & Inventory</h2>
              <button onClick={handleAddVariant} className="text-[10px] flex items-center gap-1 uppercase tracking-widest text-drakn-light hover:text-drakn-muted">
                <Plus size={12}/> Add Variant
              </button>
            </div>
            
            <div className="space-y-4">
              {variants.filter(v => !v.isDeleted).map((variant, index) => (
                <div key={variant.id} className="grid grid-cols-12 gap-3 items-end border border-drakn-graphite p-4 bg-drakn-dark/50">
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest text-drakn-muted mb-1">Color</label>
                    <input type="text" value={variant.color} onChange={e => updateVariant(variant.id, 'color', e.target.value)} className="w-full bg-transparent border-b border-drakn-graphite py-1 text-xs focus:outline-none focus:border-drakn-light" placeholder="Onyx"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest text-drakn-muted mb-1">Size</label>
                    <input type="text" value={variant.size} onChange={e => updateVariant(variant.id, 'size', e.target.value)} className="w-full bg-transparent border-b border-drakn-graphite py-1 text-xs focus:outline-none focus:border-drakn-light" placeholder="L"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest text-drakn-muted mb-1">SKU</label>
                    <input type="text" value={variant.sku} onChange={e => updateVariant(variant.id, 'sku', e.target.value)} className="w-full bg-transparent border-b border-drakn-graphite py-1 text-xs focus:outline-none focus:border-drakn-light" placeholder="DRK-ONX-L"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest text-drakn-muted mb-1">Price</label>
                    <input type="number" value={variant.price} onChange={e => updateVariant(variant.id, 'price', e.target.value)} className="w-full bg-transparent border-b border-drakn-graphite py-1 text-xs focus:outline-none focus:border-drakn-light"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-widest text-drakn-muted mb-1">Stock</label>
                    <input type="number" value={variant.inventory} onChange={e => updateVariant(variant.id, 'inventory', e.target.value)} className="w-full bg-transparent border-b border-drakn-graphite py-1 text-xs focus:outline-none focus:border-drakn-light"/>
                  </div>
                  <div className="col-span-2 flex justify-end pb-1">
                    <button onClick={() => removeVariant(variant.id)} className="text-drakn-muted hover:text-red-500 transition-colors p-1"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
              {variants.filter(v => !v.isDeleted).length === 0 && (
                <div className="text-center py-6 text-xs text-drakn-muted border border-dashed border-drakn-graphite">
                  No variants defined. Products require at least one variant.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* PUBLISHING */}
          <section className="bg-drakn-base border border-drakn-graphite p-6">
            <h2 className="text-xs uppercase tracking-widest text-drakn-muted mb-6 font-bold border-b border-drakn-graphite pb-4">Publishing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Status</label>
                <select 
                  value={basic.status} onChange={e => setBasic({...basic, status: e.target.value})}
                  className="w-full bg-drakn-dark border border-drakn-graphite p-3 text-xs uppercase tracking-widest focus:outline-none focus:border-drakn-light"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active (Published)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Category</label>
                <input 
                  type="text" value={basic.categoryId} onChange={e => setBasic({...basic, categoryId: e.target.value})}
                  className="w-full bg-drakn-dark border border-drakn-graphite p-3 text-sm focus:outline-none focus:border-drakn-light"
                  placeholder="e.g. Outerwear"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Collection</label>
                <input 
                  type="text" value={basic.collectionId} onChange={e => setBasic({...basic, collectionId: e.target.value})}
                  className="w-full bg-drakn-dark border border-drakn-graphite p-3 text-sm focus:outline-none focus:border-drakn-light"
                  placeholder="e.g. FW26 Core"
                />
              </div>
            </div>
          </section>

          {/* FASHION DETAILS */}
          <section className="bg-drakn-base border border-drakn-graphite p-6">
            <h2 className="text-xs uppercase tracking-widest text-drakn-muted mb-6 font-bold border-b border-drakn-graphite pb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Fit</label>
                <input type="text" value={fashion.fit} onChange={e => setFashion({...fashion, fit: e.target.value})} className="w-full bg-drakn-dark border border-drakn-graphite p-2 text-sm focus:outline-none focus:border-drakn-light" placeholder="e.g. Tailored Relaxed"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Material</label>
                <input type="text" value={fashion.material} onChange={e => setFashion({...fashion, material: e.target.value})} className="w-full bg-drakn-dark border border-drakn-graphite p-2 text-sm focus:outline-none focus:border-drakn-light" placeholder="e.g. 100% Japanese Wool"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Care Instructions</label>
                <textarea value={fashion.careInstructions} onChange={e => setFashion({...fashion, careInstructions: e.target.value})} className="w-full h-24 bg-drakn-dark border border-drakn-graphite p-2 text-sm focus:outline-none focus:border-drakn-light resize-none" placeholder="Dry clean only..."/>
              </div>
            </div>
          </section>

          {/* DRAKN PRIVATE */}
          <section className="bg-drakn-base border border-drakn-graphite p-6">
            <h2 className="text-xs uppercase tracking-widest text-drakn-light mb-6 font-bold border-b border-drakn-graphite pb-4">DRAKN PRIVATE</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={basic.isPrivate || false} onChange={e => setBasic({...basic, isPrivate: e.target.checked})} className="w-4 h-4 accent-drakn-light bg-drakn-dark border-drakn-graphite" />
                <span className="text-[10px] uppercase tracking-widest text-drakn-light">Is Private Product</span>
              </label>

              {basic.isPrivate && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Private Type</label>
                    <select 
                      value={basic.privateType || 'collection'} 
                      onChange={e => setBasic({...basic, privateType: e.target.value})}
                      className="w-full bg-drakn-dark border border-drakn-graphite p-3 text-xs uppercase tracking-widest focus:outline-none focus:border-drakn-light"
                    >
                      <option value="collection">Private Collection</option>
                      <option value="limited_edition">Limited Edition</option>
                      <option value="made_to_order">Made to Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Edition Status</label>
                    <input 
                      type="text" 
                      value={basic.editionStatus || ''} 
                      onChange={e => setBasic({...basic, editionStatus: e.target.value})}
                      className="w-full bg-drakn-dark border border-drakn-graphite p-2 text-xs uppercase tracking-widest focus:outline-none focus:border-drakn-light" 
                      placeholder="e.g. BY REQUEST, SOLD OUT"
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
