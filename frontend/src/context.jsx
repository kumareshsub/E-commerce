import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [site, setSite] = useState({
    store_name: "Bigdots",
    email: "kumareshtfc@gmail.com",
    phone: "+916379149227",
    website: "https://www.decathlon.in/",
    address: "Chennai, Tamil Nadu",
    whatsapp: "916379149227",
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const refreshShop = async () => {
    if (!getToken()) {
      setCart([]);
      setWishlist([]);
      return;
    }
    try {
      const [cartData, wishData] = await Promise.all([api("/api/cart"), api("/api/wishlist")]);
      setCart(cartData);
      setWishlist(wishData);
    } catch {
      setCart([]);
      setWishlist([]);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const [cats, siteData] = await Promise.all([api("/api/categories"), api("/api/site")]);
        setCategories(Array.isArray(cats) ? cats : []);
        if (siteData) setSite(siteData);
        if (getToken()) {
          try {
            const me = await api("/api/auth/me");
            setUser(me);
            await refreshShop();
          } catch {
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  const login = async (username, password) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.access_token);
    setUser(data.user);
    await refreshShop();
    notify(`Welcome back, ${data.user.full_name || data.user.username}`);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(data.access_token);
    setUser(data.user);
    await refreshShop();
    notify("Account created. Start shopping!");
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    notify("Logged out successfully", "info");
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error("Login to add items to cart");
    await api("/api/cart", { method: "POST", body: JSON.stringify({ product_id: productId, quantity }) });
    await refreshShop();
    notify("Added to cart");
  };

  const updateCartQty = async (itemId, quantity) => {
    await api(`/api/cart/${itemId}`, { method: "PUT", body: JSON.stringify({ quantity }) });
    await refreshShop();
  };

  const removeCart = async (itemId) => {
    await api(`/api/cart/${itemId}`, { method: "DELETE" });
    await refreshShop();
    notify("Removed from cart", "info");
  };

  const toggleWishlist = async (productId) => {
    if (!user) throw new Error("Login to save favourites");
    const existing = wishlist.find((item) => item.product_id === productId);
    if (existing) {
      await api(`/api/wishlist/${existing.id}`, { method: "DELETE" });
      notify("Removed from wishlist", "info");
    } else {
      await api("/api/wishlist", { method: "POST", body: JSON.stringify({ product_id: productId }) });
      notify("Saved to wishlist");
    }
    await refreshShop();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.product.selling_price, 0);

  const value = useMemo(
    () => ({
      user,
      setUser,
      cart,
      wishlist,
      categories,
      site,
      setSite,
      toast,
      loading,
      notify,
      login,
      register,
      logout,
      addToCart,
      updateCartQty,
      removeCart,
      toggleWishlist,
      refreshShop,
      cartCount,
      cartTotal,
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
      isSuper: user?.role === "superadmin",
    }),
    [user, cart, wishlist, categories, site, toast, loading, cartCount, cartTotal]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
