import { usePageData } from '../hooks/usePageData';
import { PageTransition } from '../components/PageTransition';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function CustomerCare() {
  const { data, loading } = usePageData('customer-care');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
      </div>
    );
  }

  const faqs = data?.sections || [];

  return (
    <PageTransition>
      <div className="pt-32 pb-24 max-w-[800px] mx-auto px-6 md:px-12 min-h-screen">
        <header className="mb-24 md:text-center">
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-[0.2em] text-drakn-light mb-6">
            {data?.title || 'CUSTOMER CARE'}
          </h1>
          <p className="text-drakn-muted text-sm tracking-widest uppercase">
            {data?.subtitle || 'How can we assist you?'}
          </p>
        </header>

        {faqs.length === 0 ? (
          <div className="border border-drakn-light/20 p-12 text-center text-drakn-muted uppercase tracking-widest text-xs mb-16">
            Support information is currently being updated.
          </div>
        ) : (
          <div className="mb-24">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-drakn-light mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-drakn-graphite">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-drakn-light/5 transition-colors"
                  >
                    <span className="text-xs uppercase tracking-widest text-drakn-light">{faq.heading}</span>
                    <ChevronDown size={16} className={`text-drakn-muted transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-6 pt-0 text-sm text-drakn-muted leading-relaxed tracking-wide whitespace-pre-wrap">
                      <div dangerouslySetInnerHTML={{ __html: faq.body }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-drakn-graphite pt-16">
          <div className="border border-drakn-graphite p-8 hover:bg-drakn-light/5 transition-colors group">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-drakn-light mb-4">Contact Studio</h3>
            <p className="text-sm text-drakn-muted mb-8 leading-relaxed">Require further assistance? Reach out to our client services team directly.</p>
            <Link to="/contact" className="flex items-center gap-2 text-xs uppercase tracking-widest text-drakn-light group-hover:text-white transition-colors">
              Send a Message <ArrowRight size={14} />
            </Link>
          </div>
          <div className="border border-drakn-graphite p-8 hover:bg-drakn-light/5 transition-colors group">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-drakn-light mb-4">Returns & Exchanges</h3>
            <p className="text-sm text-drakn-muted mb-8 leading-relaxed">Review our return policy and initiate a return process.</p>
            <Link to="/returns" className="flex items-center gap-2 text-xs uppercase tracking-widest text-drakn-light group-hover:text-white transition-colors">
              View Policy <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
