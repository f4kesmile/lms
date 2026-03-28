"use client";

import { Suspense } from "react";

import { DataViewportControls } from "@/app/(admin)/admin/_components/Controls";
import { EditUserModal } from "@/app/(admin)/admin/users/_components/EditUserModal";
import { Filters } from "@/app/(admin)/admin/users/_components/Filters";
import { List } from "@/app/(admin)/admin/users/_components/List";
import { Table } from "@/app/(admin)/admin/users/_components/Table";
import { useUsersController } from "@/app/(admin)/admin/users/_hooks/useUsersController";
import { ROLE_CONFIG } from "@/app/(admin)/admin/users/_lib/constants";
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

  return (
    <AdminLayout title="Manajemen Sivitas Akademika">
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
          />

          <List
            users={users}
            loading={loading}
            error={error}
            roleConfig={ROLE_CONFIG}
            handleRoleChange={handleRoleChange}
            onEdit={handleEditClick}
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
        </div>
      </Suspense>
    </AdminLayout>
  );
}
