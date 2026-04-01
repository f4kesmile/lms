"use client";

import { ArrowUpDown, Calendar, Filter, Search, Users } from "lucide-react";
import { FormEvent, useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EnrollButton from "@/features/courses/EnrollButton";
import { getInitials } from "@/lib/utils";

interface CatalogCourse {
  id: string;
  className: string;
  teacherName: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  studentCount: number;
  isEnrolled: boolean;
  requiresKey: boolean;
}

interface CourseCatalogBrowserProps {
  courses: CatalogCourse[];
  initialQuery?: string;
  isLoggedIn: boolean;
}

export default function CourseCatalogBrowser({
  courses,
  initialQuery = "",
  isLoggedIn,
}: CourseCatalogBrowserProps) {
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [visibleCount, setVisibleCount] = useState(9);

  const deferredQuery = useDeferredValue(draftQuery.trim().toLowerCase());

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const haystack =
        `${course.subjectName} ${course.className} ${course.subjectCode} ${course.teacherName}`.toLowerCase();
      const matchesQuery = deferredQuery
        ? haystack.includes(deferredQuery)
        : true;
      return matchesQuery;
    });
  }, [courses, deferredQuery]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = filteredCourses.length > visibleCount;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <header className="space-y-10 py-16 text-center border-b mb-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter lg:text-6xl mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent leading-[1.1]">
            Katalog Kelas
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
            &quot;Pilih kelas yang tersedia untuk semester ini dan mulai
            perjalanan akademikmu.&quot;
          </p>
        </div>

        {/* Scaled Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto w-full pt-4"
        >
          <div className="relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Cari nama kelas atau tim pengajar kelas..."
              className="pl-16 h-18 rounded-[2rem] bg-muted/40 border-border/40 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg shadow-2xl shadow-black/5"
              value={draftQuery}
              onChange={(e) => {
                setDraftQuery(e.target.value);
                setVisibleCount(9);
              }}
            />
          </div>
        </form>
      </header>

      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="p-2 rounded-xl bg-primary/10">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              {filteredCourses.length} Kelas Tersedia
            </span>
          </div>
        </div>

        {visibleCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/20 rounded-[4rem] border-2 border-dashed border-border/50">
            <div className="size-24 rounded-[2rem] bg-muted flex items-center justify-center text-muted-foreground mb-6 shadow-inner">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">
              Kelas Tidak Ditemukan
            </h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto mb-8 font-medium">
              Maaf, tidak ada kelas yang cocok dengan kata kunci atau filter
              yang Anda pilih.
            </p>
            <Button
              variant="outline"
              className="rounded-full h-14 px-10 font-black uppercase text-xs tracking-widest border-2"
              onClick={() => {
                setDraftQuery("");
              }}
            >
              Tampilkan Semua Kelas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {visibleCourses.map((course) => (
              <Card
                key={course.id}
                className="group border-border/60 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col rounded-[3rem] overflow-hidden bg-card/50"
              >
                <CardHeader className="space-y-4 pb-5 px-10 pt-10">
                  <CardTitle className="text-2xl font-black tracking-tighter leading-[1.2] group-hover:text-primary transition-all">
                    {course.className}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 pt-2 text-xs font-bold text-foreground">
                    <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-black text-muted-foreground shadow-md transition-transform group-hover:scale-110">
                      {getInitials(course.teacherName)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-muted-foreground/60 text-[9px] uppercase tracking-widest leading-none mb-1.5 font-black">
                        Tim Pengajar Kelas
                      </span>
                      <span className="line-clamp-1 italic font-bold">
                        {course.teacherName}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-8 px-10">
                  <div className="grid grid-cols-1 gap-5 py-6 border-y border-dashed border-border/80">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center shadow-sm">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1.5">
                          Kapasitas Terisi
                        </span>
                        <span className="text-sm font-black">
                          {course.studentCount} Mahasiswa
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 pb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary/70" />
                      Semester Ganjil
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="px-10 pb-10">
                  <EnrollButton
                    classId={course.id}
                    isLoggedIn={isLoggedIn}
                    isEnrolled={course.isEnrolled}
                    requiresKey={course.requiresKey}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {hasMore && (
        <div className="flex justify-center pt-12 pb-20">
          <Button
            variant="ghost"
            className="rounded-full h-16 px-16 font-black uppercase text-xs tracking-[0.2em] hover:bg-muted border-2 border-transparent hover:border-border transition-all gap-4 shadow-xl"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            <span>Muat Lebih Banyak Kelas</span>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
