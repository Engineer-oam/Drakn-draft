import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Menu, X, Heart, User as UserIcon } from 'lucide-react';
import { useStore } from '../store';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export function Navbar() {
  const { isMenuOpen, toggleMenu, setMenuOpen, setCursorVariant } = useStore();
  const { toggleCart, items } = useCartStore();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, setMenuOpen]);

  const navLinks = [
    { name: 'New Arrivals', path: '/shop/new' },
    { name: 'Clothing', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'Best Sellers', path: '/shop/best-sellers' },
    { name: 'DRAKN PRIVATE', path: '/private', private: true },
    { name: 'Sale', path: '/shop/sale' },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-40 transition-colors duration-500",
          scrolled || isMenuOpen ? "bg-drakn-base/90 backdrop-blur-md border-b border-drakn-graphite" : "bg-transparent"
        )}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          
          {/* Left: Menu Toggle & Branding */}
          <div className="w-5/12 lg:w-1/3 flex items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 -ml-2 mr-4 md:mr-6 text-drakn-light hover:text-white transition-colors"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              {isMenuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
            </button>
            <Link 
              to="/"
              className="text-2xl md:text-3xl font-display font-bold tracking-[0.2em] leading-none text-drakn-light"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              DRAKN
            </Link>
          </div>

          {/* Center: Empty */}
          <div className="w-2/12 lg:w-1/3 flex justify-center">
          </div>

          {/* Right: Actions */}
          <div className="w-1/3 flex justify-end items-center gap-4 lg:gap-6">
            <button 
              className="hidden md:flex items-center gap-2 text-[10px] lg:text-xs uppercase tracking-[0.15em] font-medium text-drakn-muted hover:text-drakn-light transition-colors"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <Search size={16} strokeWidth={1.5} />
              <span className="hidden lg:inline">Search</span>
            </button>
            {user ? (
              <Link
                to="/account"
                className="hidden md:block text-[10px] lg:text-xs uppercase tracking-[0.15em] font-medium text-drakn-muted hover:text-drakn-light transition-colors"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                Account
              </Link>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="hidden md:block text-[10px] lg:text-xs uppercase tracking-[0.15em] font-medium text-drakn-muted hover:text-drakn-light transition-colors"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                Sign In
              </button>
            )}
            <Link
              to="/wishlist"
              className="hidden md:block text-drakn-muted hover:text-drakn-light transition-colors"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <Heart size={20} strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => toggleCart(true)}
              className="flex items-center gap-2 text-drakn-light hover:text-white transition-colors"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="text-xs font-medium w-4 h-4 rounded-full bg-drakn-light text-drakn-base flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile/Tablet Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-30 bg-drakn-base pt-24 px-6 pb-6 flex flex-col"
          >
            <div className="flex flex-col gap-6 mt-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      "text-3xl font-display uppercase tracking-[0.1em]",
                      link.name === 'Sale' ? "text-red-900" : "text-drakn-light"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto border-t border-drakn-graphite pt-6 flex flex-col gap-4">
              <Link to="/account" className="text-sm uppercase tracking-widest text-drakn-muted">Account</Link>
              <Link to="/wishlist" className="text-sm uppercase tracking-widest text-drakn-muted">Wishlist</Link>
              <Link to="/search" className="text-sm uppercase tracking-widest text-drakn-muted">Search</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
