import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useApp } from "../../context";

export default function AdminLayout() {
  const { user, isAdmin, isSuper, logout } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className={`admin ${isSuper ? "theme-super" : "theme-admin"}`}>
      <aside className="sidebar">
        <div className="side-brand">
          <b>Bigdots</b>
          <span className={`role-pill ${isSuper ? "gold" : "blue"}`}>
            {isSuper ? "Super Admin" : "Store Admin"}
          </span>
        </div>
        <p className="side-user">@{user.username}</p>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/categories">Categories</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        {isSuper && <NavLink to="/admin/payments">Payments</NavLink>}
        {isSuper && <NavLink to="/admin/users">Users</NavLink>}
        {isSuper && <NavLink to="/admin/settings">Settings</NavLink>}
        <NavLink to="/">Back to shop</NavLink>
        <button onClick={logout}>Logout</button>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <div>
            <p className="admin-kicker">{isSuper ? "Owner access" : "Store access"}</p>
            <h1>{isSuper ? "Owner console" : "Store operations"}</h1>
            <p>
              {isSuper
                ? "Full control: users, refunds, settings and catalogue deletes."
                : "You can manage catalogue and shipments. Users, refunds and deletes stay with super admin."}
            </p>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
