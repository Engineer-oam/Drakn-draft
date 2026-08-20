import { usePageData } from '../hooks/usePageData';
import { PageTransition } from '../components/PageTransition';
import { OptimizedImage } from '../components/OptimizedImage';

interface CMSPageTemplateProps {
  pageId: string;
  defaultTitle: string;
}

export function CMSPageTemplate({ pageId, defaultTitle }: CMSPageTemplateProps) {
  const { data, loading } = usePageData(pageId);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="pt-32 pb-24 max-w-[800px] mx-auto px-6 md:px-12 min-h-screen">
        <header className="mb-16">
          <h1 className="text-3xl md:text-5xl font-display uppercase tracking-[0.2em] text-drakn-light mb-6">
            {data?.title || defaultTitle}
          </h1>
          {data?.subtitle && (
            <p className="text-drakn-muted text-sm md:text-base leading-relaxed tracking-wider">
              {data.subtitle}
            </p>
          )}
        </header>

        {!data?.sections || data.sections.length === 0 ? (
          <div className="border border-drakn-light/20 p-12 text-center text-drakn-muted uppercase tracking-widest text-xs">
            This information is currently being updated.
          </div>
        ) : (
          <div className="space-y-16">
            {data.sections.map((section, idx) => (
              <section key={idx} className="prose prose-invert max-w-none">
                {section.heading && (
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-drakn-light mb-6 border-b border-drakn-light/10 pb-4">
                    {section.heading}
                  </h2>
                )}
                <div 
                  className="text-drakn-muted text-sm leading-relaxed tracking-wide space-y-4 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </section>
            ))}
          </div>
        )}
        
        {data?.updatedAt && (
          <div className="mt-24 pt-8 border-t border-drakn-graphite text-[10px] uppercase tracking-widest text-drakn-muted">
            Last Updated: {new Date(data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
