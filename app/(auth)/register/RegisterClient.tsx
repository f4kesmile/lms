"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { toast } from "sonner";

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
        "Registrasi berhasil. Anda akan diarahkan ke halaman kursus.",
      );

      // Refresh server components (navbar) dulu sebelum navigasi
      router.refresh();

      // Delay untuk navbar terupdate
      setTimeout(() => {
        router.push("/courses");
      }, 150);
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
                Bangun Masa Depan <span className="accent">Digital</span> Anda
              </h2>
              <p className="text-muted" style={{ fontSize: "1.1rem" }}>
                Bergabunglah dengan ribuan pelajar lainnya dan akses materi
                eksklusif dari instruktur terbaik di bidangnya.
              </p>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                className="row"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-primary-muted)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-primary-soft)",
                    color: "var(--primary)",
                  }}
                >
                  <span className="material-symbols-outlined">
                    auto_stories
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                    500+ Kursus
                  </h3>
                  <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                    Materi yang selalu diperbarui
                  </p>
                </div>
              </div>
              <div
                className="row"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-primary-muted)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-primary-soft)",
                    color: "var(--primary)",
                  }}
                >
                  <span className="material-symbols-outlined">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                    Sertifikat Resmi
                  </h3>
                  <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                    Diakui oleh industri global
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
                  "linear-gradient(135deg, var(--primary), var(--brand-heavy))",
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
                &quot;Belajar tidak pernah semudah ini. Platform ini mengubah
                cara saya memahami teknologi.&quot;
              </p>
            </div>
          </div>

          {/* Right Column — Form */}
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div
              className="neo-card"
              style={{
                padding: "2rem 2.5rem",
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
                  Daftar Akun Baru
                </h2>
                <p className="text-muted">
                  Lengkapi data di bawah untuk memulai.
                </p>
              </div>

              <form
                style={{ display: "grid", gap: "1.25rem" }}
                onSubmit={submit}
              >
                <div>
                  <label className="input-label">Nama Lengkap</label>
                  <div className="input-group">
                    <span className="input-icon material-symbols-outlined">
                      person
                    </span>
                    <input
                      className="input input-with-icon"
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Email</label>
                  <div className="input-group">
                    <span className="input-icon material-symbols-outlined">
                      mail
                    </span>
                    <input
                      className="input input-with-icon"
                      type="email"
                      placeholder="contoh@email.com"
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
                      placeholder="Minimal 8 karakter"
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

                <label
                  className="row"
                  style={{
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    style={{
                      marginTop: "0.25rem",
                      accentColor: "var(--primary)",
                    }}
                  />
                  <span
                    className="text-muted"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    Saya menyetujui{" "}
                    <a className="accent" href="#" style={{ fontWeight: 700 }}>
                      Syarat &amp; Ketentuan
                    </a>{" "}
                    serta{" "}
                    <a className="accent" href="#" style={{ fontWeight: 700 }}>
                      Kebijakan Privasi
                    </a>
                    .
                  </span>
                </label>

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
                  {loading ? "Memproses..." : "Daftar Sekarang"}
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
                    Atau daftar dengan
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
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="accent"
                style={{ fontWeight: 700 }}
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
