import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { NOTES, auditNote, fmtDate, ils, noteTotal } from "@/lib/data";
import { PageHeader, StatusPill } from "@/components/AppShell";

export function NotesArchive() {
  const [q, setQ] = useState("");
  const list = NOTES.filter((n) => [n.customer, n.id, n.yard, n.date].join(" ").includes(q));
  return (
    <>
      <PageHeader title="ארכיון תעודות" subtitle="סריקת גליה · 13/10/2026" />
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6 md:px-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש לקוח / מספר תעודה / מחסן"
          className="w-full rounded-2xl border bg-card px-4 py-3"
        />
        {list.map((n) => (
          <Link
            key={n.id}
            to="/notes/$id"
            params={{ id: n.id }}
            className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card"
          >
            {n.scans?.[0] && (
              <img
                src={n.scans[0]}
                alt=""
                loading="lazy"
                className="h-20 w-16 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">
                ת.מ. {n.id} · {fmtDate(n.date)} · {n.yard}
              </div>
              <div className="font-bold">{n.customer}</div>
              <div className="text-sm">{ils(noteTotal(n))}</div>
            </div>
            <StatusPill s={auditNote(n).status} />
          </Link>
        ))}
      </div>
    </>
  );
}
