import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { Compass, Target, ShieldCheck, Rocket, Lightbulb } from "lucide-react";

export default function AboutPage() {
  const founders = [
    {
      name: "Adhim Awalul Khakim",
      role: "CEO & Lead Developer",
      description: "Visi Teknologi & Arsitektur Sistem Utama",
    },
    {
      name: "Raka Briliant Purwo S.",
      role: "COO & Product Manager",
      description: "Operasional & Pengembangan Produk",
    },
    {
      name: "Putri Dwi Oktavia",
      role: "CFO & Marketing Management",
      description: "Manajemen Keuangan & Strategi Pemasaran",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-14 pb-20 max-w-7xl mx-auto w-full px-4 lg:px-0">
        {/* Simplified Hero Section matching Catalog Header */}
        <header className="space-y-10 py-16 text-center border-b mb-6">
          <div className="space-y-4 px-4">
            <h1 className="text-5xl font-black tracking-tighter lg:text-6xl mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent leading-[1.1]">
              Membangun Masa Depan <br />
              <span className="text-primary italic">Pendidikan Cerdas</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
              "{SITE_CONFIG.name} hadir untuk menjembatani batasan ruang dan
              waktu dalam pendidikan melalui perpaduan keahlian akademik dan
              AI."
            </p>
          </div>
        </header>

        {/* Vision & Mission Sections matching Catalog Grid style gap */}
        <section className="grid md:grid-cols-2 gap-10">
          <Card className="group border-border/60 shadow-sm hover:shadow-2xl transition-all flex flex-col rounded-[3rem] overflow-hidden bg-card/50 p-4">
            <CardHeader className="space-y-4 pb-5 px-10 pt-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                <Compass size={24} strokeWidth={2.5} />
              </div>
              <CardTitle className="text-2xl font-black tracking-tighter leading-[1.2]">
                Visi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <p className="text-muted-foreground text-base leading-relaxed font-medium">
                Menjadi pionir platform pendidikan jarak jauh terdepan di Asia
                Tenggara yang paling mudah diakses, adaptif, dan responsif
                terhadap kebutuhan belajar setiap individu melalui teknologi AI.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/60 shadow-sm hover:shadow-2xl transition-all flex flex-col rounded-[3rem] overflow-hidden bg-card/50 p-4">
            <CardHeader className="space-y-4 pb-5 px-10 pt-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <CardTitle className="text-2xl font-black tracking-tighter leading-[1.2]">
                Misi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <ul className="space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    text: "Infrastruktur digital inklusif.",
                  },
                  { icon: Rocket, text: "Otomatisasi literatur via AI." },
                  { icon: Lightbulb, text: "Wawasan analitik mendalam." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-center group/item">
                    <div className="p-1 rounded-md bg-muted text-primary/60 group-hover/item:text-primary transition-colors">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm text-muted-foreground font-bold">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Founders Section matching Catalog Card Style */}
        <section className="flex flex-col gap-10 pt-10">
          <div className="flex items-center gap-3 px-4">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Tim Pendiri
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {founders.map((founder, i) => (
              <Card
                key={i}
                className="group border-border/60 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col rounded-[3rem] overflow-hidden bg-card/50"
              >
                <CardHeader className="space-y-5 pb-5 px-10 pt-10">
                  <CardTitle className="text-2xl font-black tracking-tighter leading-[1.2] group-hover:text-primary transition-all">
                    {founder.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 pt-4 text-xs font-bold text-foreground">
                    <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-black text-muted-foreground shadow-md transition-transform group-hover:scale-110">
                      {getInitials(founder.name)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-muted-foreground/60 text-[9px] uppercase tracking-widest leading-none mb-1.5 font-black">
                        Jabatan
                      </span>
                      <span className="italic font-bold">{founder.role}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 px-10 pb-10 pt-5">
                  <div className="py-6 border-t border-dashed border-border/80">
                    <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
                      "{founder.description}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
