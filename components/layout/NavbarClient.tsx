"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_CONFIG, PUBLIC_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

type UserData = { name: string; role: string } | null;

export function NavbarClient({ initialUser }: { initialUser: UserData }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData>(initialUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    let isCancelled = false;

    async function syncUserSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          user: { name: string; role: string } | null;
        };

        if (isCancelled) return;
        setUser(
          data.user ? { name: data.user.name, role: data.user.role } : null,
        );
      } catch {
        // silent
      }
    }

    syncUserSession();

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

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

  useEffect(() => {
    setSheetOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV_LINKS.map((item: { href: string; label: string }) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Ganti Tema"
            >
              <Icon
                name={theme === "dark" ? "light_mode" : "dark_mode"}
                size={18}
              />
            </button>
          )}

          <div className="hidden items-center gap-2 md:flex">
            {!user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-lg text-primary hover:bg-primary/5"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/register")}
                  className="rounded-lg border-primary/20 text-primary hover:bg-primary/5 shadow-none"
                >
                  Daftar
                </Button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  aria-label="Menu Pengguna"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                    <Separator className="my-1" />
                    <Link
                      href={
                        (user.role === "mahasiswa"
                          ? "/courses"
                          : "/admin/dashboard") as Route
                      }
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon
                        name={
                          user.role === "mahasiswa" ? "school" : "grid_view"
                        }
                        size={18}
                      />
                      {user.role === "mahasiswa"
                        ? "Lihat Kursus"
                        : "Buka Dashboard"}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Icon name="logout" size={18} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted md:hidden"
                aria-label="Buka Menu"
              >
                <Icon name="menu" size={20} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              title="Menu Navigasi"
              className="w-72 p-0"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  <Logo size="sm" />
                </div>

                <nav className="flex flex-col gap-1 p-3">
                  {PUBLIC_NAV_LINKS.map(
                    (item: { href: string; label: string }) => (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </nav>

                <Separator />

                <div className="mt-auto border-t border-border p-3 flex flex-col gap-2">
                  {!user ? (
                    <>
                      <Button
                        variant="ghost"
                        asChild
                        className="w-full rounded-lg text-primary hover:bg-primary/5"
                      >
                        <Link href="/login">Masuk</Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSheetOpen(false);
                          router.push("/register");
                        }}
                        className="w-full rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                      >
                        Daftar
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {user.name}
                          </p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={
                          (user.role === "mahasiswa"
                            ? "/courses"
                            : "/admin/dashboard") as Route
                        }
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Icon
                          name={
                            user.role === "mahasiswa" ? "school" : "grid_view"
                          }
                          size={18}
                        />
                        {user.role === "mahasiswa"
                          ? "Lihat Kursus"
                          : "Buka Dashboard"}
                      </Link>
                      <button
                        onClick={() => {
                          setSheetOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Icon name="logout" size={18} />
                        Keluar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
