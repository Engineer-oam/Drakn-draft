import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  lowResSrc?: string;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, className = '', lowResSrc, priority = false, ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If user prefers reduced motion, disable transitions
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsLoaded(true);
    }

    if (priority) {
      setIsInView(true);
      return;
    }

    const currentRef = imgRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          if (currentRef) observer.unobserve(currentRef);
        }
      },
      { rootMargin: '200px' } // Pre-load slightly earlier
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority]);

  if (!src) return <div className={`bg-drakn-charcoal/30 ${className}`} />;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {lowResSrc && !isLoaded && (
        <img
          src={lowResSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover filter blur-sm will-change-opacity"
          aria-hidden="true"
        />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 will-change-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          {...props}
        />
      )}
      {!isInView && !lowResSrc && (
        <div className="w-full h-full bg-drakn-charcoal/30 animate-pulse" />
      )}
    </div>
  );
}
