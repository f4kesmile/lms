"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE_CONFIG, getCurrentYear } from "@/lib/constants";
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

      toast.success("Registrasi berhasil. Anda akan diarahkan ke dashboard.");
      setTimeout(() => {
        router.push("/courses");
        router.refresh();
      }, 600);
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
          <div
            className="neo-card"
            style={{ padding: "2rem 2.5rem", borderRadius: "var(--radius-xl)" }}
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

            <form style={{ display: "grid", gap: "1.25rem" }} onSubmit={submit}>
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
                style={{ width: "100%", padding: "1rem", fontSize: "1.05rem" }}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>

              <p
                className="text-muted"
                style={{
                  textAlign: "center",
                  fontSize: "0.9rem",
                  marginTop: "0.25rem",
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
          <a href="/about" className="text-dim" style={{ fontSize: "0.85rem" }}>
            Kontak
          </a>
        </div>
      </footer>
    </>
  );
}
