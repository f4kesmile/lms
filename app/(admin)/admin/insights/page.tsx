"use client";

import { Suspense, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Filters } from "./_components/Filters";
import { Table } from "./_components/Table";
import { List } from "./_components/List";
import { DataViewportControls } from "../_components/Controls";

type InsightSummary = {
  totalTurns: number;
  avgResponseTimeMs: number;
  accuracyScore: number;
  avgRating: number | null;
};

type Interaction = {
  id: string;
  user: { name: string };
  query: string;
  response: string;
  status: string;
  createdAt: string;
  responseTimeMs: number;
  rating: number | null;
  citationCount: number;
};

export default function AdminInsightsPage() {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const handleSearchChange = (value: string) => {
    setLoading(true);
    setPage(1);
    setSearch(value);
  };

  const handleLimitChange = (value: number) => {
    setLoading(true);
    setPage(1);
    setLimit(value);
  };

  const handlePageChange = (value: number) => {
    setLoading(true);
    setPage(value);
  };

  useEffect(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const query = search.trim();
    if (query) params.set("search", query);

    fetch(`/api/admin/insights?${params.toString()}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Gagal memuat insight AI");
        }
        setSummary(payload.summary);
        setInteractions(payload.interactions || []);
        if (payload.pagination) {
          setTotalPages(payload.pagination.pages);
          setTotalItems(payload.pagination.total);
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat insight AI");
      })
      .finally(() => setLoading(false));
  }, [page, limit, search]);

  return (
    <AdminLayout title="AI & Wawasan">
      <Suspense
        fallback={
          <div className="h-[60dvh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <Filters
            summary={summary}
            search={search}
            setSearch={handleSearchChange}
          />

          <Table
            loading={loading}
            error={error}
            interactions={interactions}
            search={search}
          />

          <List
            loading={loading}
            error={error}
            interactions={interactions}
            search={search}
          />

          <DataViewportControls
            startItem={totalItems === 0 ? 0 : (page - 1) * limit + 1}
            endItem={totalItems === 0 ? 0 : Math.min(page * limit, totalItems)}
            totalItems={totalItems}
            rowsPerPage={limit}
            onRowsPerPageChange={handleLimitChange}
            entityLabel="interaksi"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </Suspense>
    </AdminLayout>
  );
}
