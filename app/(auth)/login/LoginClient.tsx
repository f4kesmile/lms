"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { toast } from "sonner";

type LoginResponse = {
  user: {
    id: string;
    role: "admin" | "dosen" | "mahasiswa";
  };
};

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const oauthError = searchParams.get("error");
  const allowedDomains = searchParams.get("allowed");

  const oauthErrorMessage =
    oauthError === "oauth_domain_not_allowed"
      ? `Domain email tidak diizinkan. Gunakan email kampus: ${allowedDomains || "kampus.ac.id"}`
      : oauthError === "oauth_not_configured"
        ? "OAuth belum dikonfigurasi di server."
        : oauthError === "oauth_email_unverified"
          ? "Email Google harus terverifikasi untuk login."
          : oauthError
            ? "Login Google gagal. Silakan coba lagi."
            : null;

  useEffect(() => {
    if (!oauthErrorMessage) return;
    toast.error(oauthErrorMessage);
  }, [oauthErrorMessage]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse & {
        message?: string;
      };
      if (!response.ok) throw new Error(data.message || "Login gagal");

      toast.success("Login berhasil");

      // Refresh server components (navbar) dulu sebelum navigasi
      router.refresh();

      // Delay minimal agar navbar terupdate
      setTimeout(() => {
        if (data.user.role === "mahasiswa") {
          router.push("/courses");
        } else {
          router.push("/admin/dashboard");
        }
      }, 100);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan sistem. Cek log dan hubungi admin.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main
        style={{
          width: "100%",
          minHeight: "calc(100dvh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 2.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          {/* Left Column */}
          <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <h2 className="title-xl">
                Selamat Datang <span className="accent">Kembali</span>
              </h2>
              <p className="text-muted" style={{ fontSize: "1.1rem" }}>
                Gunakan akun kampus Anda untuk mulai belajar, mengajar, atau
                mengelola sistem terintegrasi.
              </p>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                className="row"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--border-primary)",
                    color: "var(--primary)",
                  }}
                >
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                    Asisten AI Pintar
                  </h3>
                  <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                    Dukungan 24/7 di semua tahapan komprehensif
                  </p>
                </div>
              </div>
              <div
                className="row"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--border-primary)",
                    color: "var(--primary)",
                  }}
                >
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                    Akses Super Cepat
                  </h3>
                  <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                    Terdistribusi global bebas hambatan
                  </p>
                </div>
              </div>
            </div>

            <div
              className="neo-card"
              style={{
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              }}
            >
              <p
                style={{
                  color: "var(--on-inverse)",
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  fontWeight: 500,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                &quot;Platform ini mempermudah saya mengawasi kemajuan belajar
                mahasiswa dalam hitungan detik.&quot;
              </p>
              <p
                style={{
                  marginTop: "1rem",
                  color: "var(--primary-light)",
                  fontWeight: 700,
                }}
              >
                — Dosen Senior Ilmu Komputer
              </p>
            </div>
          </div>

          {/* Right Column — Form */}
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div
              className="neo-card"
              style={{
                padding: "3rem 2.5rem",
                borderRadius: "var(--radius-xl)",
              }}
            >
              <div style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    marginBottom: "0.4rem",
                  }}
                >
                  Masuk
                </h2>
                <p className="text-muted">
                  Masukkan kredensial Anda untuk melanjutkan.
                </p>
              </div>

              <form
                style={{ display: "grid", gap: "1.25rem" }}
                onSubmit={submit}
              >
                <div>
                  <label className="input-label">Email</label>
                  <div className="input-group">
                    <span className="input-icon material-symbols-outlined">
                      mail
                    </span>
                    <input
                      className="input input-with-icon"
                      type="email"
                      placeholder="email@kampus.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Kata Sandi</label>
                  <div className="input-group">
                    <span className="input-icon material-symbols-outlined">
                      lock
                    </span>
                    <input
                      className="input input-with-icon"
                      type={showPw ? "text" : "password"}
                      placeholder="Kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-dim)",
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined">
                        {showPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  className="btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    fontSize: "1.05rem",
                  }}
                >
                  {loading ? "Memproses..." : "Masuk"}
                </button>

                <div
                  className="row"
                  style={{ justifyContent: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--border-primary)",
                    }}
                  />
                  <span
                    className="text-dim"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Atau masuk dengan
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--border-primary)",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {/* Google Button */}
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() =>
                      window.location.assign("/api/auth/oauth/google/start")
                    }
                    style={{
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      border: "1px solid var(--border-primary)",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.375rem",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "rgba(219, 84, 51, 0.08)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#db5433";
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "var(--border-primary)";
                    }}
                  >
                    {/* Google Logo SVG */}
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

                  {/* Microsoft Button */}
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() =>
                      window.location.assign("/api/auth/oauth/microsoft/start")
                    }
                    style={{
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      border: "1px solid var(--border-primary)",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.375rem",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "rgba(0, 90, 158, 0.08)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#005a9e";
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "var(--border-primary)";
                    }}
                  >
                    {/* Microsoft Logo SVG */}
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

            <p
              className="text-muted"
              style={{
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="accent"
                style={{ fontWeight: 700 }}
              >
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
