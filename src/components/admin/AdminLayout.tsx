import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Star, 
  Megaphone, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronDown,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

function NavGroup({ title, icon: Icon, items, activePath }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const isActiveGroup = items.some((item: any) => activePath.startsWith(item.path));

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full text-[10px] uppercase tracking-widest mb-3 hover:text-drakn-light transition-colors",
          isActiveGroup ? "text-drakn-light font-bold" : "text-drakn-muted"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={14} />
          <span>{title}</span>
        </div>
        <ChevronDown size={12} className={cn("transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      
      {isOpen && (
        <ul className="flex flex-col gap-1 pl-6 border-l border-drakn-graphite ml-2">
          {items.map((item: any) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "block py-1.5 text-xs transition-colors relative",
                  activePath === item.path ? "text-drakn-light font-medium" : "text-drakn-muted hover:text-drakn-light"
                )}
              >
                {activePath === item.path && (
                  <motion.div layoutId="activeNavLine" className="absolute left-[-25px] top-0 bottom-0 w-[2px] bg-drakn-light" />
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-drakn-base flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-drakn-light rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const navStructure = [
    {
      title: "Catalog",
      icon: Package,
      items: [
        { label: "Products", path: "/admin/products" },
        { label: "Add Product", path: "/admin/products/new" },
        { label: "Categories", path: "/admin/categories" },
        { label: "Collections", path: "/admin/collections" },
        { label: "Inventory", path: "/admin/inventory" },
      ]
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      items: [
        { label: "All Orders", path: "/admin/orders" },
        { label: "Pending", path: "/admin/orders/pending" },
        { label: "Returns", path: "/admin/orders/returns" },
      ]
    },
    {
      title: "Storefront",
      icon: Megaphone,
      items: [
        { label: "Content & Coupons", path: "/admin/marketing" },
        { label: "Pages Content", path: "/admin/pages" },
      ]
    },
    {
      title: "Private",
      icon: Star,
      items: [
        { label: "Atelier", path: "/admin/private" },
      ]
    },
    {
      title: "Community",
      icon: Users,
      items: [
        { label: "Customers", path: "/admin/customers" },
        { label: "Reviews", path: "/admin/reviews" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-drakn-dark text-drakn-light font-body selection:bg-drakn-light selection:text-drakn-base">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-drakn-base border-r border-drakn-graphite flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-drakn-graphite flex items-center justify-between">
          <Link to="/admin" className="font-display font-bold text-xl tracking-widest text-drakn-light">
            DRAKN <span className="text-drakn-muted text-[10px] block mt-1 tracking-[0.3em]">Operations</span>
          </Link>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 scrollbar-hide">
          <Link 
            to="/admin"
            className={cn(
              "flex items-center gap-3 text-[10px] uppercase tracking-widest mb-8 hover:text-drakn-light transition-colors",
              location.pathname === "/admin" ? "text-drakn-light font-bold" : "text-drakn-muted"
            )}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </Link>

          {navStructure.map((group) => (
            <NavGroup 
              key={group.title}
              title={group.title}
              icon={group.icon}
              items={group.items}
              activePath={location.pathname}
            />
          ))}

          <Link 
            to="/admin/customers"
            className={cn(
              "flex items-center gap-3 text-[10px] uppercase tracking-widest mb-6 hover:text-drakn-light transition-colors",
              location.pathname.startsWith("/admin/customers") ? "text-drakn-light font-bold" : "text-drakn-muted"
            )}
          >
            <Users size={14} />
            <span>Customers</span>
          </Link>

          <Link 
            to="/admin/analytics"
            className={cn(
              "flex items-center gap-3 text-[10px] uppercase tracking-widest mb-6 hover:text-drakn-light transition-colors",
              location.pathname.startsWith("/admin/analytics") ? "text-drakn-light font-bold" : "text-drakn-muted"
            )}
          >
            <BarChart3 size={14} />
            <span>Analytics</span>
          </Link>

          <Link 
            to="/admin/settings"
            className={cn(
              "flex items-center gap-3 text-[10px] uppercase tracking-widest hover:text-drakn-light transition-colors",
              location.pathname.startsWith("/admin/settings") ? "text-drakn-light font-bold" : "text-drakn-muted"
            )}
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>
        </div>

        <div className="p-6 border-t border-drakn-graphite">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[140px]">{user.displayName || user.email}</span>
              <span className="text-[10px] text-drakn-muted uppercase tracking-wider">Administrator</span>
            </div>
            <button 
              onClick={logout}
              className="text-drakn-muted hover:text-drakn-light transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-drakn-graphite bg-drakn-base/50 backdrop-blur-sm sticky top-0 z-20 flex items-center px-8 justify-between">
          <div className="flex items-center gap-4 text-xs text-drakn-muted uppercase tracking-widest">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex gap-4">
            <Link to="/" target="_blank" className="text-xs uppercase tracking-widest font-bold border border-drakn-graphite px-4 py-2 hover:bg-drakn-light hover:text-drakn-base transition-colors flex items-center gap-2">
              View Storehouse
            </Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

    </div>
  );
}
