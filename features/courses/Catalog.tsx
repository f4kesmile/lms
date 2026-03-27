"use client";

import {
  FormEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { 
  Search, 
  Users, 
  Clock, 
  ChevronRight, 
  Filter, 
  ArrowUpDown,
  Zap,
  BookOpen
} from "lucide-react";

import { getInitials } from "@/lib/utils";
import EnrollButton from "@/features/courses/EnrollButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CatalogCourse {
  id: string;
  name: string;
  teacherName: string;
  subjectName: string;
  subjectCode: string;
  studentCount: number;
  isEnrolled: boolean;
  requiresKey: boolean;
}

interface CourseCatalogBrowserProps {
  courses: CatalogCourse[];
  initialQuery?: string;
  isLoggedIn: boolean;
}

const gradients = [
  "from-primary-light to-primary-dark",
  "from-secondary-brand to-indigo-900",
  "from-primary to-secondary-brand",
  "from-emerald-400 to-primary-dark",
  "from-indigo-400 to-secondary-brand",
  "from-primary-dark to-indigo-900",
];

export default function CourseCatalogBrowser({
  courses,
  initialQuery = "",
  isLoggedIn,
}: CourseCatalogBrowserProps) {
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(9);

  const deferredQuery = useDeferredValue(appliedQuery.trim().toLowerCase());

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.subjectName.trim()).filter(Boolean));
    return ["Semua", ...Array.from(cats)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = activeCategory === "Semua" || course.subjectName === activeCategory;
      const haystack = `${course.name} ${course.subjectName} ${course.subjectCode} ${course.teacherName}`.toLowerCase();
      const matchesQuery = deferredQuery ? haystack.includes(deferredQuery) : true;
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, courses, deferredQuery]);

  useEffect(() => {
    setVisibleCount(9);
  }, [activeCategory, deferredQuery]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = filteredCourses.length > visibleCount;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(draftQuery);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Search & Filters */}
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Cari kelas, mata kuliah, atau dosen..."
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            className="w-full h-16 pl-14 pr-32 bg-card border border-border rounded-2xl text-lg font-medium placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />
          <Button 
            type="submit"                      variant="outline" 
            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl"
          >
            Cari
          </Button>
        </form>

        {/* Categories - Horizontal Scroll on Mobile */}
        <div className="relative flex items-center gap-4 py-2">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground shrink-0">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Filter:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold border transition-all",
                  activeCategory === category
                    ? "bg-primary border-primary text-on-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <section className="responsive-grid-3">
        {visibleCourses.length === 0 ? (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-border rounded-[2rem] bg-muted/20">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-bold">
              Tidak ada kelas yang cocok dengan kriteria Anda.
            </p>
            <Button 
              variant="link" 
              className="mt-2 text-primary font-bold"
              onClick={() => {
                setDraftQuery("");
                setAppliedQuery("");
                setActiveCategory("Semua");
              }}
            >
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          visibleCourses.map((course, index) => (
            <article key={course.id} className="neo-card flex flex-col group h-full">
              <div className="relative h-44 w-full bg-muted overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-110",
                  gradients[index % gradients.length]
                )} />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                  <Zap className="h-24 w-24 text-white" />
                </div>
                {index === 0 && activeCategory === "Semua" && !deferredQuery && (
                   <div className="absolute top-4 left-4 scale-90 origin-top-left">
                     <span className="premium-pill bg-white/20 backdrop-blur-md border-white/30 text-white shadow-lg ring-1 ring-white/50">
                       Terpopuler
                     </span>
                   </div>
                )}
                <div className="absolute bottom-4 right-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 gap-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-dark">
                    {course.subjectName}
                  </span>
                  <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                    {course.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 py-2 border-y border-border/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-brand text-white font-bold text-xs ring-4 ring-secondary-brand/10">
                    {getInitials(course.teacherName)}
                  </div>
                  <span className="text-xs font-black text-muted-foreground truncate italic">
                    {course.teacherName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 tracking-wider transition-colors group-hover:text-foreground">
                  <div className="flex items-center gap-1.5 uppercase">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>12 Minggu</span>
                  </div>
                  <div className="flex items-center gap-1.5 uppercase">
                    <Users className="h-3 w-3 text-primary" />
                    <span>{course.studentCount} Mahasiswa</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <EnrollButton
                    classId={course.id}
                    isLoggedIn={isLoggedIn}
                    isEnrolled={course.isEnrolled}
                    requiresKey={course.requiresKey}
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl border border-border h-14 px-10 font-black hover:border-primary hover:text-primary gap-3 shadow-sm transition-all hover:shadow-md"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            <span>Muat Lebih Banyak</span>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
