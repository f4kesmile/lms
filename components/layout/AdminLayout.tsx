"use client";

import { ReactNode, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ADMIN_NAV_LINKS, SITE_CONFIG } from "@/lib/constants/index";

type AdminLayoutProps = {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export const AdminLayout = ({
  title,
  subtitle,
  headerActions,
  children,
}: AdminLayoutProps) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
    return () => cancelAnimationFrame(id);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="admin-layout">
      {/* Sidebar Section */}
      <aside
        className="admin-sidebar"
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div>
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <p className="admin-logo-text">{SITE_CONFIG.shortName} Admin</p>
              <p className="admin-sublogo">Bottle Green Ed.</p>
            </div>
          </div>
        </div>

        <nav className="admin-nav" style={{ flex: 1, overflowY: "auto" }}>
          {ADMIN_NAV_LINKS.map(
            (item: { href: string; label: string; icon: string }) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={`admin-link ${pathname === item.href ? "active" : ""}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="admin-profile" style={{ marginTop: "auto" }}>
          <div className="row" style={{ marginBottom: "0.75rem" }}>
            <div
              className="avatar avatar-md"
              style={{
                background: "rgba(12, 163, 127, 0.12)",
                color: "var(--primary)",
              }}
            >
              {user ? (
                initials
              ) : (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  person
                </span>
              )}
            </div>
            <div>
              <p className="admin-profile-name">{user?.name || "Memuat..."}</p>
              <p
                className="text-dim"
                style={{ fontSize: "0.75rem", textTransform: "capitalize" }}
              >
                {user?.role || "Mengecek..."}
              </p>
            </div>
          </div>
          <button
            className="btn-ghost row"
            type="button"
            onClick={logout}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "0.85rem",
              border: "none",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              logout
            </span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Content Section */}
      <section className="admin-content">
        <header
          className="admin-content-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 className="title-lg">{title}</h1>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              {subtitle}
            </p>
          </div>
          <div className="row" style={{ gap: "0.5rem" }}>
            <Link
              href="/"
              className="btn-ghost row"
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                home
              </span>
              Beranda
            </Link>
            {mounted && (
              <button
                className="btn-ghost"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ padding: "0.5rem", borderRadius: "var(--radius-md)" }}
              >
                <span className="material-symbols-outlined">
                  {theme === "dark" ? "light_mode" : "dark_mode"}
                </span>
              </button>
            )}
            {headerActions}
          </div>
        </header>
        <div className="admin-content-body">{children}</div>
      </section>
    </div>
  );
};
