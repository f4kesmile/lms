"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ForbiddenClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get("next") || "/";
  const [secondsLeft, setSecondsLeft] = useState(5);

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

  return (
    <main
      className="app-shell"
      style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}
    >
      <section
        className="neo-card"
        style={{
          width: "min(720px, 100%)",
          padding: "2rem",
          display: "grid",
          gap: "1.25rem",
          textAlign: "center",
          background:
            "linear-gradient(180deg, var(--bg-card), color-mix(in srgb, var(--bg-card) 82%, var(--surface-primary-soft)))",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            margin: "0 auto",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-primary-soft)",
            color: "var(--primary)",
            border: "2px solid var(--border-primary-strong)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
            lock_person
          </span>
        </div>

        <div style={{ display: "grid", gap: "0.5rem" }}>
          <span className="eyebrow" style={{ margin: "0 auto" }}>
            Akses Ditolak
          </span>
          <h1
            className="title-xl"
            style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)" }}
          >
            403
          </h1>
          <p className="title-lg">Halaman ini bukan untuk akun mahasiswa.</p>
          <p
            className="text-muted"
            style={{ maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}
          >
            Kamu mencoba membuka area dashboard yang hanya tersedia untuk admin
            atau dosen. Kamu akan diarahkan kembali ke beranda dalam{" "}
            {secondsLeft} detik.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn">
            Kembali ke Beranda
          </Link>
          <Link href="/courses" className="btn-ghost">
            Lihat Kelas Saya
          </Link>
        </div>
      </section>
    </main>
  );
}
