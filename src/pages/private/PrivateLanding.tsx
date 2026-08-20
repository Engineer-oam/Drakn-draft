import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageTransition } from '../../components/PageTransition';
import { usePageData } from '../../hooks/usePageData';

export function PrivateLanding() {
  const { data, loading } = usePageData('private-landing');
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-[#D4CFC9] rounded-full animate-spin"></div>
      </div>
    );
  }

  const statement = data?.subtitle || "Made beyond the ordinary.";
  
  const sections = [
    { title: "Private Collection", path: "/private/collection" },
    { title: "Limited Editions", path: "/private/limited-editions" },
    { title: "Made to Order", path: "/private/made-to-order" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-[#F4F0EB] selection:bg-[#F4F0EB] selection:text-[#050505] flex flex-col relative overflow-hidden">
        {/* Grain overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-[0.02] blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-20">
          <motion.h1 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-display tracking-[0.3em] uppercase mb-12"
          >
            DRAKN PRIVATE
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-xs md:text-sm tracking-[0.2em] uppercase text-[#A39E98] max-w-lg mb-24"
          >
            {statement}
          </motion.p>
          
          <div className="flex flex-col gap-8 md:gap-12 w-full max-w-sm">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2 + (idx * 0.2), ease: "easeOut" }}
              >
                <Link 
                  to={section.path}
                  className="block text-sm md:text-base uppercase tracking-[0.2em] text-[#D4CFC9] hover:text-white transition-colors duration-500 relative group py-2"
                >
                  <span className="relative z-10">{section.title}</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-700 ease-out group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
