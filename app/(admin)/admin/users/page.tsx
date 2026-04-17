"use client";

import { Suspense, useState } from "react";

import { DataViewportControls } from "@/app/(admin)/admin/_components/Controls";
import { CreateUserModal } from "@/app/(admin)/admin/users/_components/CreateUserModal";
import { EditUserModal } from "@/app/(admin)/admin/users/_components/EditUserModal";
import { ResetPasswordModal } from "@/app/(admin)/admin/users/_components/ResetPasswordModal";
import { Filters } from "@/app/(admin)/admin/users/_components/Filters";
import { List } from "@/app/(admin)/admin/users/_components/List";
import { Table } from "@/app/(admin)/admin/users/_components/Table";
import { useUsersController } from "@/app/(admin)/admin/users/_hooks/useUsersController";
import { ROLE_CONFIG } from "@/app/(admin)/admin/users/_lib/constants";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminUsersPage() {
  const {
    users,
    search,
    setSearch,
    role,
    setRole,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    startItem,
    endItem,
    selectedUser,
    isModalOpen,
    setIsModalOpen,
    handleRoleChange,
    handleUpdateUser,
    handleEditClick,
  } = useUsersController();

  const [resetPasswordUser, setResetPasswordUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const handleCreateUserSuccess = () => {
    // Reset page to 1 to reload user list and show newly created user
    setPage(1);
  };

  return (
    <AdminLayout
      title="Manajemen Sivitas Akademika"
      headerActions={
        <Button
          onClick={() => setIsCreateUserModalOpen(true)}
          className="rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Icon name="person_add" size={18} className="mr-2" />
          Tambah User
        </Button>
      }
    >
      <Suspense
        fallback={
          <div className="h-[60dvh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <Filters
            search={search}
            setSearch={setSearch}
            role={role}
            setRole={setRole}
            totalUsers={total}
          />

          <Table
            users={users}
            loading={loading}
            error={error}
            roleConfig={ROLE_CONFIG}
            handleRoleChange={handleRoleChange}
            onEdit={handleEditClick}
            onResetPassword={(user) =>
              setResetPasswordUser({ id: user.id, name: user.name })
            }
          />

          <List
            users={users}
            loading={loading}
            error={error}
            roleConfig={ROLE_CONFIG}
            handleRoleChange={handleRoleChange}
            onEdit={handleEditClick}
            onResetPassword={(user) =>
              setResetPasswordUser({ id: user.id, name: user.name })
            }
          />

          <DataViewportControls
            startItem={startItem}
            endItem={endItem}
            totalItems={total}
            rowsPerPage={limit}
            onRowsPerPageChange={setLimit}
            entityLabel="pengguna"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />

          <EditUserModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleUpdateUser}
            loading={loading}
          />

          <ResetPasswordModal
            userId={resetPasswordUser?.id ?? ""}
            userName={resetPasswordUser?.name ?? ""}
            isOpen={!!resetPasswordUser}
            onClose={() => setResetPasswordUser(null)}
          />

          <CreateUserModal
            isOpen={isCreateUserModalOpen}
            onClose={() => setIsCreateUserModalOpen(false)}
            onSuccess={handleCreateUserSuccess}
          />
        </div>
      </Suspense>
    </AdminLayout>
  );
}
