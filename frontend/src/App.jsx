import { Navigate, Route, Routes } from "react-router-dom";
import Navbar, { ContactFloat, Footer, Toast } from "./components/Layout";
import { useApp } from "./context";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Contact from "./pages/Contact";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminPayments from "./pages/admin/Payments";
import AdminSettings from "./pages/admin/Settings";

function StoreLayout({ children }) {
  return (
    <div className="page">
      <Navbar />
      <main className="main">{children}</main>
      <Footer />
      <ContactFloat />
    </div>
  );
}

function SuperOnly({ children }) {
  const { isSuper } = useApp();
  if (!isSuper) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  const { loading } = useApp();
  if (loading) return <div className="empty">Loading Bigdots…</div>;

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<SuperOnly><AdminUsers /></SuperOnly>} />
          <Route path="payments" element={<SuperOnly><AdminPayments /></SuperOnly>} />
          <Route path="settings" element={<SuperOnly><AdminSettings /></SuperOnly>} />
        </Route>
        <Route path="/*" element={
          <StoreLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:slug" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </StoreLayout>
        } />
      </Routes>
      <Toast />
    </>
  );
}
