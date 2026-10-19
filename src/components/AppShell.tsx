import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Crown, FileText, Satellite, ClipboardList, MessageCircle } from "lucide-react";
import noa from "@/assets/noa.jpg";

const NAV = [
  { to: "/", label: "אישורים", icon: Crown },
  { to: "/notes", label: "תעודות", icon: FileText },
  { to: "/ituran", label: "איתוראן", icon: Satellite },
  { to: "/orders", label: "הזמנות", icon: ClipboardList },
  { to: "/chat", label: "נועה", icon: MessageCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const active = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <img
            src={noa}
            alt="נועה"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-sidebar-primary"
          />
          <div>
            <div className="font-display text-lg font-bold leading-tight">ח. סבן</div>
            <div className="text-xs opacity-70">מערכת נועה · ללא נייר</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: I }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active(to) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "opacity-75 hover:opacity-100"}`}
            >
              <I className={`h-5 w-5 ${active(to) ? "text-sidebar-primary" : ""}`} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-5 text-xs opacity-60">ח. סבן חומרי בניין (1994) בע״מ</div>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      <nav className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t pb-safe md:hidden">
        {NAV.map(({ to, label, icon: I }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 pt-2 text-[11px] font-semibold ${active(to) ? "text-primary" : "text-muted-foreground"}`}
          >
            <I className="h-6 w-6" /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="pt-safe sticky top-0 z-30 glass border-b">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-3 px-4 py-4 md:px-8">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

export function StatusPill({ s }: { s: "ok" | "warn" | "fail" }) {
  const m = {
    ok: ["bg-success/15 text-success", "🟢 מאומת"],
    warn: ["bg-warning/25 text-warning-foreground", "⚠️ חריגה"],
    fail: ["bg-destructive/15 text-destructive", "🔴 נכשל"],
  }[s];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${m[0]}`}>
      {m[1]}
    </span>
  );
}
