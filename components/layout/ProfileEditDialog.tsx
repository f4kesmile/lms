"use client";

import AvatarEditor, { type AvatarEditorRef } from "react-avatar-editor";
import imageCompression from "browser-image-compression";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
import { DEFAULT_AVATAR_DATA_URL } from "@/lib/constants/avatar";

type EditableUser = {
  name: string;
  role: string;
  avatarBase64?: string | null;
};

type ProfileEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: EditableUser | null;
  onSaved: (user: EditableUser) => void;
};

function dataUrlToFile(dataUrl: string, fileName: string): File {
  const [meta, raw] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || "image/jpeg";
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], fileName, { type: mime });
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: ProfileEditDialogProps) {
  const editorRef = useRef<AvatarEditorRef | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    setName(user.name);
    setImageSource(user.avatarBase64 || null);
    setZoom(1);
    setRemoveAvatar(false);
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  async function handleSelectAvatar(file: File | null) {
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 8MB sebelum kompres.");
      return;
    }

    try {
      const preCompressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
        initialQuality: 0.9,
      });

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const nextBlobUrl = URL.createObjectURL(preCompressed);
      blobUrlRef.current = nextBlobUrl;
      setImageSource(nextBlobUrl);
      setRemoveAvatar(false);
      setZoom(1);
    } catch {
      toast.error("Gagal memproses gambar. Coba file lain.");
    }
  }

  async function handleSave() {
    if (!user || saving) return;

    const nextName = name.trim();
    if (nextName.length < 2) {
      toast.error("Nama minimal 2 karakter.");
      return;
    }

    setSaving(true);
    try {
      let avatarBase64: string | null = null;

      if (!removeAvatar && imageSource && editorRef.current) {
        const croppedDataUrl = editorRef.current
          .getImageScaledToCanvas()
          .toDataURL("image/jpeg", 0.92);

        const croppedFile = dataUrlToFile(croppedDataUrl, "avatar.jpg");
        const finalCompressed = await imageCompression(croppedFile, {
          maxSizeMB: 0.34,
          maxWidthOrHeight: 512,
          useWebWorker: true,
          initialQuality: 0.86,
          fileType: "image/jpeg",
        });

        avatarBase64 =
          await imageCompression.getDataUrlFromFile(finalCompressed);
      }

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          avatarBase64,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        user?: EditableUser;
      };

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Gagal menyimpan profil");
      }

      onSaved(data.user);
      toast.success("Profil berhasil diperbarui");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan server",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-drawer-md sm:max-w-lg border border-border rounded-md shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">
            Ubah Profil
          </DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            Atur nama dan avatar. Avatar akan disimpan sebagai base64
            terkompres.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="h-[220px] w-[220px] overflow-hidden rounded-full border border-border/40 bg-muted/40">
              {removeAvatar || !imageSource ? (
                <img
                  src={DEFAULT_AVATAR_DATA_URL}
                  alt="Avatar bawaan"
                  className="size-full object-cover"
                />
              ) : (
                <AvatarEditor
                  ref={editorRef}
                  image={imageSource}
                  width={220}
                  height={220}
                  border={0}
                  borderRadius={110}
                  scale={zoom}
                  rotate={0}
                />
              )}
            </div>

            <div className="w-full flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Zoom Avatar
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={removeAvatar || !imageSource}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="font-black text-[10px] uppercase tracking-widest"
                onClick={() => {
                  const input = document.getElementById("profile-avatar-input");
                  input?.click();
                }}
              >
                <Camera className="mr-2 size-4" />
                Pilih Avatar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="font-black text-[10px] uppercase tracking-widest text-destructive"
                onClick={() => {
                  setRemoveAvatar(true);
                  setImageSource(null);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Hapus Avatar
              </Button>
              <input
                id="profile-avatar-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  void handleSelectAvatar(e.target.files?.[0] || null);
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-name"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Nama Lengkap
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama baru"
              className="h-11 border-border"
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            className="font-black text-[11px] uppercase tracking-widest border border-border"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="font-black text-[11px] uppercase tracking-widest"
            onClick={() => {
              void handleSave();
            }}
            disabled={saving}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              "Simpan Profil"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
