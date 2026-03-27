"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      toast.success("Login berhasil. Sedang mengarahkan...");
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
    <>
      <main className="flex min-h-[calc(100dvh-80px)] w-full items-center justify-center p-8 md:p-10">
        <div className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2">
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="title-xl text-4xl font-black md:text-5xl">
                Selamat Datang <span className="text-primary">Kembali</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Lanjutkan perjalanan belajar Anda dan capai target akademik bersama ribuan pelajar lainnya.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="row flex items-center gap-4 rounded-lg border border-border bg-surface-primary-muted p-4">
                <div className="flex items-center justify-center rounded-md bg-surface-primary-soft p-3 text-primary">
                  <Icon name="history_edu" size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Lanjutkan Belajar</h3>
                  <p className="text-sm text-muted-foreground">
                    Akses materi terakhir Anda
                  </p>
                </div>
              </div>
              <div className="row flex items-center gap-4 rounded-lg border border-border bg-surface-primary-muted p-4">
                <div className="flex items-center justify-center rounded-md bg-surface-primary-soft p-3 text-primary">
                  <Icon name="forum" size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Diskusi Aktif</h3>
                  <p className="text-sm text-muted-foreground">
                    Terhubung dengan pengajar dan rekan
                  </p>
                </div>
              </div>
            </div>

            <div className="neo-card relative overflow-hidden bg-gradient-to-br from-primary to-brand-heavy p-8">
              <p className="relative z-10 font-medium italic text-primary-foreground">
                &quot;Konsistensi adalah kunci. Setiap modul yang diselesaikan membawa Anda selangkah lebih dekat ke tujuan.&quot;
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="neo-card rounded-2xl p-8 md:p-10">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-black">Masuk ke Akun</h2>
                <p className="text-muted-foreground">
                  Masukkan email dan kata sandi Anda.
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="flex flex-col gap-2">
                  <label className="input-label text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <div className="input-group relative flex items-center">
                    <Icon
                      name="mail"
                      size={20}
                      className="input-icon absolute left-4 text-muted-foreground"
                    />
                    <input
                      className="input input-with-icon w-full rounded-md border border-border bg-card py-3 pl-12 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      type="email"
                      placeholder="contoh@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="input-label text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Kata Sandi
                  </label>
                  <div className="input-group relative flex items-center">
                    <Icon
                      name="lock"
                      size={20}
                      className="input-icon absolute left-4 text-muted-foreground"
                    />
                    <input
                      className="input input-with-icon w-full rounded-md border border-border bg-card py-3 pl-12 pr-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      type={showPw ? "text" : "password"}
                      placeholder="Masukkan kata sandi"
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

                <div className="flex items-center justify-between">
                  <label className="row flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Ingat Saya
                    </span>
                  </label>
                  <a href="#" className="text-sm font-bold text-primary hover:underline">
                    Lupa Sandi?
                  </a>
                </div>

                <button
                  className="btn mt-2 w-full py-4 text-lg font-bold"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Masuk Sekarang"}
                </button>

                <div className="row flex items-center justify-center gap-4 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Atau masuk dengan
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="btn-ghost flex items-center justify-center gap-2 rounded-md border border-border py-3 font-medium transition-colors hover:border-[#db5433] hover:bg-[#db5433]/10"
                    type="button"
                    onClick={() =>
                      window.location.assign("/api/auth/oauth/google/start")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>

                  <button
                    className="btn-ghost flex items-center justify-center gap-2 rounded-md border border-border py-3 font-medium transition-colors hover:border-[#005a9e] hover:bg-[#005a9e]/10"
                    type="button"
                    onClick={() =>
                      window.location.assign(
                        "/api/auth/oauth/microsoft/start"
                      )
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                      <rect x="14" y="1" width="9" height="9" fill="#7FBA00" />
                      <rect x="1" y="14" width="9" height="9" fill="#00A4EF" />
                      <rect x="14" y="14" width="9" height="9" fill="#FFB900" />
                    </svg>
                    Microsoft
                  </button>
                </div>
              </form>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
