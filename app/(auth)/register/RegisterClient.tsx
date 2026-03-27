"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/shared/Logo";

export default function RegisterClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (!agree) {
      toast.error("Anda harus menyetujui syarat dan ketentuan.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      toast.success(
        "Registrasi berhasil. Anda akan diarahkan ke halaman kursus."
      );
      router.refresh();
      setTimeout(() => {
        router.push("/courses");
      }, 150);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan sistem. Cek log dan hubungi admin."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100dvh-64px)] w-full items-center justify-center bg-background p-4 md:p-8 lg:p-12">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:grid-cols-12 lg:min-h-[660px]">
        
        <div className="relative hidden flex-col justify-between bg-primary p-10 lg:col-span-5 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-dark),transparent)] opacity-30" />
          
          <div className="relative z-10">
            <Logo size="lg" className="mb-10 text-primary-foreground" />
            <h1 className="text-4xl font-black leading-tight tracking-tight text-primary-foreground xl:text-5xl">
              Mulai Perjalanan <br />
              <span className="opacity-70">Akademik Anda</span>
            </h1>
            <p className="mt-6 text-lg font-medium leading-relaxed text-primary-foreground/80">
              Bergabunglah dengan komunitas belajar masa depan. Akses modul interaktif dan konsultasi akademik berbasis AI sekarang juga.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-5 text-primary-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-xl">
                <Icon name="workspace_premium" size={24} />
              </div>
              <div>
                <h3 className="text-base font-black">Sertifikat Digital</h3>
                <p className="text-sm font-medium opacity-70">Validasi kemampuan Anda secara global</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-primary-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-xl">
                <Icon name="groups" size={24} />
              </div>
              <div>
                <h3 className="text-base font-black">Komunitas Eksklusif</h3>
                <p className="text-sm font-medium opacity-70">Diskusi intensif dengan pengajar ahli</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 lg:col-span-7">
          <div className="w-full max-w-sm">
            <div className="mb-4 flex justify-center lg:hidden">
              <Logo size="md" />
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">Daftar Akun</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Lengkapi data Anda untuk memulai.</p>
            </div>

            <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <Icon name="person" size={20} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap"
                    className="h-14 w-full rounded-xl border-2 border-border bg-muted/20 pl-12 pr-4 font-bold transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Email</label>
                <div className="relative flex items-center">
                  <Icon name="mail" size={20} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    className="h-14 w-full rounded-xl border-2 border-border bg-muted/20 pl-12 pr-4 font-bold transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">Kata Sandi</label>
                <div className="relative flex items-center">
                  <Icon name="lock" size={20} className="absolute left-4 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="Minimal 8 karakter"
                    className="h-14 w-full rounded-xl border-2 border-border bg-muted/20 pl-12 pr-14 font-bold transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showPw ? "visibility_off" : "visibility"} size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  required
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-5 w-5 rounded-lg accent-primary"
                />
                <span className="text-sm font-medium leading-tight text-muted-foreground">
                  Saya menyetujui <Link href="#" className="font-black text-primary hover:text-primary/80 hover:underline">Syarat</Link> & <Link href="#" className="font-black text-primary hover:text-primary/80 hover:underline">Privasi</Link> Nusa Belajar.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-primary font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Atau Daftar Dengan</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => window.location.assign("/api/auth/oauth/google/start")}
                  className="flex h-12 items-center justify-center gap-3 rounded-xl border-2 border-border bg-background font-black text-foreground transition-all hover:bg-muted"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign("/api/auth/oauth/microsoft/start")}
                  className="flex h-12 items-center justify-center gap-3 rounded-xl border-2 border-border bg-background font-black text-foreground transition-all hover:bg-muted"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="14" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="14" width="9" height="9" fill="#00A4EF" />
                    <rect x="14" y="14" width="9" height="9" fill="#FFB900" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-black text-[var(--primary)] hover:opacity-80 hover:underline transition-all decoration-[var(--primary)]/30 underline-offset-4">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
