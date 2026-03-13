"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type AdminShellProps = {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

const adminLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/admin/knowledge", label: "Knowledge Base", icon: "menu_book" },
  { href: "/admin/users", label: "Manajemen Users", icon: "group" },
  { href: "/admin/stats", label: "Statistik AI", icon: "analytics" },
  { href: "/admin/insights", label: "Insights", icon: "lightbulb" },
];

export default function AdminShell({
  title,
  subtitle,
  headerActions,
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <p className="admin-logo-text">LMS Admin</p>
              <p className="admin-sublogo">Bottle Green Ed.</p>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          {adminLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`admin-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="admin-profile">
          <div className="row" style={{ marginBottom: "0.75rem" }}>
            <div
              className="avatar avatar-md"
              style={{ background: "rgba(190,239,0,0.15)", color: "var(--primary)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                person
              </span>
            </div>
            <div>
              <p className="admin-profile-name">Dr. Aris Setiawan</p>
              <p className="text-dim" style={{ fontSize: "0.75rem" }}>Senior Lecturer</p>
            </div>
          </div>
          <button
            className="btn-ghost"
            type="button"
            onClick={logout}
            style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              logout
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-content-header">
          <div>
            <h1 className="title-lg">{title}</h1>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>{subtitle}</p>
          </div>
          {headerActions && <div className="row">{headerActions}</div>}
        </header>
        <div className="admin-content-body">{children}</div>
      </section>
    </div>
  );
}
