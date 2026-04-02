"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubjectParticipantsAction } from "@/lib/actions/meeting";

interface Student {
  id: string;
  name: string;
  email: string;
  identifier: string | null;
  progress: number;
}

interface ClassData {
  id: string;
  name: string;
  students: Student[];
}

export default function CourseStudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId") || undefined;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    yearName: string;
    classes: ClassData[];
    scope?: {
      subjectId: string;
      subjectName: string;
      subjectCode: string;
      classId: string | null;
      className: string | null;
    };
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      const result = await getSubjectParticipantsAction(id, classId);
      if (result.success) {
        setData({
          yearName: result.yearName || "",
          classes: result.classes || [],
          scope: result.scope,
        });
      } else {
        setData({ yearName: "", classes: [] });
      }
      setLoading(false);
    }
    fetchData();
  }, [id, classId]);

  const filteredClasses =
    data?.classes
      .map((cls) => ({
        ...cls,
        students: cls.students.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.identifier || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((cls) => cls.students.length > 0) || [];

  return (
    <AdminLayout title="Daftar Mahasiswa">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="size-8 rounded-full border border-border"
              >
                <Link href="/admin/teaching-schedule">
                  <Icon name="arrow_back" size={16} />
                </Link>
              </Button>
              <Badge
                variant="outline"
                className="font-black text-[10px] uppercase tracking-widest border-primary/30 text-primary bg-primary/5"
              >
                {data?.yearName || "Tahun Akademik"}
              </Badge>
            </div>
            <h2 className="text-3xl font-black tracking-tighter">
              Partisipan Kelas
            </h2>
            <p className="text-sm font-medium text-muted-foreground max-w-md">
              Lihat daftar mahasiswa sesuai mata kuliah dan kelas yang sedang
              dipilih beserta progres belajarnya.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Icon
              name="search"
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NPM mahasiswa..."
              className="pl-11 h-12 bg-card/50 border-border/30 rounded-2xl font-medium focus-visible:ring-primary/20"
            />
          </div>
        </header>

        {data?.scope && (
          <Card className="p-5 rounded-3xl border border-border/60 bg-card/60">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                {data.scope.subjectCode}
              </Badge>
              <Badge
                variant="outline"
                className="font-black text-[10px] uppercase tracking-widest"
              >
                {data.scope.subjectName}
              </Badge>
              {data.scope.className && (
                <Badge
                  variant="secondary"
                  className="font-black text-[10px] uppercase tracking-widest"
                >
                  Kelas {data.scope.className}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Daftar mahasiswa pada halaman ini dibatasi ke konteks mata kuliah
              dan kelas di atas.
            </p>
          </Card>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 rounded-[2rem] border-border/40">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-64 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card/20 border border-dashed border-border/50 rounded-[3rem]">
            <Icon
              name="person_off"
              size={64}
              className="text-muted-foreground/20 mb-4"
            />
            <p className="font-bold text-muted-foreground">
              Tidak ada mahasiswa ditemukan.
            </p>
            <p className="text-sm text-muted-foreground/50 mt-1">
              {searchQuery
                ? "Coba kata kunci pencarian lain."
                : "Belum ada mahasiswa yang terdaftar di kelas ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="size-2 bg-secondary-brand rounded-full" />
                  <h3 className="text-lg font-black tracking-tight">
                    Kelas {cls.name}
                  </h3>
                  <Badge className="bg-muted text-muted-foreground font-black text-[10px] px-2">
                    {cls.students.length} Mahasiswa
                  </Badge>
                </div>

                <Card className="overflow-hidden border-border/40 rounded-[2rem] shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent border-b border-border/40">
                        <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest min-w-[200px]">
                          Mahasiswa
                        </TableHead>
                        <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                          Identifier / NPM
                        </TableHead>
                        <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-center">
                          Progres Belajar
                        </TableHead>
                        <TableHead className="h-12 text-right px-6 text-[10px] font-black uppercase tracking-widest">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cls.students.map((student) => (
                        <TableRow
                          key={student.id}
                          className="group border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-secondary-brand text-white flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-white border border-secondary-brand/20">
                                {student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary/30 underline-offset-4 decoration-2">
                                  {student.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium opacity-70 truncate">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs font-bold bg-muted/50 px-2 py-1 rounded border border-border/40">
                              {student.identifier || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/30">
                                <div
                                  className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-1000"
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-primary">
                                {student.progress}% Selesai
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg border border-border/40 bg-background shadow-sm hover:bg-primary hover:text-white transition-all"
                            >
                              <Icon name="mail" size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
