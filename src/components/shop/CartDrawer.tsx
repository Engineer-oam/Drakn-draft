import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import { OptimizedImage } from '../OptimizedImage';

export function CartDrawer() {
  const { isCartOpen, toggleCart, items, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const handleCheckoutClick = () => {
    toggleCart(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 bg-drakn-base/80 backdrop-blur-sm z-50 cursor-pointer"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-drakn-base border-l border-drakn-light/10 z-50 flex flex-col font-body"
          >
            {/* Header */}
            <div className="p-6 border-b border-drakn-light/10 flex justify-between items-center">
              <h2 className="text-xl font-display uppercase tracking-widest text-drakn-light">Bag ({items.length})</h2>
              <button onClick={() => toggleCart(false)} className="text-drakn-muted hover:text-drakn-light transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-drakn-muted">
                  <p className="uppercase tracking-widest text-sm mb-4">Your bag is empty.</p>
                  <button onClick={() => toggleCart(false)} className="text-drakn-light uppercase text-xs tracking-widest border-b border-drakn-light pb-1">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 aspect-[3/4] bg-drakn-dark flex-shrink-0">
                      {item.imageUrl && <OptimizedImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-luminosity" />}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-display uppercase tracking-wider text-sm">{item.name}</h3>
                        <p className="text-sm font-medium">{formatter.format(item.price * item.quantity)}</p>
                      </div>
                      <p className="text-xs text-drakn-muted uppercase tracking-widest mb-4">
                        {item.color} / {item.size}
                      </p>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center border border-drakn-light/20">
                          <button 
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="p-2 hover:bg-drakn-light/10 text-drakn-muted hover:text-drakn-light transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-drakn-light/10 text-drakn-muted hover:text-drakn-light transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] uppercase tracking-widest text-drakn-muted hover:text-drakn-light transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-drakn-light/10 bg-drakn-base">
                <div className="flex justify-between items-center mb-6 text-sm uppercase tracking-widest text-drakn-light">
                  <span>Subtotal</span>
                  <span>{formatter.format(subtotal)}</span>
                </div>
                <p className="text-xs text-drakn-muted mb-6">Shipping & taxes calculated at checkout.</p>
                <button 
                  onClick={handleCheckoutClick}
                  className="w-full bg-drakn-light text-drakn-base font-bold uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-2 hover:bg-white transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
