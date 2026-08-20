import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Link } from 'react-router-dom';
import { PackageOpen, Plus, MoreHorizontal, Eye, EyeOff, Archive, Edit } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';

export function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: newStatus,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update product status.");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-drakn-base w-1/4 mb-8"></div>
      {[1,2,3,4].map(i => <div key={i} className="h-16 bg-drakn-base w-full"></div>)}
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest mb-2">Catalog</h1>
          <p className="text-sm text-drakn-muted">Manage the DRAKN product portfolio.</p>
        </div>
        <Link 
          to="/admin/products/new" 
          className="flex items-center gap-2 bg-drakn-light text-drakn-base px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-drakn-muted transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-drakn-graphite p-20 flex flex-col items-center justify-center text-center bg-drakn-base/50"
        >
          <PackageOpen size={48} className="text-drakn-graphite mb-6" />
          <h2 className="text-xl font-display uppercase tracking-widest mb-3 text-drakn-muted">Empty Catalogue</h2>
          <p className="text-sm text-drakn-graphite max-w-md">
            The database currently holds no product records. Initialize the collection to populate the customer storefront.
          </p>
        </motion.div>
      ) : (
        <div className="bg-drakn-base border border-drakn-graphite overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-drakn-muted bg-drakn-dark/50 border-b border-drakn-graphite">
              <tr>
                <th className="px-6 py-4 font-normal">Product</th>
                <th className="px-6 py-4 font-normal">Category</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-drakn-graphite">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-drakn-dark/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold tracking-wide">{product.name}</div>
                    <div className="text-xs text-drakn-muted mt-1">{product.fit} • {product.material}</div>
                  </td>
                  <td className="px-6 py-4 text-drakn-muted">
                    {product.categoryId || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] uppercase tracking-widest px-2 py-1 border",
                      product.status === 'active' ? "border-green-900/50 text-green-500 bg-green-950/20" :
                      product.status === 'archived' ? "border-red-900/50 text-red-500 bg-red-950/20" :
                      "border-drakn-graphite text-drakn-muted bg-drakn-dark"
                    )}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {product.status === 'active' ? (
                        <button onClick={() => handleStatusChange(product.id, 'draft')} title="Unpublish" className="text-drakn-muted hover:text-orange-400">
                          <EyeOff size={16} />
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(product.id, 'active')} title="Publish" className="text-drakn-muted hover:text-green-400">
                          <Eye size={16} />
                        </button>
                      )}
                      <button onClick={() => handleStatusChange(product.id, 'archived')} title="Archive" className="text-drakn-muted hover:text-red-400">
                        <Archive size={16} />
                      </button>
                      <Link to={`/admin/products/${product.id}`} className="text-drakn-muted hover:text-drakn-light ml-2">
                        <Edit size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
