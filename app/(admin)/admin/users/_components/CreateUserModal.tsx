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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type UserRole = "mahasiswa" | "dosen" | "admin";

interface FormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nip: string;
  specialization: string;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "mahasiswa",
    nip: "",
    specialization: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    if (formData.role !== "mahasiswa" && !formData.nip.trim()) {
      newErrors.nip = `${formData.role === "dosen" ? "NIP" : "NIPY"} harus diisi`;
    }
    if (formData.role === "dosen" && !formData.specialization.trim()) {
      newErrors.specialization = "Bidang keahlian harus diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon lengkapi form dengan benar");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          role: formData.role,
          nip:
            formData.role === "mahasiswa"
              ? formData.nip.trim() || null
              : formData.nip.trim() || null,
          specialization:
            formData.role === "dosen"
              ? formData.specialization.trim() || null
              : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal membuat user");
      }

      const data = await response.json();
      toast.success(`User ${data.name} berhasil dibuat`);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "mahasiswa",
        nip: "",
        specialization: "",
      });

      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat user",
      );
    } finally {
      setLoading(false);
    }
  };

  const isMahasiswa = formData.role === "mahasiswa";
  const identifierLabel = isMahasiswa ? "NPM" : "NIP";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-drawer-md sm:max-w-[500px] border border-border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-md shadow-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Icon name="person_add" className="text-primary" size={24} />
            Tambah User Baru
          </DialogTitle>
          <DialogDescription className="sr-only">
            Form untuk membuat user baru di sistem
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-5 max-h-[70dvh] overflow-y-auto"
        >
          {/* Nama */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Nama Lengkap <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Icon
                name="person"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={16}
              />
              <Input
                type="text"
                placeholder="Salsa Billa"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={loading}
                className={`pl-10 h-11 border border-border font-bold text-sm bg-muted/50 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${
                  errors.name ? "border-destructive bg-destructive/5" : ""
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Icon
                name="email"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={16}
              />
              <Input
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
                className={`pl-10 h-11 border border-border font-bold text-sm bg-muted/50 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${
                  errors.email ? "border-destructive bg-destructive/5" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Icon
                name="lock"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={16}
              />
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
                className={`pl-10 h-11 border border-border font-bold text-sm bg-muted/50 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${
                  errors.password ? "border-destructive bg-destructive/5" : ""
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Peran Akun <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                handleInputChange("role", value as UserRole)
              }
              disabled={loading}
            >
              <SelectTrigger className="h-11 border border-border bg-muted/50 font-bold text-sm focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mahasiswa" className="font-bold">
                  Mahasiswa
                </SelectItem>
                <SelectItem value="dosen" className="font-bold">
                  Dosen
                </SelectItem>
                <SelectItem value="admin" className="font-bold">
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* NIP / NPM */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {identifierLabel}
              {formData.role !== "mahasiswa" && (
                <span className="text-destructive">*</span>
              )}
            </label>
            <div className="relative">
              <Icon
                name="badge"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={16}
              />
              <Input
                type="text"
                placeholder={isMahasiswa ? "23101100001" : "198001011234"}
                value={formData.nip}
                onChange={(e) => handleInputChange("nip", e.target.value)}
                disabled={loading}
                className={`pl-10 h-11 border border-border font-bold text-sm bg-muted/50 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${
                  errors.nip ? "border-destructive bg-destructive/5" : ""
                }`}
              />
            </div>
            {errors.nip && (
              <p className="text-xs text-destructive font-medium">
                {errors.nip}
              </p>
            )}
          </div>

          {/* Specialization (untuk Dosen) */}
          {!isMahasiswa && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Bidang Keahlian{" "}
                {formData.role === "dosen" && (
                  <span className="text-destructive">*</span>
                )}
              </label>
              <div className="relative">
                <Icon
                  name="school"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  size={16}
                />
                <Input
                  type="text"
                  placeholder="Teknik Informatika"
                  value={formData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  disabled={loading}
                  className={`pl-10 h-11 border border-border font-bold text-sm bg-muted/50 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${
                    errors.specialization
                      ? "border-destructive bg-destructive/5"
                      : ""
                  }`}
                />
              </div>
              {errors.specialization && (
                <p className="text-xs text-destructive font-medium">
                  {errors.specialization}
                </p>
              )}
            </div>
          )}

          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <p className="flex items-start gap-2 text-xs font-bold text-muted-foreground">
              <Icon
                name="info"
                size={16}
                className="shrink-0 mt-0.5 text-primary"
              />
              <span>
                User akan dibuat dengan password yang telah Anda masukkan.
                Pastikan password diingat atau dicatat dengan aman.
              </span>
            </p>
          </div>
        </form>

        <DialogFooter className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="font-bold uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Icon
                  name="autorenew"
                  size={18}
                  className="mr-2 animate-spin"
                />
                Membuat...
              </>
            ) : (
              <>
                <Icon name="person_add" size={18} className="mr-2" />
                Buat User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
