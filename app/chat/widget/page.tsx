import AppTopbar from "@/components/AppTopbar";

export default function ChatWidgetPage() {
  return (
    <>
      <AppTopbar title="UniLMS" />
      <main className="chat-widget-wrap">
        <section className="chat-widget-card">
          <header className="chat-widget-head">
            <div className="row" style={{ gap: "0.5rem" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  smart_toy
                </span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Asisten Akademik</p>
                <p style={{ fontSize: "0.7rem", opacity: 0.7 }}>Online</p>
              </div>
            </div>
            <div className="row" style={{ gap: "0.25rem" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  open_in_full
                </span>
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>
          </header>
          <div className="chat-widget-stream">
            <p className="text-dim" style={{ fontSize: "0.7rem", textAlign: "center" }}>
              ASISTEN · 10:00
            </p>
            <article className="chat-msg">
              Halo! Ada yang bisa saya bantu terkait jadwal kuliah atau materi
              Anda hari ini?
            </article>
            <p className="text-dim" style={{ fontSize: "0.7rem", textAlign: "right" }}>
              10:02 · MAHASISWA
            </p>
            <article className="chat-msg user">
              Kapan tenggat waktu pengumpulan tugas Kalkulus minggu ini?
            </article>
            <p className="text-dim" style={{ fontSize: "0.7rem", textAlign: "center" }}>
              ASISTEN · 10:02
            </p>
            <article className="chat-msg">
              Tugas Kalkulus bab Turunan dikumpulkan paling lambat Jumat, 24 Mei
              jam 23:59 melalui portal LMS. Anda masih memiliki sisa waktu 2 hari lagi.
            </article>
          </div>
          <footer className="chat-widget-foot">
            <span className="material-symbols-outlined" style={{ color: "var(--text-dim)", fontSize: 20 }}>
              attach_file
            </span>
            <input className="chat-widget-input" placeholder="Ketik pesan..." />
            <button className="btn" type="button" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            </button>
          </footer>
          <p className="text-dim" style={{ fontSize: "0.65rem", textAlign: "center", padding: "0.4rem" }}>
            Terakhir diperbarui hari ini 08:00
          </p>
        </section>
      </main>
    </>
  );
}
