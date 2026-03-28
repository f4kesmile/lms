"use client";

import { useHelpFaqs } from "@/app/(public)/help/_hooks/useHelpFaqs";
import { HELP_CATEGORIES } from "@/app/(public)/help/_lib/constants";
import { Icon } from "@/components/ui/icon";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function HelpClient() {
  const { isLoading, openId, displayedFaqs, toggleFaq } = useHelpFaqs();

  return (
    <main className="app-shell flex flex-col gap-14 pb-20">
      <section className="help-hero">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Apa yang bisa kami{" "}
          <span className="highlight text-primary">bantu?</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          Cari panduan, tutorial, dan jawaban atas pertanyaan umum seputar
          sistem pembelajaran.
        </p>
        <div className="help-search-bar relative max-w-xl mx-auto flex">
          <Icon
            name="search"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          />
          <input
            type="text"
            placeholder="Cari bantuan (misal: cara reset password)"
            className="flex-1 rounded-l-full border border-border border-r-0 bg-card pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            className="rounded-r-full bg-primary border border-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Cari
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-black">Kategori Bantuan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HELP_CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="neo-card flex flex-col items-start gap-3 p-6 bg-card border border-border rounded-xl transition-all hover:border-primary hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-primary-soft text-primary">
                <Icon name={cat.icon} size={24} />
              </div>
              <h3 className="font-bold text-lg">{cat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {cat.desc}
              </p>
              <span className="text-sm font-bold text-primary mt-2">
                {cat.link}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-foreground mb-2">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground text-sm">
            Temukan jawaban instan untuk kendala yang sering dialami mahasiswa.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">
            Memuat pertanyaan...
          </p>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
            {displayedFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={cn(
                    "rounded-xl border border-border bg-card overflow-hidden transition-colors",
                    isOpen && "border-primary",
                  )}
                >
                  <button
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold focus:outline-none"
                    onClick={() => toggleFaq(faq.id)}
                    type="button"
                  >
                    <span>{faq.question}</span>
                    <Icon
                      name="expand_more"
                      size={24}
                      className={cn(
                        "text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-primary",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="cta-green-banner rounded-2xl border border-border bg-gradient-to-br from-surface-primary-soft to-surface-secondary-soft p-10 text-center">
        <h3 className="text-2xl font-black text-primary mb-3">
          Masih butuh bantuan?
        </h3>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Tim dukungan teknis kami siap membantu Anda 24/7. Hubungi kami melalui
          kanal komunikasi resmi di bawah ini.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${SITE_CONFIG.supportEmail}`}
            className="btn flex items-center gap-2 px-6 py-3"
          >
            <Icon name="mail" size={20} />
            Kirim Email ke {SITE_CONFIG.name}
          </a>
          <a
            href="tel:+620000000000"
            className="btn-ghost flex items-center gap-2 border border-border px-6 py-3 hover:bg-muted"
          >
            <Icon name="call" size={20} />
            Hubungi Hotline
          </a>
        </div>
      </section>
    </main>
  );
}
