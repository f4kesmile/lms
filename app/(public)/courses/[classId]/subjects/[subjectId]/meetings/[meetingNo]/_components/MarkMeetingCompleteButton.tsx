"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MarkMeetingCompleteButtonProps {
  meetingId: string;
  classId: string;
  subjectId: string;
  initialCompleted: boolean;
  initialProgress?: number;
  canMark: boolean;
}

export function MarkMeetingCompleteButton({
  meetingId,
  classId,
  subjectId,
  initialCompleted,
  initialProgress,
  canMark,
}: MarkMeetingCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [progress, setProgress] = useState<number | undefined>(initialProgress);
  const [loading, setLoading] = useState(false);

  const onMarkComplete = async () => {
    if (loading || completed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, subjectId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Gagal menandai sesi selesai");
      }

      setCompleted(true);
      setProgress(data.progress);
      toast.success("Sesi berhasil ditandai selesai");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan server",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!canMark) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={onMarkComplete}
        disabled={loading || completed}
        className="w-full font-black text-[11px] uppercase tracking-widest"
        variant={completed ? "secondary" : "default"}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </span>
        ) : completed ? (
          "Sesi Sudah Selesai"
        ) : (
          "Tandai Sesi Selesai"
        )}
      </Button>
      {typeof progress === "number" && (
        <p className="text-[11px] font-semibold text-muted-foreground text-center">
          Progress mata kuliah: {progress}%
        </p>
      )}
    </div>
  );
}
