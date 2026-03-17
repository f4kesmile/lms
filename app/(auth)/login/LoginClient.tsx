"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SITE_CONFIG, getCurrentYear } from "@/lib/constants";
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

      if (data.user.role === "mahasiswa") {
        router.push("/courses");
      } else {
        router.push("/admin/dashboard");
      }
      router.refresh();
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
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
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
          <div
            className="neo-card"
            style={{ padding: "3rem 2.5rem", borderRadius: "var(--radius-xl)" }}
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

            <form style={{ display: "grid", gap: "1.25rem" }} onSubmit={submit}>
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
                style={{ width: "100%", padding: "1rem", fontSize: "1.05rem" }}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>

              <p
                className="text-muted"
                style={{
                  textAlign: "center",
                  fontSize: "0.9rem",
                  marginTop: "0.25rem",
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
                    gap: "0.45rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  >
                    google
                  </span>
                  Google
                </button>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => router.push("/api/auth/oauth/google/start")}
                  style={{
                    justifyContent: "center",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  >
                    window
                  </span>
                  Microsoft
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p className="text-dim" style={{ fontSize: "0.85rem" }}>
          © {getCurrentYear()} {SITE_CONFIG.name}. Hak cipta dilindungi.
        </p>
        <div
          className="row"
          style={{
            justifyContent: "center",
            gap: "1.5rem",
            marginTop: "0.75rem",
          }}
        >
          <a href="/about" className="text-dim" style={{ fontSize: "0.85rem" }}>
            Tentang Kami
          </a>
          <a href="/help" className="text-dim" style={{ fontSize: "0.85rem" }}>
            Bantuan
          </a>
          <a
            href="#/about"
            className="text-dim"
            style={{ fontSize: "0.85rem" }}
          >
            Kontak
          </a>
        </div>
      </footer>
    </>
  );
}
