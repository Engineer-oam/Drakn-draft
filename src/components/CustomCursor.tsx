import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useStore } from '../store';

export function CustomCursor() {
  const { cursorVariant } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth out the movement
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse)
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || isReducedMotion) {
      document.body.classList.remove('custom-cursor-enabled');
      return;
    }

    document.body.classList.add('custom-cursor-enabled');
    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: 'var(--color-drakn-light)',
      mixBlendMode: 'difference' as any,
      x: '-50%',
      y: '-50%',
      opacity: 1,
    },
    hover: {
      width: 48,
      height: 48,
      backgroundColor: 'transparent',
      border: '1px solid var(--color-drakn-light)',
      mixBlendMode: 'difference' as any,
      x: '-50%',
      y: '-50%',
      opacity: 1,
    },
    explore: {
      width: 80,
      height: 80,
      backgroundColor: 'var(--color-drakn-light)',
      mixBlendMode: 'normal' as any,
      x: '-50%',
      y: '-50%',
      opacity: 1,
    },
    view: {
      width: 80,
      height: 80,
      backgroundColor: 'var(--color-drakn-base)',
      border: '1px solid var(--color-drakn-light)',
      mixBlendMode: 'normal' as any,
      x: '-50%',
      y: '-50%',
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    }
  };

  const getLabel = () => {
    if (cursorVariant === 'explore') return 'EXPLORE';
    if (cursorVariant === 'view') return 'VIEW';
    return '';
  };

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none rounded-full flex items-center justify-center font-display text-[10px] tracking-widest text-drakn-base"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
      variants={variants}
      animate={cursorVariant}
      initial="hidden"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: (cursorVariant === 'explore' || cursorVariant === 'view') ? 1 : 0 }}
        className={cursorVariant === 'view' ? 'text-drakn-light' : 'text-drakn-base'}
      >
        {getLabel()}
      </motion.span>
    </motion.div>
  );
}
