import { ReactNode } from 'react';
import { CustomCursor } from './CustomCursor';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './shop/CartDrawer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-drakn-base text-drakn-light selection:bg-drakn-light selection:text-drakn-base font-body overflow-x-hidden">
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
