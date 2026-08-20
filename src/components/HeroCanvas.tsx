import { Canvas } from '@react-three/fiber';
import { Environment, Float, PresentationControls } from '@react-three/drei';
import React, { Suspense, useEffect, useState, Component, ReactNode } from 'react';
import { AbstractSculpture } from './AbstractSculpture';

class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('WebGL or Canvas error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return <>{this.props.children}</>;
  }
}

export function HeroCanvas() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (isReducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <ErrorBoundary fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 30], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <PresentationControls
              global
              snap={true}
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <AbstractSculpture />
              </Float>
            </PresentationControls>
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
