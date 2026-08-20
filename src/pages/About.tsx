import { usePageData } from '../hooks/usePageData';
import { PageTransition } from '../components/PageTransition';
import { OptimizedImage } from '../components/OptimizedImage';
import { motion } from 'motion/react';

export function About() {
  const { data, loading } = usePageData('about');

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
      </div>
    );
  }

  const sections = data?.sections || [];

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen">
        
        {/* Editorial Header */}
        <header className="max-w-[1600px] mx-auto px-6 md:px-12 mb-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-display uppercase tracking-[0.2em] text-drakn-light mb-8"
          >
            {data?.title || 'ABOUT DRAKN'}
          </motion.h1>
          {data?.subtitle && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-drakn-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed tracking-wider uppercase"
            >
              {data.subtitle}
            </motion.p>
          )}
        </header>

        {sections.length === 0 ? (
          <div className="max-w-[800px] mx-auto px-6 md:px-12">
            <div className="border border-drakn-light/20 p-12 text-center text-drakn-muted uppercase tracking-widest text-xs">
              Brand story is currently being updated.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-32">
            {sections.map((section, idx) => (
              <section key={idx} className={`max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`col-span-1 md:col-span-6 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="aspect-[4/5] bg-drakn-graphite w-full relative overflow-hidden">
                    {/* If there was an image field we would use it here. Since our PageData is generic for now, we'll assume there is an image field on about sections if added later, or we can use a placeholder pattern */}
                    <div className="absolute inset-0 bg-drakn-light/5 flex items-center justify-center">
                      <span className="text-drakn-muted text-[10px] uppercase tracking-widest">Editorial Image Placeholder</span>
                    </div>
                  </div>
                </div>
                <div className={`col-span-1 md:col-span-5 ${idx % 2 === 1 ? 'md:order-1 md:col-start-2' : 'md:col-start-8'}`}>
                  {section.heading && (
                    <h2 className="text-2xl font-display uppercase tracking-[0.15em] text-drakn-light mb-6">
                      {section.heading}
                    </h2>
                  )}
                  <div 
                    className="text-drakn-muted text-sm leading-relaxed tracking-wide space-y-4 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: section.body }}
                  />
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
