import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-dvh flex-col gap-6 px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={`admin-kpi-${i}`} className="h-28 w-full" />
          ))}
      </div>

      <Skeleton className="h-[55dvh] w-full" />
    </div>
  );
}
