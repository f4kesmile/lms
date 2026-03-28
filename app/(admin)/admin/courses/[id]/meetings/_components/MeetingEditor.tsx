"use client";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-tomorrow_night_eighties";

import { useState } from "react";
import AceEditor from "react-ace";
import { toast } from "sonner";

import { type SubjectMeetingItem } from "@/app/(admin)/admin/courses/[id]/meetings/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  createSubjectMeetingAction,
  updateSubjectMeetingAction,
} from "@/lib/actions/meeting";

interface MeetingEditorProps {
  subjectId: string;
  open: boolean;
  onClose: () => void;
  editingMeeting: SubjectMeetingItem | null;
  onSuccess: () => void;
  nextMeetingNo: number;
}

export function MeetingEditor({
  subjectId,
  open,
  onClose,
  editingMeeting,
  onSuccess,
  nextMeetingNo,
}: MeetingEditorProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: editingMeeting?.title || "",
    content: editingMeeting?.content || "",
    meetingNo: editingMeeting?.meetingNo || nextMeetingNo,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Judul dan konten materi wajib diisi");
      return;
    }

    setLoading(true);
    const res = editingMeeting
      ? await updateSubjectMeetingAction(editingMeeting.id, form)
      : await createSubjectMeetingAction({ ...form, subjectId });

    if (res.success) {
      toast.success(
        editingMeeting ? "Pertemuan diperbarui" : "Pertemuan ditambahkan",
      );
      onSuccess();
      onClose();
    } else {
      toast.error(res.error || "Gagal menyimpan");
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar (Maks 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const markdownImage = `\n![Alt Text](${base64})\n`;
      setForm((prev) => ({ ...prev, content: prev.content + markdownImage }));
      toast.success("Gambar berhasil disisipkan");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-7xl h-[90dvh] flex flex-col p-0 border-none rounded-3xl overflow-hidden bg-background">
        <DialogHeader className="p-6 border-b border-border/50 bg-card/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-black tracking-tight mb-2">
                {editingMeeting ? "Edit Sesi Pertemuan" : "Tambah Sesi Baru"}
              </DialogTitle>
              <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-2 bg-background/50 rounded-xl px-3 py-1 border border-border/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Pertemuan Ke-
                  </span>
                  <input
                    type="number"
                    value={form.meetingNo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        meetingNo: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-12 bg-transparent outline-none font-black text-primary text-sm text-center"
                  />
                </div>
                <div className="flex-[4]">
                  <Input
                    placeholder="Masukkan Judul Pertemuan (Materi Utama)"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="h-9 bg-background/50 border-border/30 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-xl font-bold"
                onClick={onClose}
              >
                Batal
              </Button>
              <Button
                disabled={loading}
                onClick={handleSubmit}
                className="rounded-xl min-w-[140px] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                {loading
                  ? "Menyimpan..."
                  : editingMeeting
                    ? "Update Sesi"
                    : "Simpan Sesi"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col border-r border-border/50 h-full overflow-hidden bg-[#1D1E1F]">
            <div className="px-4 py-2 bg-black/20 flex items-center justify-between border-b border-border/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Markdown Material Editor
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-all">
                  <Icon name="image" size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Sisipkan Gambar
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            <div className="flex-1 relative">
              <AceEditor
                mode="markdown"
                theme="tomorrow_night_eighties"
                name="meeting-content-editor"
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  fontSize: 14,
                  lineHeight: 1.8,
                  wrap: true,
                  showPrintMargin: false,
                  fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                }}
                width="100%"
                height="100%"
                className="bg-transparent"
              />
            </div>
          </div>

          <div className="hidden lg:flex flex-col h-full overflow-hidden bg-background">
            <div className="px-4 py-2 bg-muted/50 flex items-center justify-between border-b border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Live Material Preview
              </span>
              <div className="flex items-center gap-1">
                <Icon name="visibility" size={14} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Render Output
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black prose-img:rounded-3xl prose-img:shadow-2xl">
              {form.content ? (
                <div className="space-y-4">
                  <h1 className="text-3xl font-black tracking-tight text-foreground">
                    {form.title}
                  </h1>
                  <div className="w-20 h-1.5 bg-primary rounded-full mb-8" />
                  <pre className="whitespace-pre-wrap font-sans text-foreground/80 leading-7">
                    {form.content}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 italic">
                  <Icon name="auto_stories" size={48} className="mb-4" />
                  Pratinjau materi akan muncul di sini...
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
