/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const Collections = lazy(() => import('./pages/Collections').then(m => ({ default: m.Collections })));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail').then(m => ({ default: m.CollectionDetail })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const CustomerCare = lazy(() => import('./pages/CustomerCare').then(m => ({ default: m.CustomerCare })));
const Shipping = lazy(() => import('./pages/Shipping').then(m => ({ default: m.Shipping })));
const Returns = lazy(() => import('./pages/Returns').then(m => ({ default: m.Returns })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const PrivateLanding = lazy(() => import('./pages/private/PrivateLanding').then(m => ({ default: m.PrivateLanding })));
const PrivateCollection = lazy(() => import('./pages/private/PrivateCollection').then(m => ({ default: m.PrivateCollection })));
const PrivateLimitedEditions = lazy(() => import('./pages/private/PrivateLimitedEditions').then(m => ({ default: m.PrivateLimitedEditions })));
const PrivateMadeToOrder = lazy(() => import('./pages/private/PrivateMadeToOrder').then(m => ({ default: m.PrivateMadeToOrder })));
const PrivateCustomizer = lazy(() => import('./pages/private/PrivateCustomizer').then(m => ({ default: m.PrivateCustomizer })));
const AccountPrivate = lazy(() => import('./pages/private/AccountPrivate').then(m => ({ default: m.AccountPrivate })));

// Admin Lazy loaded pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const ProductList = lazy(() => import('./pages/admin/products/ProductList').then(m => ({ default: m.ProductList })));
const ProductForm = lazy(() => import('./pages/admin/products/ProductForm').then(m => ({ default: m.ProductForm })));
const Marketing = lazy(() => import('./pages/admin/Marketing').then(m => ({ default: m.Marketing })));
const CollectionsManager = lazy(() => import('./pages/admin/Collections').then(m => ({ default: m.CollectionsManager })));
const ReviewsManager = lazy(() => import('./pages/admin/Reviews').then(m => ({ default: m.ReviewsManager })));
const PagesManager = lazy(() => import('./pages/admin/PagesManager').then(m => ({ default: m.PagesManager })));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager').then(m => ({ default: m.SettingsManager })));
const PrivateManager = lazy(() => import('./pages/admin/PrivateManager').then(m => ({ default: m.PrivateManager })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-drakn-base">
      <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
    </div>
  );
}

function StorefrontRoutes() {
  const location = useLocation();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/private" element={<AccountPrivate />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:slug" element={<CollectionDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/customer-care" element={<CustomerCare />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/private" element={<PrivateLanding />} />
            <Route path="/private/collection" element={<PrivateCollection />} />
            <Route path="/private/limited-editions" element={<PrivateLimitedEditions />} />
            <Route path="/private/made-to-order" element={<PrivateMadeToOrder />} />
            <Route path="/private/request/:id" element={<PrivateCustomizer />} />
            <Route path="*" element={<div className="h-[70vh] flex items-center justify-center text-drakn-muted uppercase tracking-widest">404 / Object Not Found</div>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="collections" element={<CollectionsManager />} />
            <Route path="reviews" element={<ReviewsManager />} />
            <Route path="pages" element={<PagesManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="private" element={<PrivateManager />} />
            <Route path="*" element={<div className="p-8 text-drakn-muted uppercase tracking-widest">Module under construction</div>} />
          </Route>

          {/* CUSTOMER STOREFRONT ROUTES */}
          <Route path="/*" element={<StorefrontRoutes />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
