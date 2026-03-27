"use client";

import { ReactNode, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { DOSEN_NAV_LINKS, SITE_CONFIG } from "@/lib/constants/index";
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
import { getInitials, cn } from "@/lib/utils/index";
import { Icon } from "@/components/ui/icon";

type DosenLayoutProps = {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export const DosenLayout = ({
  title,
  headerActions,
  children,
}: DosenLayoutProps) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

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
      <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
        <SidebarHeader className="flex h-16 items-center justify-start px-3 sm:px-4 border-b border-border">
          <div className="flex w-full items-center justify-start gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-brand text-secondary-brand-foreground border border-border shadow-sm">
              <Icon name="history_edu" size={24} />
            </div>
            <div className="flex flex-col gap-0.5 leading-none transition-opacity group-data-[collapsible=icon]:hidden">
              <span className="font-black tracking-widest uppercase text-sidebar-foreground">
                {SITE_CONFIG.name} Dosen
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Portal Pengajar
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pb-2 mt-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-opacity group-data-[collapsible=icon]:hidden">
              Panel Pengajar
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {DOSEN_NAV_LINKS.map((item) => {
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
                          "relative justify-start overflow-hidden transition-all duration-200 rounded-md border-2 border-transparent my-1",
                          isActive
                            ? "bg-secondary-brand text-secondary-brand-foreground font-bold border-border shadow-sm hover:bg-secondary-brand/90"
                            : "hover:bg-muted hover:border-border hover:text-foreground font-semibold text-muted-foreground",
                        )}
                      >
                        <Link
                          href={item.href as Route}
                          className="flex w-full items-center justify-start gap-4"
                        >
                          <Icon
                            name={item.icon}
                            size={22}
                            className="shrink-0"
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border">
          <div className="flex flex-col gap-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-3 h-auto p-2 hover:bg-muted rounded-md border-2 border-transparent hover:border-border transition-colors group-data-[collapsible=icon]:justify-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-brand/10 text-secondary-brand font-black text-xs border border-secondary-brand/20">
                    {user ? initials : <Icon name="person" size={20} />}
                  </div>
                  <div className="flex flex-col items-start gap-1 leading-none transition-opacity group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-sm truncate max-w-[150px]">
                      {user?.name || "Memuat..."}
                    </span>
                    <span className="text-[10px] text-secondary-brand uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-secondary-brand/10">
                      {user?.role || "Dosen"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center group-data-[collapsible=icon]:justify-center gap-2 rounded-md border border-border bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground shadow-sm group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:w-auto"
            >
              <Icon name="logout" size={18} className="shrink-0" />
              <span className="transition-opacity group-data-[collapsible=icon]:hidden">
                Keluar
              </span>
            </button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex flex-1 min-h-dvh flex-col bg-background relative z-0 overflow-x-hidden">
        <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <SidebarTrigger className="-ml-2 hover:bg-muted rounded-md p-2 transition-colors border-2 border-transparent hover:border-border" />
            <div className="h-6 w-0.5 bg-border rounded-full hidden sm:block" />
            <div className="flex flex-col leading-tight min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-md border border-border bg-card px-2 sm:px-4 py-2 text-sm font-bold transition-all hover:bg-muted shadow-sm active:translate-y-[2px] active:shadow-none"
            >
              <Icon
                name="home"
                size={18}
                className="transition-transform group-hover:scale-110"
              />
              <span className="hidden sm:inline">Halaman Umum</span>
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-all hover:bg-muted shadow-sm active:translate-y-[2px] active:shadow-none"
                aria-label="Toggle theme"
              >
                <Icon
                  name={theme === "dark" ? "light_mode" : "dark_mode"}
                  size={20}
                  className={
                    theme === "dark" ? "text-secondary-brand" : "text-primary"
                  }
                />
              </button>
            )}

            {headerActions && (
              <>
                <div className="h-6 w-0.5 bg-border rounded-full mx-1 hidden sm:block" />
                <div className="flex items-center gap-2">{headerActions}</div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden bg-muted/30 px-4 py-6 sm:px-6 sm:py-8 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[1600px] min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
