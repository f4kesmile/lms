"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import AppTopbar from "@/components/AppTopbar";

type LoginResponse = {
  user: {
    id: string;
    role: "admin" | "dosen" | "mahasiswa";
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

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

      if (data.user.role === "mahasiswa") {
        router.push("/student");
      } else {
        router.push("/admin/dashboard");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppTopbar title="LMSPintar" />
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
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
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <span className="eyebrow">Login</span>
            <h1 className="title-xl">Masuk ke Akun Anda</h1>
            <p className="text-muted" style={{ fontSize: "1.05rem" }}>
              Gunakan akun kampus untuk mengakses dashboard, chatbot, dan materi
              pembelajaran.
            </p>
            <a className="btn-ghost" href="/register" style={{ width: "fit-content" }}>
              Belum punya akun? Daftar
            </a>
          </div>

          <div className="neo-card" style={{ padding: "2rem 2.5rem", borderRadius: "var(--radius-xl)" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem" }}>
              Masuk
            </h2>
            <form onSubmit={submit} style={{ display: "grid", gap: "1.25rem" }}>
              <div>
                <label className="input-label">Email</label>
                <div className="input-group">
                  <span className="input-icon material-symbols-outlined">mail</span>
                  <input
                    className="input input-with-icon"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@kampus.ac.id"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Kata Sandi</label>
                <div className="input-group">
                  <span className="input-icon material-symbols-outlined">lock</span>
                  <input
                    className="input input-with-icon"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata sandi"
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
              {error && <p style={{ color: "var(--rose)", fontSize: "0.9rem" }}>{error}</p>}
              <button className="btn" type="submit" disabled={loading} style={{ width: "100%", padding: "1rem", fontSize: "1.05rem" }}>
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
