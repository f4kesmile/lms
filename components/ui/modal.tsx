import React from "react";
import { Button } from "./button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit";
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "danger" | "default" | "destructive";
  };
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "640px",
  primaryAction,
}: ModalProps) {
  if (!isOpen) return null;

  const primaryVariant =
    primaryAction?.variant === "danger"
      ? "destructive"
      : primaryAction?.variant === "primary"
        ? "default"
        : (primaryAction?.variant ?? "default");

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--overlay-backdrop)",
          zIndex: 99,
        }}
        onClick={onClose}
      />
      <div
        className="rounded-lg border border-border bg-card"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          padding: "clamp(1rem, 2.5vw, 2rem)",
          width: `min(${width}, 96vw)`,
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <div className="row space-between" style={{ marginBottom: "1.5rem" }}>
          <h2 className="title-lg">{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-soft)",
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div>{children}</div>

        {(primaryAction || Boolean(onClose)) && (
          <div
            className="row"
            style={{
              marginTop: "2rem",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <Button variant="ghost" onClick={onClose} type="button">
              Batal
            </Button>
            {primaryAction && (
              <Button
                variant={primaryVariant}
                onClick={primaryAction.onClick}
                type={primaryAction.type || "button"}
                disabled={primaryAction.disabled || primaryAction.loading}
              >
                {primaryAction.loading ? "Memproses..." : primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
