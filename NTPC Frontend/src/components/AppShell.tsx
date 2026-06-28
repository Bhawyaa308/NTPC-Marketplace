import { useState, useEffect, type ReactNode } from "react";
import { fetchProfile } from "../services/profile.service";
import React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  User,
  Store,
  Truck,
  Heart,
  BookmarkCheck,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Bell,
  Flag,
  Settings,
  Menu,
  Search,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Users,
  ListChecks,
  Building2,
  Map,
  History,
  BarChart3,
  Package,
} from "lucide-react";
import { NTPCBrand, NTPCLogo } from "./NTPCLogo";
import { TOWNSHIPS } from "../data/mock";
import { useStore } from "../data/store";
import { clearAuth } from "../lib/auth";
import { useNotifications } from "../hooks/use-notifications";

function signOut(nav: ReturnType<typeof useNavigate>) {
  clearAuth();
  nav({ to: "/login" });
}

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

const employeeNav: NavItem[] = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/transfers", label: "Transfers", icon: Truck },
  { to: "/my-listings", label: "My Listings", icon: Package },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/reservations", label: "Reservations", icon: BookmarkCheck },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/reports", label: "Reports", icon: Flag },
  { to: "/settings", label: "Settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/listings", label: "Listings", icon: ListChecks },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/profile", label: "Profile", icon: User },
];

const superNav: NavItem[] = [
  { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super-admin/departments", label: "Departments", icon: Building2 },
  { to: "/super-admin/townships", label: "Townships", icon: Map },
  { to: "/super-admin/audit-logs", label: "Audit Logs", icon: History },
  { to: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/super-admin/settings", label: "Settings", icon: Settings },
];

function Sidebar({
  items,
  collapsed,
  onClose,
  mobile,
}: {
  items: NavItem[];
  collapsed: boolean;
  onClose?: () => void;
  mobile?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  return (
    <aside
      className={`${mobile ? "fixed inset-y-0 left-0 z-50" : "hidden lg:flex"} flex-col bg-surface border-r transition-all duration-200`}
      style={{ width: collapsed && !mobile ? 72 : 248 }}
    >
      <div className="h-16 flex items-center px-4 border-b shrink-0">
        {collapsed && !mobile ? <NTPCLogo size={32} /> : <NTPCBrand />}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((it) => {
          const active =
            path === it.to ||
            (it.to !== "/admin" &&
              it.to !== "/super-admin" &&
              path.startsWith(it.to));
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              } ${collapsed && !mobile ? "justify-center" : ""}`}
            >
              <it.icon size={18} />
              {(!collapsed || mobile) && (
                <span className="truncate">{it.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            signOut(nav);
          }}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted ${collapsed && !mobile ? "justify-center" : ""}`}
        >
          <LogOut size={18} /> {(!collapsed || mobile) && "Sign out"}
        </button>
      </div>
    </aside>
  );
}

function TopNavbar({
  onMenu,
  onToggleCollapse,
  showMarketplaceControls = true,
}: {
  onMenu: () => void;
  onToggleCollapse: () => void;
  showMarketplaceControls?: boolean;
}) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await fetchProfile();
      setProfile(data);
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }
  const [township, setTownship] = useState("All Townships");
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const wishlistCount = useStore((s) => s.wishlist.length);
  const { unreadCount: notifCount } = useNotifications();
  return (
    <header className="h-16 bg-surface border-b sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6">
      <button
        className="lg:hidden p-2 -ml-2 rounded hover:bg-muted"
        onClick={onMenu}
        aria-label="menu"
      >
        <Menu size={20} />
      </button>
      <button
        className="hidden lg:inline-flex p-2 -ml-2 rounded hover:bg-muted"
        onClick={onToggleCollapse}
        aria-label="collapse"
      >
        <Menu size={20} />
      </button>

      {showMarketplaceControls && (
        <>
          <div className="hidden md:block">
            <div className="relative">
              <select
                value={township}
                onChange={(e) => setTownship(e.target.value)}
                className="ntpc-input pr-8 appearance-none cursor-pointer min-w-[170px]"
              >
                <option>All Townships</option>
                {TOWNSHIPS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, categories"
                className="ntpc-input pl-9"
              />
            </div>
          </div>
        </>
      )}
      {!showMarketplaceControls && <div className="flex-1" />}

      <div className="flex items-center gap-1 ml-auto">
        <Link
          to="/wishlist"
          className="relative p-2 rounded hover:bg-muted"
          aria-label="wishlist"
        >
          <Heart size={18} />
          {wishlistCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>
        <Link
          to="/notifications"
          className="relative p-2 rounded hover:bg-muted"
          aria-label="notifications"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex items-center gap-2 ml-1 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted"
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {profile?.name
                ?.split(" ")
                ?.map((n: string) => n[0])
                ?.join("")
                ?.slice(0, 2) || "U"}
            </div>

            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold">
                {profile?.name || "User"}
              </div>

              <div className="text-[10px] text-muted-foreground">
                {profile?.township || ""}
              </div>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          {menu && (
            <div className="absolute right-0 mt-2 w-52 ntpc-card p-1 z-40">
              <Link
                to="/profile"
                onClick={() => setMenu(false)}
                className="block px-3 py-2 text-sm rounded hover:bg-muted"
              >
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenu(false)}
                className="block px-3 py-2 text-sm rounded hover:bg-muted"
              >
                Settings
              </Link>
              <div className="border-t my-1" />
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  signOut(nav);
                }}
                className="w-full text-left block px-3 py-2 text-sm rounded hover:bg-muted text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  role,
  children,
}: {
  role: "employee" | "admin" | "super";
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const items =
    role === "employee" ? employeeNav : role === "admin" ? adminNav : superNav;
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar items={items} collapsed={collapsed} />
      {mobile && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
            onClick={() => setMobile(false)}
          />
          <Sidebar
            items={items}
            collapsed={false}
            mobile
            onClose={() => setMobile(false)}
          />
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onMenu={() => setMobile(true)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          showMarketplaceControls={role === "employee"}
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
