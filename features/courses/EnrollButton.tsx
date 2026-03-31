"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Key, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [open, setOpen] = useState(false);

  if (isEnrolled) {
    return (
      <Button asChild variant="secondary" className="w-full font-bold h-11 rounded-xl">
        <Link href={`/courses/${classId}`}>
          Lanjutkan Belajar
        </Link>
      </Button>
    );
  }

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/classes/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, enrollmentKey: key }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Berhasil mendaftar ke kelas.");
        setOpen(false);
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
      <Button 
        onClick={() => router.push("/login")} 
        variant="outline" 
        className="w-full font-bold h-11 rounded-xl border-primary text-primary hover:bg-primary/5"
      >
        Login untuk Daftar
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => {
          if (requiresKey) {
            setOpen(true);
          } else {
            handleEnroll();
          }
        }}
        disabled={loading}
        className="w-full font-bold h-11 rounded-xl shadow-lg shadow-primary/20"
      >
        {loading && !requiresKey ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GraduationCap className="mr-2 h-4 w-4" />
        )}
        Daftar ke Kelas
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Key className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-center">Pendaftaran Kelas</DialogTitle>
            <DialogDescription className="text-center font-medium">
              Kelas ini memerlukan kode khusus. Silakan masukkan kode pendaftaran Anda di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="enrollment-key" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Kode Pendaftaran
              </Label>
              <Input
                id="enrollment-key"
                placeholder="Ex: MAT-2024"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="h-12 bg-muted/50 border-none focus-visible:ring-primary rounded-xl font-bold placeholder:font-normal"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 flex flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl font-bold h-12 sm:flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={loading || !key.trim()}
              className="rounded-xl font-bold h-12 sm:flex-1 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Konfirmasi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
