import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Images,
  Home,
  Store,
  Settings,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Calendar,
  Gift,
  Package,
  Users,
  MessageSquare,
  Tag,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  actions?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  actions,
}) => {
  const { adminEmail, role, logout } = useAuth();
  const { orders } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isStaff = role === "staff";
  const staffAllowedPaths = new Set([
    "/admin/dashboard",
    "/admin/menu",
    "/admin/orders",
    "/admin/inventory",
    "/admin/reservations",
    "/admin/cafe-info",
  ]);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Preparing"
  ).length;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const allNavItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Menu Items", path: "/admin/menu", icon: UtensilsCrossed },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag, badge: pendingOrdersCount },
    { name: "Inventory", path: "/admin/inventory", icon: Package },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
    { name: "Offers", path: "/admin/offers", icon: Tag },
    { name: "Gifting", path: "/admin/gifting", icon: Gift },
    { name: "Featured", path: "/admin/featured", icon: Star },
    { name: "Gallery", path: "/admin/gallery", icon: Images },
    { name: "Homepage", path: "/admin/homepage", icon: Home },
    { name: "Cafe Info", path: "/admin/cafe-info", icon: Store },
    { name: "Reservations", path: "/admin/reservations", icon: Calendar },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const navItems = isStaff
    ? allNavItems.filter((item) => staffAllowedPaths.has(item.path))
    : allNavItems;

  const isAccessDeniedForStaff = isStaff && !staffAllowedPaths.has(location.pathname);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#162820] flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#FAF6F0] border-b border-[#E2D9CC] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-[#162820] hover:text-[#0F3A23] rounded-lg hover:bg-white cursor-pointer"
            aria-label="Open sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-base tracking-widest uppercase text-[#0F3A23]">
              THE CLASSIC CRUSH
            </h1>
            <p className="text-[10px] tracking-widest uppercase font-semibold text-[#6E776F]">
              {isStaff ? "STAFF PORTAL" : "ADMIN PORTAL"}
            </p>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-[#6E776F] hover:text-[#0F3A23]"
          title="View customer website"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar on Desktop */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 bg-[#FAF6F0] border-r border-[#E2D9CC] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 h-screen ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#E2D9CC]">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-serif text-base font-bold tracking-[0.14em] uppercase text-[#0F3A23] block">
                THE CLASSIC CRUSH
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#0F3A23]">
                  {isStaff ? "STAFF PORTAL" : "ADMIN PORTAL"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-[#6E776F] hover:text-[#0F3A23]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? "bg-[#0F3A23] text-[#FAF6F0] shadow-xs font-semibold"
                    : "text-[#162820] hover:text-[#0F3A23] hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#C99742]" : "text-[#0F3A23]"}`} />
                  <span>{item.name}</span>
                </div>

                {typeof item.badge === "number" && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? "bg-[#C99742] text-[#0F3A23]" : "bg-[#E6F0EB] text-[#0F3A23]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E2D9CC] space-y-2 bg-[#FAF6F0]">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#6E776F] hover:text-[#0F3A23] hover:bg-white rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#0F3A23]" />
              <span>View Website</span>
            </span>
            <span className="text-[10px] text-[#C99742] font-semibold">Live ↗</span>
          </a>

          <div className="pt-2 border-t border-[#E2D9CC] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-medium text-[#0F3A23] truncate">
                  {adminEmail || (isStaff ? "Staff Member" : "Admin User")}
                </p>
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    isStaff ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-[#E6F0EB] text-[#0F3A23] border border-[#0F3A23]/20"
                  }`}
                >
                  {isStaff ? "Staff" : "Admin"}
                </span>
              </div>
              <p className="text-[10px] text-[#6E776F] font-light">
                {isStaff ? "Operations Staff" : "Cafe Owner / Admin"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#6E776F] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Sign out of portal"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex sticky top-0 z-30 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E2D9CC] px-8 py-4 items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0F3A23]">
              {pageTitle || "Admin Panel"}
            </h1>
            {pageSubtitle && (
              <p className="text-xs text-[#6E776F] font-light mt-0.5">
                {pageSubtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {actions}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E2D9CC] bg-white text-xs font-semibold uppercase tracking-wider text-[#0F3A23] hover:bg-[#FAF6F0] transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-[#0F3A23]" />
              <span>View Site</span>
            </a>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Mobile title if provided */}
          {pageTitle && (
            <div className="md:hidden mb-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-[#0F3A23]">
                  {pageTitle}
                </h1>
                {actions}
              </div>
              {pageSubtitle && (
                <p className="text-xs text-[#6E776F] font-light">
                  {pageSubtitle}
                </p>
              )}
            </div>
          )}

          {isAccessDeniedForStaff ? (
            <div className="bg-white rounded-2xl border border-[#E2D9CC] p-10 text-center max-w-lg mx-auto my-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                <X className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#0F3A23]">
                Access Restricted
              </h2>
              <p className="text-xs text-[#6E776F] font-light leading-relaxed">
                This administrative section (customers directory, offers, and settings) is strictly reserved for café management and owners. As a staff member, your access is focused on operational workflows.
              </p>
              <div className="pt-2">
                <NavLink
                  to="/admin/dashboard"
                  className="inline-block px-5 py-2.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#154D30] transition-colors"
                >
                  Return to Dashboard
                </NavLink>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
