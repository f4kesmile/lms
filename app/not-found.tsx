import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-primary/5 blur-[120px] [animation-delay:2s]" />
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center">
        <h1 className="text-[20rem] font-black leading-none tracking-tighter text-foreground/[0.03] md:text-[30rem] lg:text-[40rem]">
          404
        </h1>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">
            Halaman Tidak Ditemukan
          </span>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        <div className="max-w-2xl space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Tersesat di <br />
            <span className="bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent">
              Ruang Hampa
            </span>
          </h2>
          <p className="mx-auto max-w-md text-lg font-medium leading-relaxed text-muted-foreground">
            Alamat yang kamu tuju tidak tersedia atau telah berpindah. Mari kembali ke jalur pembelajaran yang benar.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/"
            className="group flex h-14 min-w-[220px] items-center justify-center gap-3 rounded-full bg-primary px-8 font-black text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            <Icon name="west" size={20} className="transition-transform group-hover:-translate-x-1" />
            Kembali Beranda
          </Link>
          <Link
            href="/courses"
            className="flex h-14 min-w-[220px] items-center justify-center gap-3 rounded-full border border-border bg-background/50 px-8 font-black text-foreground backdrop-blur-xl transition-all hover:bg-muted active:scale-95"
          >
            Pelajari Kursus
            <Icon name="east" size={20} />
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-12 z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-px bg-gradient-to-b from-primary/50 to-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
            Nusa Belajar &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
