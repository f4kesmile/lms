"use client";

import { ReactNode, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ADMIN_NAV_LINKS, SITE_CONFIG } from "@/lib/constants/index";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Sun, Moon, School } from "lucide-react";
import { getInitials, cn } from "@/lib/utils/index";

type AdminLayoutProps = {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export const AdminLayout = ({
  title,
  headerActions,
  children,
}: AdminLayoutProps) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    return () => cancelAnimationFrame(frame);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const initials = user?.name ? getInitials(user.name) : "??";

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <Sidebar
          collapsible="icon"
          className="border-r border-sidebar-border bg-sidebar shadow-xl"
        >
          <SidebarHeader className="flex h-16 items-center justify-start px-3 sm:px-4">
            <div className="flex w-full items-center justify-start gap-3 overflow-hidden">
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <School className="size-[30px]" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none transition-opacity group-data-[collapsible=icon]:hidden">
                <span className="font-bold tracking-tight text-sidebar-foreground">
                  {SITE_CONFIG.shortName} Admin
                </span>
                <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-bold">
                  University LMS
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 pb-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/40 transition-opacity group-data-[collapsible=icon]:hidden">
                Menu Utama
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMIN_NAV_LINKS.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            "relative justify-start overflow-hidden transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary font-bold hover:bg-primary/15"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <Link
                            href={item.href as Route}
                            className="flex w-full items-center justify-start gap-4"
                          >
                            <span className="material-symbols-outlined shrink-0 text-[26px] leading-none">
                              {item.icon}
                            </span>
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {item.label}
                            </span>
                            {isActive && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full bg-primary group-data-[collapsible=icon]:hidden" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <div className="flex flex-col gap-1">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="w-full justify-start gap-3 px-2 py-6 hover:bg-sidebar-accent transition-all duration-200"
                    size="lg"
                  >
                    <div className="flex aspect-square size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-xs ring-2 ring-primary/5">
                      {user ? initials : <User className="size-5" />}
                    </div>
                    <div className="flex flex-col items-start gap-0.5 leading-none transition-opacity group-data-[collapsible=icon]:hidden">
                      <span className="font-bold text-sm truncate max-w-[120px]">
                        {user?.name || "Memuat..."}
                      </span>
                      <span className="text-[10px] text-sidebar-foreground/50 uppercase font-black tracking-wider">
                        {user?.role || "Petugas"}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <Separator className="bg-sidebar-border mx-2 opacity-50" />
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4 shrink-0" />
                <span className="transition-opacity group-data-[collapsible=icon]:hidden">
                  Keluar
                </span>
              </button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex min-h-dvh flex-col bg-background/50">
          <header className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/80 px-3 backdrop-blur-sm sm:px-5 lg:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex flex-col leading-tight">
                <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider"></p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/"
                className="group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all hover:bg-sidebar-accent"
              >
                <Home className="size-4 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline">Halaman Umum</span>
              </Link>

              <Separator orientation="vertical" className="mx-1 h-4" />

              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-lg"
                >
                  {theme === "dark" ? (
                    <Sun className="size-4 text-secondary-brand fill-secondary-brand" />
                  ) : (
                    <Moon className="size-4 text-primary fill-primary" />
                  )}
                </Button>
              )}

              {headerActions && (
                <>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <div className="flex items-center gap-2">{headerActions}</div>
                </>
              )}
            </div>
          </header>

          <main
            className={cn(
              "flex-1 overflow-auto px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10",
            )}
          >
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
