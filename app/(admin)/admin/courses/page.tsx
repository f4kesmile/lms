"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { DataViewportControls } from "@/app/(admin)/admin/_components/Controls";
import { CourseDialogs } from "@/app/(admin)/admin/courses/_components/Dialogs";
import { Filters } from "@/app/(admin)/admin/courses/_components/Filters";
import { List } from "@/app/(admin)/admin/courses/_components/List";
import { Table } from "@/app/(admin)/admin/courses/_components/Table";
import { useCoursesController } from "@/app/(admin)/admin/courses/_hooks/useCoursesController";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/index";

export default function AdminCoursesPage() {
  const {
    activeTab,
    setActiveTab,
    activeYearLabel,
    addButtonLabel,
    classForm,
    classes,
    confirmState,
    editingClass,
    editingSubject,
    editingYear,
    endItem,
    entityLabel,
    handleClassSubmit,
    handleDeleteItem,
    handleEditItem,
    handleSubjectSubmit,
    handleYearSubmit,
    loading,
    meta,
    notice,
    onRowsPerPageChange,
    onYearActive,
    openCreateDialog,
    page,
    pagedData,
    roleChecked,
    rowsPerPage,
    searchPlaceholder,
    searchQuery,
    setClassForm,
    setConfirmState,
    setNotice,
    setPage,
    setSearchQuery,
    setShowClassModal,
    setShowSubjectModal,
    setShowYearModal,
    setSubjectForm,
    setYearForm,
    showClassModal,
    showSubjectModal,
    showYearModal,
    startItem,
    subjectCourses,
    subjectForm,
    totalItems,
    totalPages,
    yearForm,
    // New
    showManageSubjectsModal,
    setShowManageSubjectsModal,
    classSubjects,
    handleAssignSubject,
    handleRemoveSubject,
  } = useCoursesController();

  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  if (!roleChecked) {
    return (
      <AdminLayout title="Pusat Akademik">
        <div className="h-[60dvh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Pusat Akademik"
      headerActions={
        <div className="flex items-center gap-3">
          {activeTab === "mataKuliah" && (
            <Tooltip open={mounted && !isDesktop ? undefined : false}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className={cn(
                    "font-extrabold border border-border shadow-sm transition-all rounded-md h-10 px-4",
                    !isDesktop && "px-0 w-10",
                  )}
                  asChild
                >
                  <Link
                    href={{
                      pathname: "/admin/materials/new",
                      query:
                        activeTab === "mataKuliah"
                          ? { from: "courses" }
                          : { from: "knowledge" },
                    }}
                  >
                    <Icon name="upload_file" size={20} />
                    {isDesktop && <span className="ml-2">Upload Materi</span>}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-bold">
                Upload Materi Baru
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip open={mounted && !isDesktop ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "font-extrabold border-2 border-primary/20 text-primary hover:bg-primary hover:text-white shadow-xl transition-all rounded-md h-10 px-6 bg-primary/5 hover:border-primary",
                  !isDesktop && "px-0 w-10 border",
                )}
                onClick={openCreateDialog}
              >
                <Icon name="add_circle" size={20} />
                {isDesktop && <span className="ml-2">{addButtonLabel}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-bold">
              {addButtonLabel} Baru
            </TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="h-[60dvh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <div className="space-y-8">
          {activeYearLabel && (
            <div className="relative inline-flex overflow-hidden rounded-md border border-primary/20 bg-card p-1 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
              <div className="relative flex items-center gap-3 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-4 ring-primary/20">
                  <Icon name="calendar_month" size={12} />
                </div>
                <span>
                  TAHUN AKTIF:{" "}
                  <span className="text-foreground ml-1.5 opacity-90 drop-shadow-sm">
                    {activeYearLabel}
                  </span>
                </span>
              </div>
            </div>
          )}

          <Filters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            subjectCoursesCount={subjectCourses.length}
            classesCount={classes.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
          />

          <Table
            activeTab={activeTab}
            loading={loading}
            data={pagedData}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onYearActive={onYearActive}
            searchQuery={searchQuery}
          />

          <List
            activeTab={activeTab}
            loading={loading}
            data={pagedData}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onYearActive={onYearActive}
            searchQuery={searchQuery}
          />

          <DataViewportControls
            startItem={startItem}
            endItem={endItem}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            entityLabel={entityLabel}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>

        <CourseDialogs
          showClassModal={showClassModal}
          setShowClassModal={setShowClassModal}
          editingClass={editingClass}
          classForm={classForm}
          setClassForm={setClassForm}
          teachers={meta.teachers}
          years={meta.years}
          onClassSubmit={handleClassSubmit}
          showSubjectModal={showSubjectModal}
          setShowSubjectModal={setShowSubjectModal}
          editingSubject={editingSubject}
          subjectForm={subjectForm}
          setSubjectForm={setSubjectForm}
          onSubjectSubmit={handleSubjectSubmit}
          showYearModal={showYearModal}
          setShowYearModal={setShowYearModal}
          editingYear={editingYear}
          yearForm={yearForm}
          setYearForm={setYearForm}
          onYearSubmit={handleYearSubmit}
          loading={loading}
          // New
          showManageSubjectsModal={showManageSubjectsModal}
          setShowManageSubjectsModal={setShowManageSubjectsModal}
          classSubjects={classSubjects}
          allSubjects={meta.allSubjects}
          onAssignSubject={handleAssignSubject}
          onRemoveSubject={handleRemoveSubject}
        />

        <Dialog
          open={notice.open}
          onOpenChange={(o) => setNotice((p) => ({ ...p, open: o }))}
        >
          <DialogContent className="sm:max-w-md border border-border rounded-md shadow-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                {notice.title}
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                {notice.message}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button
                className="font-black px-10 rounded-md border border-border shadow-sm"
                onClick={() => setNotice((p) => ({ ...p, open: false }))}
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={confirmState.open}
          onOpenChange={(o) =>
            setConfirmState((p) => ({
              ...p,
              open: o,
              onConfirm: o ? p.onConfirm : null,
            }))
          }
        >
          <DialogContent className="sm:max-w-md border border-border rounded-md shadow-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                {confirmState.title}
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                {confirmState.message}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest border border-border"
                onClick={() => setConfirmState((p) => ({ ...p, open: false }))}
              >
                Batal
              </Button>
              <Button
                className="font-black text-[11px] uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 rounded-md border border-border shadow-sm"
                onClick={async () => {
                  if (confirmState.onConfirm) await confirmState.onConfirm();
                  setConfirmState((p) => ({ ...p, open: false }));
                }}
              >
                Ya, Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Suspense>
    </AdminLayout>
  );
}
