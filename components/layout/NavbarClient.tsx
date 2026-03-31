"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Moon, Sun, Menu, User, LogOut, LayoutDashboard, GraduationCap } from "lucide-react";

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
    setMounted(true);
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
    if (href === "/" && pathname !== "/") return false;
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo noLink={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            {PUBLIC_NAV_LINKS.map((item: { href: string; label: string }) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "relative px-5 py-2.5 text-[13px] font-black uppercase tracking-[0.15em] transition-all duration-300 rounded-full",
                  isActive(item.href)
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                   <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-card/50 text-muted-foreground transition-all hover:bg-muted hover:text-primary hover:border-primary/20 shadow-sm overflow-hidden"
              aria-label="Ganti Tema"
            >
              <div className="relative h-5 w-5">
                <Sun className={cn("absolute inset-0 transition-transform duration-500", theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100")} />
                <Moon className={cn("absolute inset-0 transition-transform duration-500", theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0")} />
              </div>
            </button>
          )}

          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <div className="flex items-center bg-muted/30 p-1 rounded-2xl border border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-xl px-6 h-10 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-background transition-all"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/register")}
                  className="rounded-xl px-6 h-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Daftar
                </Button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="group flex items-center gap-3 pl-3 pr-1 py-1 rounded-2xl border border-border/40 bg-card/50 hover:bg-muted/50 transition-all shadow-sm"
                  aria-label="Menu Pengguna"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors hidden lg:block">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-primary shadow-xl shadow-primary/20 flex items-center justify-center text-sm font-black text-primary-foreground transform group-hover:scale-105 transition-transform">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 z-[100] w-64 overflow-hidden rounded-[2.5rem] border border-border bg-background p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-5 py-5 bg-muted/40 rounded-[2rem] mb-2 border border-border/20">
                       <p className="truncate text-sm font-black tracking-tight text-foreground mb-1">
                        {user.name}
                      </p>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-[0.2em] font-black h-5 border-primary/20 text-primary bg-primary/10">
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <Link
                        href={
                          (user.role === "mahasiswa"
                            ? "/courses"
                            : user.role === "dosen"
                              ? "/admin/teaching-schedule"
                              : "/admin/dashboard") as Route
                        }
                        className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-[13px] font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                         {user.role === "mahasiswa" ? <GraduationCap size={18} /> : <LayoutDashboard size={18} />}
                        {user.role === "mahasiswa"
                          ? "Ruang Belajar"
                          : "Dashboard Akses"}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-[13px] font-black text-destructive transition-all hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut size={18} />
                        Keluar Sesi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/50 text-foreground transition-all hover:bg-muted md:hidden"
                aria-label="Buka Menu"
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              title="Menu Navigasi"
              className="w-80 p-0 border-l border-border/40 rounded-l-[3rem]"
            >
              <div className="flex h-full flex-col bg-card/95 backdrop-blur-xl">
                <div className="flex items-center gap-3 border-b border-border/20 px-6 py-6 pt-10">
                  <Logo size="md" noLink={true} />
                </div>

                <nav className="flex flex-col gap-2 p-6 pt-8">
                  {PUBLIC_NAV_LINKS.map(
                    (item: { href: string; label: string }) => (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        className={cn(
                          "flex items-center rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all",
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </nav>

                <div className="mt-auto p-6 pb-10 space-y-4">
                  {!user ? (
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        asChild
                        className="w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                      >
                        <Link href="/login">Masuk Akun</Link>
                      </Button>
                      <Button
                        onClick={() => {
                          setSheetOpen(false);
                          router.push("/register");
                        }}
                        className="w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/10"
                      >
                        Daftar Sekarang
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 rounded-[1.5rem] bg-muted/40 p-4 border border-border/20">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black tracking-tight tracking-[0.05em]">
                            {user.name}
                          </p>
                          <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest h-5 border-primary/20 text-primary bg-primary/10">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                         <Link
                          href={
                            (user.role === "mahasiswa"
                              ? "/courses"
                              : user.role === "dosen"
                                ? "/admin/teaching-schedule"
                                : "/admin/dashboard") as Route
                          }
                          className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                        >
                          {user.role === "mahasiswa" ? <GraduationCap size={18} /> : <LayoutDashboard size={18} />}
                          {user.role === "mahasiswa"
                            ? "Ruang Belajar"
                            : "Dashboard Akses"}
                        </Link>
                        <button
                          onClick={() => {
                            setSheetOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-black text-destructive transition-all hover:bg-destructive/10 w-full"
                        >
                          <LogOut size={18} />
                          Keluar Sesi
                        </button>
                      </div>
                    </div>
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
