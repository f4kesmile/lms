"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EnrollButton({
  classId,
  isEnrolled,
  isLoggedIn,
  requiresKey = false,
}: {
  classId: string;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  requiresKey?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState("");
  const [showInput, setShowInput] = useState(false);

  if (isEnrolled) {
    return (
      <Link
        href={`/courses/${classId}`}
        className="btn-ghost"
        style={{
          width: "100%",
          fontSize: "0.85rem",
          padding: "0.5rem",
          background: "var(--bg-card-hover)",
          borderColor: "var(--border-primary-strong)",
          color: "var(--primary)",
          fontWeight: 700,
        }}
      >
        Lanjutkan Belajar
      </Link>
    );
  }

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, enrollmentKey: key }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Berhasil mendaftar ke kelas.");
        window.setTimeout(() => {
          router.refresh();
        }, 700);
      } else {
        toast.error(data.message || "Gagal mendaftar kelas");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="btn-ghost"
        style={{
          width: "100%",
          fontSize: "0.85rem",
          padding: "0.5rem",
          background: "transparent",
          borderColor: "var(--primary)",
          color: "var(--text-main)",
          fontWeight: 700,
        }}
      >
        Login untuk Daftar Kelas
      </button>
    );
  }

  if (requiresKey && !showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="btn-ghost"
        style={{
          width: "100%",
          fontSize: "0.85rem",
          padding: "0.5rem",
          background: "transparent",
          borderColor: "var(--primary)",
          color: "var(--text-main)",
          fontWeight: 700,
        }}
      >
        Daftar ke Kelas
      </button>
    );
  }

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {requiresKey && (
        <input
          type="text"
          placeholder="Masukkan Kode Kelas"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="input"
          style={{ width: "100%", fontSize: "0.85rem", padding: "0.5rem" }}
        />
      )}
      <button
        onClick={handleEnroll}
        disabled={loading || (requiresKey && !key.trim())}
        className="btn-ghost"
        style={{
          width: "100%",
          fontSize: "0.85rem",
          padding: "0.5rem",
          background: "var(--primary)",
          borderColor: "var(--primary-dark)",
          color: "#000",
          fontWeight: 700,
        }}
      >
        {loading ? "Memproses..." : "Konfirmasi Pendaftaran"}
      </button>
      {showInput && (
        <button
          onClick={() => {
            setShowInput(false);
            setKey("");
          }}
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-dim)",
            fontSize: "0.75rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Batal
        </button>
      )}
    </div>
  );
}
