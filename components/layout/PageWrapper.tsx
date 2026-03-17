import React from "react";
import { Navbar } from "./Navbar";
import { SITE_CONFIG, getCurrentYear } from "@/lib/constants";

type PageWrapperProps = {
  children: React.ReactNode;
  user?: { name: string; role: string } | null;
  footer?: boolean;
};

export const PageWrapper = ({
  children,
  user,
  footer = true,
}: PageWrapperProps) => {
  return (
    <>
      <Navbar initialUser={user} />
      {/* 
        This is a generic generic wrapper for standardized page margins.
        It uses 'app-shell' matching globals.css layout configuration.
      */}
      <main
        className="app-shell"
        style={{ paddingBottom: footer ? "5rem" : "2rem", paddingTop: "2rem" }}
      >
        {children}
      </main>

      {footer && (
        <footer
          style={{
            borderTop: "1px solid var(--border-primary)",
            padding: "4rem 1.5rem",
            background: "var(--bg-card-hover)",
          }}
        >
          <div
            style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}
          >
            <p className="text-muted" style={{ fontSize: "0.8rem" }}>
              © {getCurrentYear()} {SITE_CONFIG.name}. Hak cipta dilindungi.
            </p>
          </div>
        </footer>
      )}
    </>
  );
};
