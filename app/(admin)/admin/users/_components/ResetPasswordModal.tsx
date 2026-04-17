"use client";

import { useState } from "react";
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
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

interface ResetPasswordModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ResetResult {
  tempPassword: string;
  email: string;
  name: string;
}

export function ResetPasswordModal({
  userId,
  userName,
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResetResult | null>(null);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mereset password");
      }

      const data = (await response.json()) as ResetResult;
      setResult(data);
      toast.success("Password berhasil direset");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mereset password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      toast.success("Password berhasil disalin");
    }
  };

  const handleCopyCredentials = () => {
    if (result) {
      const text = `Email: ${result.email}\nPassword Sementara: ${result.tempPassword}`;
      navigator.clipboard.writeText(text);
      toast.success("Kredensial berhasil disalin");
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mobile-drawer-md sm:max-w-[450px] border border-border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-md shadow-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Icon name="lock_reset" className="text-primary" size={24} />
            Reset Password
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form untuk mereset password pengguna dan menampilkan password
            sementara
          </DialogDescription>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            {userName}
          </p>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-5 max-h-[60dvh] overflow-y-auto">
          {!result ? (
            <>
              <div className="rounded-md border border-border bg-secondary/40 p-4">
                <p className="flex items-start gap-2 text-sm font-bold text-muted-foreground">
                  <Icon
                    name="warning"
                    size={18}
                    className="shrink-0 mt-0.5 text-primary"
                  />
                  <span>
                    Password pengguna akan direset ke password sementara.
                    Pengguna harus mengubah password setelah login pertama kali.
                  </span>
                </p>
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={loading}
                className="h-11 font-bold uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Icon
                      name="autorenew"
                      size={18}
                      className="mr-2 animate-spin"
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icon name="lock_reset" size={18} className="mr-2" />
                    Reset Password Sekarang
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md border border-primary/35 bg-primary/10 p-4">
                <p className="flex items-start gap-2 text-sm font-bold text-foreground">
                  <Icon
                    name="check_circle"
                    size={18}
                    className="shrink-0 mt-0.5 text-primary"
                  />
                  <span>Password berhasil direset!</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={result.email}
                      className="font-bold text-sm bg-muted/50 cursor-text"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(result.email);
                        toast.success("Email disalin");
                      }}
                      title="Salin email"
                    >
                      <Icon name="content_copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Password Sementara
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={result.tempPassword}
                      type="text"
                      className="cursor-text border-primary/35 bg-primary/10 font-mono text-sm font-bold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleCopyPassword}
                      title="Salin password"
                    >
                      <Icon name="content_copy" size={16} />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Password ini hanya ditampilkan sekali. Pastikan disimpan
                    dengan aman.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCopyCredentials}
                className="h-10 font-bold uppercase tracking-wider text-xs"
              >
                <Icon name="content_copy" size={16} className="mr-2" />
                Salin Semua Kredensial
              </Button>
            </>
          )}
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {result ? "Tutup" : "Batal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
