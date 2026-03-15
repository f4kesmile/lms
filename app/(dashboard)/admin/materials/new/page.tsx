"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, Pencil, Printer, Save } from "lucide-react";

const A4_CHAR_LIMIT = 1900;

type MaterialForm = {
  title: string;
  module: string;
  pages: string[];
};

export default function NewMaterialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") === "courses" ? "courses" : "knowledge";

  const [submitting, setSubmitting] = useState(false);
  const [printPreview, setPrintPreview] = useState(false);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
    redirectTo?: Route;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const [form, setForm] = useState<MaterialForm>({
    title: "",
    module: "",
    pages: [""],
  });

  const backHref = useMemo<Route>(
    () => (from === "courses" ? "/admin/courses" : "/admin/knowledge"),
    [from],
  );

  function handlePageChange(pageIndex: number, value: string) {
    const nextPages = [...form.pages];
    nextPages[pageIndex] = value;

    for (let index = 0; index < nextPages.length; index += 1) {
      while (nextPages[index].length > A4_CHAR_LIMIT) {
        const overflow = nextPages[index].slice(A4_CHAR_LIMIT);
        nextPages[index] = nextPages[index].slice(0, A4_CHAR_LIMIT);

        if (nextPages[index + 1] !== undefined) {
          nextPages[index + 1] = overflow + nextPages[index + 1];
        } else {
          nextPages.push(overflow);
        }
      }
    }

    while (
      nextPages.length > 1 &&
      nextPages[nextPages.length - 1].trim().length === 0
    ) {
      nextPages.pop();
    }

    if (
      nextPages[nextPages.length - 1].length >= A4_CHAR_LIMIT &&
      nextPages.length < 50
    ) {
      nextPages.push("");
    }

    setForm((prev) => ({ ...prev, pages: nextPages.slice(0, 50) }));
  }

  async function submitMaterial() {
    const normalizedPages = form.pages.filter((page) => page.trim().length > 0);

    if (!form.title.trim() || !form.module.trim()) {
      setNotice({
        open: true,
        title: "Data Belum Lengkap",
        message: "Judul dan modul materi wajib diisi.",
      });
      return;
    }

    if (normalizedPages.length === 0) {
      setNotice({
        open: true,
        title: "Isi Materi Kosong",
        message: "Isi materi belum diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const content = normalizedPages.join("\n\n=== HALAMAN BARU ===\n\n");
      const res = await fetch("/api/kb/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          module: form.module,
          page: `1-${normalizedPages.length}`,
          content,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menyimpan materi");
      }

      setNotice({
        open: true,
        title: "Berhasil",
        message: "Materi berhasil disimpan ke Bank Materi.",
        redirectTo: "/admin/knowledge",
      });
    } catch (error) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          error instanceof Error ? error.message : "Gagal menyimpan materi",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitMaterial();
  }

  return (
    <AdminLayout
      title="Editor Materi A4"
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="font-bold">
            <Link href={backHref}>
              <ArrowLeft className="mr-1 size-4" />
              Kembali
            </Link>
          </Button>
          <Button
            variant="outline"
            className="font-bold"
            onClick={() => setPrintPreview((prev) => !prev)}
          >
            {printPreview ? (
              <Pencil className="mr-1 size-4" />
            ) : (
              <Eye className="mr-1 size-4" />
            )}
            {printPreview ? "Mode Edit" : "Pratinjau Cetak"}
          </Button>
          <Button
            variant="outline"
            className="font-bold"
            onClick={() => window.print()}
          >
            <Printer className="mr-1 size-4" />
            Cetak/PDF
          </Button>
          <Button
            className="font-bold"
            type="button"
            onClick={() => void submitMaterial()}
            disabled={submitting}
          >
            <Save className="mr-1 size-4" />
            {submitting ? "Menyimpan..." : "Simpan Materi"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-border/60 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Judul Materi
              </label>
              <Input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-11"
                placeholder="Contoh: Pengantar Basis Data"
              />
            </div>
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Modul
              </label>
              <Input
                required
                value={form.module}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, module: e.target.value }))
                }
                className="h-11"
                placeholder="Contoh: Modul 1"
              />
            </div>
          </div>
          <div className="mt-3 rounded-md border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
            Semua data dari halaman ini langsung tersimpan ke Bank Materi, jadi
            sinkron dengan menu Bank Materi.
          </div>
        </Card>

        <div className="a4-print-root max-h-[68dvh] space-y-6 overflow-y-auto pr-1">
          {form.pages.map((page, index) => (
            <div
              key={`a4-editor-page-${index}`}
              className="mx-auto w-full max-w-[760px]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Halaman {index + 1}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {page.length}/{A4_CHAR_LIMIT} karakter
                </span>
              </div>
              <div className="a4-sheet relative overflow-hidden rounded-md border border-border/60 bg-white px-[68px] pb-[72px] pt-[64px] shadow-sm">
                {printPreview ? (
                  <div className="min-h-[900px] whitespace-pre-wrap text-[15px] leading-7 text-slate-900">
                    {page.trim().length > 0 ? page : "(Halaman kosong)"}
                  </div>
                ) : (
                  <textarea
                    value={page}
                    onChange={(e) => handlePageChange(index, e.target.value)}
                    className="min-h-[900px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-slate-900 outline-none"
                    placeholder="Tulis konten materi di sini..."
                  />
                )}

                <div className="a4-footer pointer-events-none absolute bottom-0 left-[68px] right-[68px] flex items-center justify-between border-t border-slate-300 py-2 text-xs text-slate-600">
                  <span>{form.title || "Judul Materi"}</span>
                  <span>Halaman {index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .a4-print-root,
          .a4-print-root * {
            visibility: visible !important;
          }

          .a4-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .a4-sheet {
            box-shadow: none !important;
            border: 1px solid #bbb !important;
            break-inside: avoid;
            page-break-inside: avoid;
            margin: 0 0 12mm 0 !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <Dialog
        open={notice.open}
        onOpenChange={(open) => {
          setNotice((prev) => ({ ...prev, open }));
          if (!open && notice.redirectTo) {
            router.push(notice.redirectTo);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{notice.title}</DialogTitle>
            <DialogDescription>{notice.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                const redirectTo = notice.redirectTo;
                setNotice((prev) => ({
                  ...prev,
                  open: false,
                  redirectTo: undefined,
                }));
                if (redirectTo) router.push(redirectTo);
              }}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
