"use client";

import type { Route } from "next";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function ForbiddenClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get("next") || "/";
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(countdown);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      router.replace(nextTarget as Route);
    }
  }, [nextTarget, router, secondsLeft]);

  const progress = (secondsLeft / 10) * 100;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-destructive/5 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-primary/5 blur-[120px] [animation-delay:2s]" />
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center">
        <h1 className="text-[20rem] font-black leading-none tracking-tighter text-foreground/[0.03] md:text-[30rem] lg:text-[40rem]">
          403
        </h1>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />
          <span className="text-xs font-black uppercase tracking-[0.4em] text-destructive">
            Akses Terbatas
          </span>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />
        </div>

        <div className="max-w-2xl space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Izin <br />
            <span className="bg-gradient-to-br from-destructive to-destructive/70 bg-clip-text text-transparent">
              Ditolak
            </span>
          </h2>
          <p className="mx-auto max-w-md text-lg font-medium leading-relaxed text-muted-foreground">
            Halaman ini eksklusif untuk Admin & Pengajar. Silakan hubungi
            koordinator jika ini adalah kesalahan.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={226.2}
                strokeDashoffset={226.2 - (226.2 * progress) / 100}
                className="text-primary transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="text-2xl font-black text-foreground">
              {secondsLeft}
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Mengalihkan ke Beranda
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/"
            className="group flex h-14 min-w-[220px] items-center justify-center gap-3 rounded-full bg-primary px-8 font-black text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            <Icon name="home" size={20} />
            Halaman Utama
          </Link>
          <Link
            href="/courses"
            className="flex h-14 min-w-[220px] items-center justify-center gap-3 rounded-full border border-border bg-background/50 px-8 font-black text-foreground backdrop-blur-xl transition-all hover:bg-muted active:scale-95"
          >
            Kelas Saya
            <Icon name="east" size={20} />
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-12 z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-px bg-gradient-to-b from-destructive/50 to-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
            Akses Keamanan &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
