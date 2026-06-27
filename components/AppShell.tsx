"use client";

import Link from "next/link";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScrollText,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

type AppShellProps = {
  title: string;
  children: ReactNode;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: "Main",
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    group: "Inventory",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    group: "Inventory",
  },
  {
    label: "Audit Logs",
    href: "/logs",
    icon: ScrollText,
    group: "System",
  },
];

export default function AppShell({ title, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error("FETCH_CURRENT_USER_ERROR", error);
    }
  }

  async function handleLogout() {
    const confirmed = confirm("Yakin mau logout?");
    if (!confirmed) return;

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message || "Logout gagal.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT_ERROR", error);
      toast.error("Terjadi kesalahan saat logout.");
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function handleToggleSidebar() {
    if (window.innerWidth <= 1100) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }

    setSidebarOpen((prev) => !prev);
  }

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  return (
    <div
      className={
        sidebarOpen ? "app-layout sidebar-open" : "app-layout sidebar-closed"
      }
    >
      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={
          mobileSidebarOpen
            ? "app-sidebar mobile-open"
            : "app-sidebar mobile-closed"
        }
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Package size={22} />
          </div>

          <div>
            <h2>Inventra</h2>
            <p>Inventory System</p>
          </div>

          <button
            type="button"
            className="sidebar-close-mobile"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {currentUser?.name?.charAt(0) ?? "U"}
          </div>

          <div>
            <h4>{currentUser?.name ?? "Loading..."}</h4>
            <p>{currentUser?.role ?? "USER"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">Main</p>

          {menuItems
            .filter((item) => item.group === "Main")
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={
                    isActive(item.href) ? "sidebar-link active" : "sidebar-link"
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          <p className="sidebar-label">Inventory</p>

          {menuItems
            .filter((item) => item.group === "Inventory")
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={
                    isActive(item.href) ? "sidebar-link active" : "sidebar-link"
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          <p className="sidebar-label">System</p>

          {menuItems
            .filter((item) => item.group === "System")
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={
                    isActive(item.href) ? "sidebar-link active" : "sidebar-link"
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        <div className="sidebar-footer-card">
          <ShieldCheck size={22} />
          <div>
            <h4>Secure Access</h4>
            <p>Role-based inventory management.</p>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-menu"
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            <h1>{title}</h1>
          </div>

          <div className="topbar-search">
            <Search size={18} />
            <input placeholder="Search products, reports, logs..." />
          </div>

          <button type="button" className="topbar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}