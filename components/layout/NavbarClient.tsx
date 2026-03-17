"use client";

import type { Route } from "next";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_LINKS, SITE_CONFIG } from "@/lib/constants/index";

type UserData = { name: string; role: string } | null;

export function NavbarClient({ initialUser }: { initialUser: UserData }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData>(initialUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <Link href="/" className="brand">
          <div
            className="brand-icon"
            style={{
              borderRadius: 6,
              width: 32,
              height: 32,
              transform: "rotate(45deg)",
              background: "var(--primary)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                right: 6,
                bottom: 6,
                background: "var(--bg-dark)",
                transform: "rotate(-45deg)",
              }}
            />
          </div>
          <span className="brand-text" style={{ color: "var(--text-main)" }}>
            Uni
            <span style={{ color: "var(--text-soft)", fontWeight: 300 }}>
              {SITE_CONFIG.shortName}
            </span>
          </span>
        </Link>

        <nav className="nav-links" style={{ gap: "1.5rem" }}>
          {PUBLIC_NAV_LINKS.map((item: { href: string; label: string }) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                href={item.href as Route}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="row">
          {!user ? (
            <>
              <Link
                className="btn-ghost"
                href="/login"
                style={{
                  padding: "0.45rem 1rem",
                  fontSize: "0.85rem",
                  border: "1px solid var(--border-primary)",
                }}
              >
                Masuk
              </Link>
              <Button
                onClick={() => router.push("/register")}
                size="sm"
                style={{ boxShadow: "none" }}
              >
                Daftar
              </Button>
            </>
          ) : (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: "var(--primary)",
                  border: "none",
                  cursor: "pointer",
                  color: "#000",
                }}
                className="avatar avatar-sm"
                aria-label="Menu Pengguna"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    top: "120%",
                    right: 0,
                    width: 220,
                    padding: "0.5rem",
                    display: "grid",
                    gap: "0.25rem",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem",
                      borderBottom: "1px solid var(--border-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--text-main)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-dim)",
                        textTransform: "capitalize",
                      }}
                    >
                      Peran: {user.role}
                    </p>
                  </div>
                  <Link
                    href={
                      (user.role === "admin" ? "/admin" : "/courses") as Route
                    }
                    className="btn-ghost row"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      fontSize: "0.85rem",
                      padding: "0.5rem",
                      border: "none",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      grid_view
                    </span>
                    Buka Dasbor
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn-ghost row"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      fontSize: "0.85rem",
                      padding: "0.5rem",
                      border: "none",
                      color: "var(--rose)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      logout
                    </span>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          )}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="btn-ghost"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "1px solid var(--border-primary-strong)",
                marginLeft: "0.5rem",
              }}
              aria-label="Ganti Tema"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
