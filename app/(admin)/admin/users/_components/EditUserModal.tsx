"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
  nip: string | null;
  specialization: string | null;
}

interface EditUserModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, data: Partial<UserItem>) => Promise<void>;
  loading: boolean;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSave,
  loading,
}: EditUserModalProps) {
  const isMahasiswa = user?.role === "mahasiswa";
  const identifierLabel = isMahasiswa ? "NPM" : "NIP / NIPY";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const specialization = String(formData.get("specialization") ?? "").trim();

    await onSave(user.id, {
      nip: identifier || null,
      specialization: isMahasiswa ? null : specialization || null,
    });
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-drawer-md sm:max-w-[425px] border border-border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-md shadow-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Icon name="person" className="text-primary" size={24} />
            Edit Profil Akademik
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form untuk memperbarui identitas akademik pengguna, termasuk NIP/NPM
            dan bidang keahlian.
          </DialogDescription>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            {user.role} — {user.name}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {identifierLabel}
            </label>
            <div className="relative">
              <Icon
                name="badge"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                name="identifier"
                defaultValue={user.nip ?? ""}
                placeholder={
                  isMahasiswa ? "Contoh: 23101100..." : "Contoh: 19800101..."
                }
                className="pl-10 h-11 border-border font-bold text-sm bg-muted/20 focus-visible:ring-primary/20"
                disabled={loading}
              />
            </div>
          </div>

          {!isMahasiswa && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Bidang Keahlian
              </label>
              <div className="relative">
                <Icon
                  name="psychology"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  name="specialization"
                  defaultValue={user.specialization ?? ""}
                  placeholder="Contoh: Machine Learning, UI/UX..."
                  className="pl-10 h-11 border-border font-bold text-sm bg-muted/20 focus-visible:ring-primary/20"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-black uppercase tracking-widest text-[10px] h-10 px-6"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="font-black uppercase tracking-widest text-[10px] h-10 px-8"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
