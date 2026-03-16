"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseStatus } from "@prisma/client";

interface Teacher {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface CourseDialogsProps {
  // Class Modal Props
  showClassModal: boolean;
  setShowClassModal: (open: boolean) => void;
  editingClass: any;
  classForm: {
    name: string;
    academicYearId: string;
    classTeacherId: string;
    capacity: number;
  };
  setClassForm: (form: any) => void;
  teachers: Teacher[];
  years: AcademicYear[];
  onClassSubmit: (e: React.FormEvent) => Promise<void>;

  // Subject Modal Props
  showSubjectModal: boolean;
  setShowSubjectModal: (open: boolean) => void;
  editingSubject: any;
  subjectForm: {
    code: string;
    title: string;
    description: string;
    learningOutcomes: string;
    status: CourseStatus;
  };
  setSubjectForm: (form: any) => void;
  onSubjectSubmit: (e: React.FormEvent) => Promise<void>;

  // Year Modal Props
  showYearModal: boolean;
  setShowYearModal: (open: boolean) => void;
  editingYear: any;
  yearForm: {
    name: string;
    fromYear: string;
    toYear: string;
    isCurrent: boolean;
  };
  setYearForm: (form: any) => void;
  onYearSubmit: (e: React.FormEvent) => Promise<void>;

