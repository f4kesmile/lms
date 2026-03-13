type AppTopbarProps = {
  title?: string;
};

const links = [
  { href: "/student", label: "Dashboard" },
  { href: "/courses/rpl-lanjut", label: "Courses" },
  { href: "/chatbot", label: "Chat AI" },
  { href: "/admin/dashboard", label: "Admin" },
];

export default function AppTopbar({ title = "EduNexus" }: AppTopbarProps) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <a href="/" className="brand">
          <div className="brand-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <span className="brand-text">
            LMS<span>Pintar</span>
          </span>
        </a>

        <nav className="nav-links">
          {links.map((item) => (
            <a key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="row">
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            Sudah punya akun?
          </span>
          <a className="btn-ghost" href="/login" style={{ padding: "0.45rem 1rem" }}>
            Masuk
          </a>
        </div>
      </div>
    </header>
  );
}
