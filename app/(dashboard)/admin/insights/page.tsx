"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Filters } from "./_components/Filters";
import { Table } from "./_components/Table";
import { List } from "./_components/List";
import { Pagination } from "../_components/Pagination";

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

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

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
  }, [page, limit]);

  // Reset to page 1 on limit change
  useEffect(() => {
    setPage(1);
  }, [limit]);

  const filteredInteractions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return interactions;

    return interactions.filter((item) => {
      return (
        item.user.name.toLowerCase().includes(query) ||
        item.query.toLowerCase().includes(query) ||
        item.response.toLowerCase().includes(query)
      );
    });
  }, [interactions, search]);

  return (
    <AdminLayout title="AI & Wawasan">
      <Suspense fallback={<div className="h-[60dvh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
        <div className="flex flex-col gap-6">
          <Filters
            summary={summary}
            search={search}
            setSearch={setSearch}
            limit={limit}
            setLimit={setLimit}
          />

          <Table
            loading={loading}
            error={error}
            interactions={filteredInteractions}
            search={search}
          />

          <List
            loading={loading}
            error={error}
            interactions={filteredInteractions}
            search={search}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </Suspense>
    </AdminLayout>
  );
}
