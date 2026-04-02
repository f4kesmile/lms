"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function CourseSearch({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      if (query) {
        router.push(`/courses?q=${encodeURIComponent(query)}`);
      } else {
        router.push(`/courses`);
      }
    });
  }

  return (
    <form
      onSubmit={handleSearch}
      className="row"
      style={{ maxWidth: 500, margin: "0 auto", gap: "0.5rem" }}
    >
      <div className="input-group" style={{ flex: 1 }}>
        <span className="material-symbols-outlined input-icon">search</span>
        <input
          type="text"
          className="input input-with-icon"
          placeholder="Cari nama kelas atau kode..."
          style={{ background: "var(--bg-card)" }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="btn"
        disabled={isPending}
        style={{ padding: "0.85rem 1.5rem" }}
      >
        {isPending ? "Mencari..." : "Cari"}
      </button>
    </form>
  );
}