  loading: boolean;
}

export function CourseDialogs({
  showClassModal,
  setShowClassModal,
  editingClass,
  classForm,
  setClassForm,
  teachers,
  years,
  onClassSubmit,
  showSubjectModal,
  setShowSubjectModal,
  editingSubject,
  subjectForm,
  setSubjectForm,
  onSubjectSubmit,
  showYearModal,
  setShowYearModal,
  editingYear,
  yearForm,
  setYearForm,
  onYearSubmit,
  loading,
}: CourseDialogsProps) {
  return (
    <>
      {/* Class Modal */}
      <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
        <DialogContent className="border-none max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingClass ? "Edit Data Kelas" : "Tambah Kelas Baru"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Kelompokkan mahasiswa ke dalam unit kelas dan tentukan dosen wali.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onClassSubmit} className="space-y-4 pt-2">
             <div className="space-y-1.5">
               <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Nama Kelas</label>
               <Input 
                 required 
                 value={classForm.name} 
                 onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} 
                 className="h-11 rounded-xl bg-card border-border/50"
                 placeholder="Contoh: IF-A 2024" 
               />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Tahun Akademik</label>
                 <Select 
                   value={classForm.academicYearId} 
                   onValueChange={(val) => setClassForm({ ...classForm, academicYearId: val })}
                 >
                   <SelectTrigger className="h-11 rounded-xl bg-card border-border/50 font-bold">
                     <SelectValue placeholder="Pilih tahun" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl border-border/50">
                     {years.map(y => <SelectItem key={y.id} value={y.id} className="rounded-lg">{y.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1.5">
                 <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Kapasitas</label>
                 <Input 
                   type="number" 
                   required 
                   value={classForm.capacity} 
                   onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) })} 
                   className="h-11 rounded-xl bg-card border-border/50" 
                 />
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Dosen Wali (Opsional)</label>
               <Select 
                 value={classForm.classTeacherId || "none"} 
                 onValueChange={(val) => setClassForm({ ...classForm, classTeacherId: val === "none" ? "" : val })}
               >
                 <SelectTrigger className="h-11 rounded-xl bg-card border-border/50 font-bold">
                   <SelectValue placeholder="Pilih dosen" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="none" className="rounded-lg">Belum ditentukan</SelectItem>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id} className="rounded-lg">{t.name}</SelectItem>)}
                 </SelectContent>
               </Select>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
               <Button type="button" variant="ghost" className="font-black text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl" onClick={() => setShowClassModal(false)}>Batal</Button>
               <Button type="submit" disabled={loading} className="font-black text-[11px] uppercase tracking-widest min-w-[140px] shadow-lg shadow-primary/20 rounded-xl">
                 {loading ? "Menyimpan..." : editingClass ? "Update Kelas" : "Tambah Kelas"}
               </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subject Modal */}
      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="border-none max-w-2xl rounded-3xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingSubject ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Definisikan kurikulum inti yang akan diajarkan dan dilatihkan ke chatbot.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubjectSubmit} className="space-y-4 pt-2">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="space-y-1.5 sm:col-span-1">
                 <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Kode MK</label>
                 <Input 
                   required 
                   value={subjectForm.code} 
                   onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} 
                   className="h-11 rounded-xl bg-card border-border/50 font-mono font-bold"
                   placeholder="IF101" 
                 />
               </div>
               <div className="space-y-1.5 sm:col-span-2">
                 <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Nama Mata Kuliah</label>
                 <Input 
                   required 
                   value={subjectForm.title} 
                   onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })} 
                   className="h-11 rounded-xl bg-card border-border/50"
                   placeholder="Contoh: Pemrograman Dasar" 
                 />
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Status Publikasi</label>
               <Select 
                 value={subjectForm.status} 
                 onValueChange={(val) => setSubjectForm({ ...subjectForm, status: val as CourseStatus })}
               >
                 <SelectTrigger className="h-11 rounded-xl bg-card border-border/50 font-bold">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value={CourseStatus.published} className="rounded-lg">Dipublikasikan (Tersedia untuk AI)</SelectItem>
                    <SelectItem value={CourseStatus.draft} className="rounded-lg">Draft (Hanya Admin)</SelectItem>
                    <SelectItem value={CourseStatus.archived} className="rounded-lg">Diarsipkan</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-1.5">
               <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Deskripsi Singkat</label>
               <textarea 
                 value={subjectForm.description} 
                 onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} 
                 className="w-full min-h-24 rounded-2xl bg-card border border-border/50 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 placeholder="Ringkasan apa yang dipelajari di MK ini..." 
               />
             </div>

             <div className="space-y-1.5">
               <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Capaian Pembelajaran (Opsional)</label>
               <textarea 
                 value={subjectForm.learningOutcomes} 
                 onChange={(e) => setSubjectForm({ ...subjectForm, learningOutcomes: e.target.value })} 
                 className="w-full min-h-32 rounded-2xl bg-card border border-border/50 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 placeholder="Target kompetensi mahasiswa setelah mengikuti MK ini..." 
               />
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
               <Button type="button" variant="ghost" className="font-black text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl" onClick={() => setShowSubjectModal(false)}>Batal</Button>
               <Button type="submit" disabled={loading} className="font-black text-[11px] uppercase tracking-widest min-w-[180px] shadow-lg shadow-primary/20 rounded-xl">
                 {loading ? "Menyimpan..." : editingSubject ? "Update Mata Kuliah" : "Simpan Mata Kuliah"}
               </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Year Modal */}
      <Dialog open={showYearModal} onOpenChange={setShowYearModal}>
        <DialogContent className="border-none max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingYear ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Definisikan periode akademik baru untuk pengelolaan kelas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onYearSubmit} className="space-y-4 pt-2">
             <div className="space-y-1.5">
               <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Nama Periode</label>
               <Input 
                 required 
                 value={yearForm.name} 
                 onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} 
                 className="h-11 rounded-xl bg-card border-border/50"
                 placeholder="Contoh: Ganjil 2024/2025" 
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Dari Tahun</label>
                 <Input 
                   required 
                   type="date"
                   value={yearForm.fromYear ? new Date(yearForm.fromYear).toISOString().split('T')[0] : ""} 
                   onChange={(e) => setYearForm({ ...yearForm, fromYear: e.target.value })} 
                   className="h-11 rounded-xl bg-card border-border/50"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Hingga Tahun</label>
                 <Input 
                   required 
                   type="date"
                   value={yearForm.toYear ? new Date(yearForm.toYear).toISOString().split('T')[0] : ""} 
                   onChange={(e) => setYearForm({ ...yearForm, toYear: e.target.value })} 
                   className="h-11 rounded-xl bg-card border-border/50"
                 />
               </div>
             </div>
             
             <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
               <input 
                 type="checkbox" 
                 id="isCurrentYear"
                 title="Set Aktif Sekarang"
                 checked={yearForm.isCurrent} 
                 onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })} 
                 className="size-5 rounded border-primary bg-background text-primary focus:ring-primary/20 transition-all cursor-pointer"
               />
               <label htmlFor="isCurrentYear" className="text-sm font-black tracking-tight cursor-pointer">Set sebagai Tahun Aktif sekarang</label>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
               <Button type="button" variant="ghost" className="font-black text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl" onClick={() => setShowYearModal(false)}>Batal</Button>
               <Button type="submit" disabled={loading} className="font-black text-[11px] uppercase tracking-widest min-w-[120px] shadow-lg shadow-primary/20 rounded-xl">
                 {loading ? "Menyimpan..." : editingYear ? "Update Tahun" : "Simpan Tahun"}
               </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
