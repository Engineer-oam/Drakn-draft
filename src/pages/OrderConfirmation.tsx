import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export function OrderConfirmation() {
  const { id } = useParams();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-32 flex flex-col items-center justify-center px-6">
        <div className="text-drakn-light mb-8">
          <CheckCircle size={64} strokeWidth={1} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-center mb-6">Order Confirmed</h1>
        
        <p className="text-drakn-muted uppercase tracking-widest text-sm text-center mb-2">
          Thank you for your purchase.
        </p>
        
        <p className="text-drakn-muted uppercase tracking-widest text-sm text-center mb-12">
          Order No. <span className="text-drakn-light font-bold">{id}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/shop" 
            className="border border-drakn-light/20 px-8 py-4 text-xs uppercase tracking-[0.2em] hover:border-drakn-light hover:bg-drakn-light/5 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
