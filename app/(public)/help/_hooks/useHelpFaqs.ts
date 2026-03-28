import { useEffect, useMemo, useState } from "react";

import { DEFAULT_FAQS } from "@/app/(public)/help/_lib/constants";
import type { FaqItem } from "@/app/(public)/help/_lib/types";

export function useHelpFaqs() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data.faqs || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const displayedFaqs = useMemo(
    () => (faqs.length > 0 ? faqs : DEFAULT_FAQS),
    [faqs],
  );

  function toggleFaq(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return {
    isLoading,
    openId,
    displayedFaqs,
    toggleFaq,
  };
}
