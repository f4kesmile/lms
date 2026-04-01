"use client";

import { useHelpFaqs } from "@/app/(public)/help/_hooks/useHelpFaqs";
import { HELP_CATEGORIES } from "@/app/(public)/help/_lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronDown,
  Mail,
  PhoneCall,
  MessageCircleQuestion,
  LifeBuoy,
} from "lucide-react";

export default function HelpClient() {
  const {
    isLoading,
    openId,
    displayedFaqs,
    toggleFaq,
    searchQuery,
    setSearchQuery,
  } = useHelpFaqs();

  return (
    <main className="app-shell flex flex-col gap-14 pb-20">
      {/* Header synchronized with Catalog/About */}
      <header className="space-y-10 py-16 text-center border-b mb-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter lg:text-6xl mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent leading-[1.1]">
            Apa yang bisa kami{" "}
            <span className="text-primary italic">bantu?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
            "Cari panduan, tutorial, dan jawaban atas pertanyaan umum seputar
            sistem pembelajaran."
          </p>
        </div>

        {/* Real-time Scaled Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto w-full pt-4">
          <div className="relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Cari bantuan..."
              className="pl-16 h-20 rounded-[2rem] bg-muted/40 border-border/40 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg shadow-2xl shadow-black/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Categories Modern Cards */}
      <section className="flex flex-col gap-10 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-primary rounded-full" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            Kategori Bantuan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {HELP_CATEGORIES.map((cat) => (
            <Card
              key={cat.title}
              className="group border-border/60 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col rounded-[2.5rem] overflow-hidden bg-card/50 p-2"
            >
              <CardHeader className="space-y-4 pb-4 px-8 pt-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <Icon name={cat.icon} size={24} />
                </div>
                <CardTitle className="text-xl font-black tracking-tighter">
                  {cat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-6 flex-1">
                  {cat.desc}
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary border-t pt-4 border-dashed border-border/80 group-hover:translate-x-2 transition-transform cursor-pointer flex items-center gap-2">
                  {cat.link}
                  <Icon name="arrow_forward" size={14} />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section with Balanced Typography */}
      <section className="flex flex-col gap-10 pt-10">
        <div className="flex flex-col items-center gap-3 text-center mb-4">
          <div className="p-3 rounded-[1.5rem] bg-primary/10 text-primary mb-2">
            <MessageCircleQuestion className="h-8 w-8" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">FAQ</h2>
          <p className="text-muted-foreground font-medium text-base">
            Pertanyaan yang paling sering diajukan mahasiswa
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse">
              <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
                Memuat Data...
              </p>
            </div>
          ) : displayedFaqs.length === 0 ? (
            <div className="py-20 text-center bg-muted/20 border-2 border-dashed rounded-[3rem] border-border/50">
              <p className="text-muted-foreground font-bold">
                Tidak ada bantuan yang cocok untuk "{searchQuery}"
              </p>
            </div>
          ) : (
            displayedFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <Card
                  key={faq.id}
                  className={cn(
                    "rounded-[2rem] border-border/60 bg-card/50 overflow-hidden transition-all duration-300",
                    isOpen
                      ? "shadow-2xl shadow-primary/5 ring-1 ring-primary/20 scale-[1.02]"
                      : "hover:bg-card",
                  )}
                >
                  <button
                    className="flex w-full items-center justify-between gap-6 p-8 text-left focus:outline-none group"
                    onClick={() => toggleFaq(faq.id)}
                    type="button"
                  >
                    <span className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted transition-all duration-300",
                        isOpen &&
                          "bg-primary text-primary-foreground rotate-180",
                      )}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-8 pb-8 text-muted-foreground font-medium leading-relaxed border-t border-dashed border-border/60 pt-6 mx-8 mb-4">
                      {faq.answer}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Support CTA aligned with Elite System */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] border border-primary/20 p-12 md:p-16 text-center mt-8 group">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="mx-auto h-16 w-16 bg-background rounded-2xl shadow-xl flex items-center justify-center text-primary mb-6">
              <LifeBuoy className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-black tracking-tight text-foreground">
              Masih butuh bantuan?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
              Tim dukungan teknis kami siap membantu Anda 24/7. Hubungi kami
              melalui kanal komunikasi resmi di bawah ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href={`mailto:${SITE_CONFIG.supportEmail}`}
              className="btn flex items-center gap-3 px-10 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
            >
              <Mail className="h-5 w-5" />
              Kirim Email
            </a>
            <a
              href="tel:+620000000000"
              className="btn-ghost flex items-center gap-3 border-2 border-border/80 px-10 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-background transition-all"
            >
              <PhoneCall className="h-5 w-5 text-primary" />
              Hotline 24/7
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
