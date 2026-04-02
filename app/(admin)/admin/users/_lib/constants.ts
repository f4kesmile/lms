import type {
  RoleConfigItem,
  UserRole,
} from "@/app/(admin)/admin/users/_lib/types";

export const ROLE_CONFIG: Record<UserRole, RoleConfigItem> = {
  admin: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: "Administrator",
    icon: "shield",
  },
  dosen: {
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Dosen Pengajar",
    icon: "person",
  },
  mahasiswa: {
    bg: "bg-secondary-brand/10",
    text: "text-secondary-brand",
    label: "Mahasiswa",
    icon: "school",
  },
};
