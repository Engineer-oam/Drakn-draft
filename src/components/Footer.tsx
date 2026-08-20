import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowRight, Check } from 'lucide-react';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Footer() {
  const { setCursorVariant } = useStore();
  const handleHover = () => setCursorVariant('hover');
  const handleLeave = () => setCursorVariant('default');
  const { settings } = useStoreSettings();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Check if already subscribed
      const q = query(collection(db, 'newsletter'), where('email', '==', email.toLowerCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setSubscribed(true);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'newsletter'), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
      });
      
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error("Newsletter subscription error", err);
      setError('Failed to subscribe. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-drakn-base pt-32 pb-12 border-t border-drakn-graphite relative z-10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
          
          <div className="col-span-1 md:col-span-4">
            <h2 className="text-4xl font-display font-bold tracking-[0.2em] mb-6 text-drakn-light">DRAKN</h2>
            <p className="text-sm text-drakn-muted leading-relaxed max-w-xs mb-8">
              {settings?.about?.shortDescription || "Premium contemporary menswear. Designed with architectural precision and timeless minimalism."}
            </p>
            <div className="flex gap-6">
              {settings?.social?.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noreferrer" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="text-drakn-muted hover:text-drakn-light transition-colors">
                  Instagram
                </a>
              )}
              {settings?.social?.twitter && (
                <a href={settings.social.twitter} target="_blank" rel="noreferrer" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="text-drakn-muted hover:text-drakn-light transition-colors">
                  Twitter
                </a>
              )}
              {settings?.social?.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noreferrer" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="text-drakn-muted hover:text-drakn-light transition-colors">
                  Facebook
                </a>
              )}
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold mb-6 text-drakn-light">Explore</h4>
            <ul className="flex flex-col gap-4 text-xs tracking-widest text-drakn-muted uppercase">
              <li><Link to="/shop" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="hover:text-drakn-light transition-colors">Shop</Link></li>
              <li><Link to="/about" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="hover:text-drakn-light transition-colors">About DRAKN</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold mb-6 text-drakn-light">Support</h4>
            <ul className="flex flex-col gap-4 text-xs tracking-widest text-drakn-muted uppercase">
              <li><Link to="/customer-care" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="hover:text-drakn-light transition-colors">Customer Care</Link></li>
              <li><Link to="/shipping" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="hover:text-drakn-light transition-colors">Shipping</Link></li>
              <li><Link to="/returns" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="hover:text-drakn-light transition-colors">Returns</Link></li>
              <li><Link to="/contact" onMouseEnter={handleHover} onMouseLeave={handleLeave} className="hover:text-drakn-light transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4">
            <h4 className="text-[10px] uppercase tracking-[0.15em] font-bold mb-6 text-drakn-light">Newsletter</h4>
            <p className="text-sm text-drakn-muted mb-6 max-w-sm">Subscribe for exclusive access to new collections and private sales.</p>
            
            {subscribed ? (
              <div className="flex items-center gap-3 text-green-500 uppercase tracking-widest text-xs py-3 border-b border-drakn-graphite">
                <Check size={16} /> Subscribed Successfully
              </div>
            ) : (
              <form className="flex border-b border-drakn-graphite pb-3 group relative" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS" 
                  className="bg-transparent border-none outline-none text-xs flex-grow placeholder:text-drakn-graphite uppercase tracking-[0.2em] text-drakn-light"
                  onMouseEnter={handleHover} 
                  onMouseLeave={handleLeave}
                  disabled={submitting}
                />
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="text-drakn-muted group-hover:text-drakn-light transition-colors disabled:opacity-50"
                  onMouseEnter={handleHover} 
                  onMouseLeave={handleLeave}
                >
                  <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </form>
            )}
            {error && <p className="text-red-500 mt-3 text-[10px] uppercase tracking-widest">{error}</p>}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 border-t border-drakn-graphite text-[10px] tracking-widest text-drakn-muted uppercase">
          <p>&copy; {new Date().getFullYear()} DRAKN. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-drakn-light transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-drakn-light transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
