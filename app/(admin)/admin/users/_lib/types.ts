export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
  nip: string | null;
  specialization: string | null;
  createdAt: string;
};

export type UsersResponse = {
  users: UserItem[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
};

export type UserRole = UserItem["role"];

export type RoleConfigItem = {
  bg: string;
  text: string;
  label: string;
  icon: string;
};
