import AppTopbar from "@/components/AppTopbar";

export default function ChatAIDemoPage() {
  return (
    <>
      <AppTopbar title="Asisten AI" />
      <main className="app-shell" style={{ display: "grid", gap: "1.5rem" }}>
        {/* Chat Stream */}
        <section className="chat-stream">
          {/* AI Message */}
          <article className="bubble">
            <p style={{ color: "var(--text-main)", lineHeight: 1.7 }}>
              Berdasarkan data perencanaan kota ekologis terbaru, penggabungan
              sistem irigasi terintegrasi secara vertikal ke dalam gedung pencakar langit dapat
              menurunkan suhu sekitar 3-5°C sekaligus mendaur ulang hingga 40% air limbah
              domestik (greywater).
            </p>
            <div className="row" style={{ marginTop: "0.75rem", flexWrap: "wrap" }}>
              <span className="pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                Urban Ecology 2024
              </span>
              <span className="pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                SustainableCities.org
              </span>
            </div>
            <div className="row" style={{ marginTop: "0.5rem", gap: "0.3rem" }}>
              <p className="text-dim" style={{ fontSize: "0.75rem" }}>RATING JAWABAN</p>
            </div>
          </article>

          {/* User Message */}
          <article className="bubble user">
            <p style={{ color: "var(--text-main)" }}>
              Bagaimana dampaknya terhadap integritas struktural bangunan beton tua jika kita
              melakukan retrofit dengan sistem ini?
            </p>
            <p className="text-dim" style={{ fontSize: "0.7rem", textAlign: "right", marginTop: "0.5rem" }}>
              01/01/2025 10:42
            </p>
          </article>

          {/* AI Message with references */}
          <article className="bubble">
            <p style={{ color: "var(--text-main)", lineHeight: 1.7 }}>
              Retrofitting struktur tua memerlukan analisis beban yang cermat. Sebagian besar
              bangunan beton abad ke-20 dapat menopang sistem hidroponik ringan (sekitar
              50kg/m²), namun &quot;dinding hijau&quot; berbasis tanah tradisional mungkin memerlukan
              penguatan struktural pada selubung eksterior.
            </p>
            <ul className="clean-list" style={{ marginTop: "0.75rem" }}>
              <li>Rasio berat terhadap luas harus di bawah batas struktural.</li>
              <li>Membran kedap air sangat penting untuk umur panjang beton.</li>
            </ul>
            <div className="row" style={{ marginTop: "0.75rem", flexWrap: "wrap" }}>
              <span className="pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                Architectural Digest Tech
              </span>
            </div>
            <div className="row" style={{ marginTop: "0.5rem", gap: "0.3rem" }}>
              <p className="text-dim" style={{ fontSize: "0.75rem" }}>RATING JAWABAN</p>
              <button className="btn-ghost" type="button" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                👍
              </button>
              <button className="btn-ghost" type="button" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                👎
              </button>
            </div>
          </article>
        </section>

        {/* Input Area */}
        <section
          style={{
            position: "sticky",
            bottom: 0,
            padding: "1rem 0",
            background: "var(--bg-dark)",
          }}
        >
          <div
            className="row"
            style={{
              gap: "0.5rem",
              border: "2px solid var(--border-primary-strong)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              background: "var(--bg-card)",
            }}
          >
            <input
              className="chat-widget-input"
              placeholder="Tanya tentang keberlanjutan kota..."
              style={{ border: "none", flex: 1, padding: "0.4rem" }}
            />
            <button className="btn" type="button" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              Kirim →
            </button>
          </div>
          <div className="row" style={{ justifyContent: "center", marginTop: "0.75rem", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="pill" style={{ cursor: "pointer", border: "1px solid var(--border-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
              Topik Terkini
            </button>
            <button className="pill" style={{ cursor: "pointer", border: "1px solid var(--border-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>psychology</span>
              Contoh Prompt
            </button>
            <button className="pill" style={{ cursor: "pointer", border: "1px solid var(--border-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
              Ekspor Chat
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
