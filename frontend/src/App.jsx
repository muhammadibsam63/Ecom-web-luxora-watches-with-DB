import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AccountLayout from './layouts/AccountLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Collections from './pages/Collections';
import BuildYourWatch from './pages/BuildYourWatch';
import Journal from './pages/Journal';
import About from './pages/About';
import Contact from './pages/Contact';
import InfoPage from './pages/InfoPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import AccountOverview from './pages/account/AccountOverview';
import AccountProfile from './pages/account/AccountProfile';
import AccountOrders from './pages/account/AccountOrders';
import AccountOrderDetail from './pages/account/AccountOrderDetail';
import AccountAddresses from './pages/account/AccountAddresses';
import AccountSettings from './pages/account/AccountSettings';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCollections from './pages/admin/AdminCollections';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMessages from './pages/admin/AdminMessages';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/build-your-watch" element={<BuildYourWatch />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<InfoPage pageKey="faq" />} />
        <Route path="/shipping" element={<InfoPage pageKey="shipping" />} />
        <Route path="/returns" element={<InfoPage pageKey="returns" />} />
        <Route path="/warranty" element={<InfoPage pageKey="warranty" />} />
        <Route path="/privacy" element={<InfoPage pageKey="privacy" />} />
        <Route path="/terms" element={<InfoPage pageKey="terms" />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<AccountLayout />}>
        <Route path="/account" element={<AccountOverview />} />
        <Route path="/account/profile" element={<AccountProfile />} />
        <Route path="/account/orders" element={<AccountOrders />} />
        <Route path="/account/orders/:id" element={<AccountOrderDetail />} />
        <Route path="/account/addresses" element={<AccountAddresses />} />
        <Route path="/account/settings" element={<AccountSettings />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="activity-log" element={<AdminActivityLog />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}
