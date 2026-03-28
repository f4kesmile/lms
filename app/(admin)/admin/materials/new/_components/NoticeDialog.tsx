import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

import type { NoticeState } from "@/app/(admin)/admin/materials/new/_lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NoticeDialogProps = {
  notice: NoticeState;
  setNotice: Dispatch<SetStateAction<NoticeState>>;
};

export function NoticeDialog({ notice, setNotice }: NoticeDialogProps) {
  const router = useRouter();

  return (
    <Dialog
      open={notice.open}
      onOpenChange={(open) => {
        setNotice((prev) => ({ ...prev, open }));
        if (!open && notice.redirectTo) {
          router.push(notice.redirectTo);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{notice.title}</DialogTitle>
          <DialogDescription>{notice.message}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              const redirectTo = notice.redirectTo;
              setNotice((prev) => ({
                ...prev,
                open: false,
                redirectTo: undefined,
              }));
              if (redirectTo) router.push(redirectTo);
            }}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
