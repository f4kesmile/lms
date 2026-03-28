import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/ui/icon";
import { SITE_CONFIG } from "@/lib/constants";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-12 pb-20">
        <section className="glass-panel flex flex-col items-center justify-center p-12 text-center bg-card border border-border">
          <h1 className="title-xl text-foreground mb-4">
            Tentang{" "}
            <span className="accent text-primary border-primary">
              {SITE_CONFIG.name}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            Kami hadir untuk menjembatani batasan ruang dan waktu dalam
            pendidikan. {SITE_CONFIG.name} adalah platform pembelajaran cerdas
            yang memadukan keahlian akademik dengan kecanggihan kecerdasan
            buatan.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <article className="content-card bg-card border border-border p-8 rounded-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-primary-soft text-primary">
                <Icon name="visibility" size={28} />
              </div>
              <h2 className="title-lg m-0">Visi Kami</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Menjadi pionir platform pendidikan jarak jauh terdepan di Asia
              Tenggara yang paling mudah diakses, adaptif, dan responsif
              terhadap kebutuhan belajar setiap individu melalui teknologi AI.
            </p>
          </article>

          <article className="content-card bg-card border border-border p-8 rounded-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-primary-soft text-primary">
                <Icon name="flag" size={28} />
              </div>
              <h2 className="title-lg m-0">Misi Utama</h2>
            </div>
            <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-2">
              <li>
                Menyediakan infrastruktur digital yang inklusif untuk kolaborasi
                antara dosen dan mahasiswa.
              </li>
              <li>
                Mengotomatisasi pencarian litelatur akademik menggunakan asisten
                kecerdasan buatan.
              </li>
              <li>
                Menjaga ekosistem belajar yang terukur melalui wawasan analitik
                mendalam.
              </li>
            </ul>
          </article>
        </section>

        <section className="flex flex-col items-center mt-8">
          <h2 className="title-lg inline-block border-b-4 border-primary pb-1 mb-8">
            Tim Pendiri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="content-card flex flex-col items-center bg-card border border-border p-8 rounded-xl text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {item === 1 ? "A" : item === 2 ? "B" : "C"}
                </div>
                <h3 className="text-lg font-bold">Inovator {item}</h3>
                <p className="text-sm text-muted-foreground">
                  Co-founder & Edu-Tech Lead
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
