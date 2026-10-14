import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { NOTES, auditNote, noteTotal, ils, driverOf } from "@/lib/data";
import { approvals, useApprovals, playAlert } from "@/lib/store";
import { PageHeader, StatusPill } from "@/components/AppShell";
import { Crown, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אישורי מנכ״ל — נועה ח. סבן" },
      { name: "description", content: "כרטיסי אישור מהירים להראל אידלסון: תעודות שנבדקו ע״י ראמי ונועה AI." },
      { property: "og:title", content: "אישורי מנכ״ל — נועה ח. סבן" },
      { property: "og:description", content: "אישור תעודות משלוח לחיוב בלחיצה אחת." },
    ],
  }),
  component: Index,
});

function Index() {
  const ap = useApprovals();
  const ready = NOTES.filter((n) => ap[n.id]?.rami && !ap[n.id]?.harel);
  const pendingRami = NOTES.filter((n) => !ap[n.id]?.rami);
  const done = NOTES.filter((n) => ap[n.id]?.harel);
  const sum = ready.reduce((s, n) => s + noteTotal(n), 0);

  return (
    <>
      <PageHeader title="בוקר טוב, הראל" subtitle="רק מה שראמי ונועה כבר בדקו" />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
        <section className="bg-ceo-gradient rounded-3xl p-6 text-ceo-foreground shadow-lift">
          <div className="flex items-center gap-2 text-sm opacity-80"><Crown className="h-4 w-4" /> ממתין לחתימתך</div>
          <div className="mt-2 font-display text-5xl font-extrabold">{ready.length}</div>
          <div className="mt-1 text-lg">תעודות · <b>{ils(sum)}</b> לחיוב</div>
          {ready.length > 1 && (
            <button
              onClick={() => { ready.forEach((n) => approvals.harel(n.id)); playAlert(); toast.success(`${ready.length} תעודות אושרו לחיוב 👑`); }}
              className="mt-5 w-full rounded-2xl bg-card py-4 font-display text-lg font-bold text-ceo"
            >אשר הכל 👑</button>
          )}
        </section>

        {ready.length === 0 && (
          <div className="rounded-3xl bg-card p-8 text-center shadow-card">
            <div className="text-4xl">☕</div>
            <p className="mt-2 font-display text-lg font-bold">אין מה לאשר כרגע</p>
            <p className="text-sm text-muted-foreground">{pendingRami.length} תעודות עדיין בבדיקת ראמי</p>
          </div>
        )}

        {ready.map((n) => {
          const a = auditNote(n);
          return (
            <article key={n.id} className="overflow-hidden rounded-3xl bg-card shadow-card">
              <Link to="/notes/$id" params={{ id: n.id }} className="block p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ת.מ. {n.id} · {driverOf(n.driverId).name}</span>
                  <StatusPill s={a.status} />
                </div>
                <h2 className="mt-2 text-xl font-bold">{n.customer}</h2>
                <p className="mt-1 text-[15px]">
                  {a.status === "ok" ? "הכל תואם — קומקס, פקדונות ואיתוראן." : a.findings.find((f) => f.status !== "ok")?.text}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="font-display text-3xl font-extrabold">{ils(noteTotal(n))}</span>
                  <span className="flex items-center text-sm text-primary">לתעודה <ChevronLeft className="h-4 w-4" /></span>
                </div>
              </Link>
              <button
                onClick={() => { approvals.harel(n.id); playAlert(); toast.success(`ת.מ. ${n.id} אושרה לחיוב 👑`); }}
                className="w-full border-t bg-ceo py-4 font-display text-lg font-bold text-ceo-foreground"
              >אשר לחיוב 👑</button>
            </article>
          );
        })}

        {done.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-bold text-muted-foreground">אושרו היום ({done.length})</h3>
            <div className="space-y-2">
              {done.map((n) => (
                <Link key={n.id} to="/notes/$id" params={{ id: n.id }} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-card">
                  <span className="font-semibold">{n.customer} · {n.id}</span>
                  <span className="text-sm">{ap[n.id]?.closed ? "✅ נסגר" : "👑 אושר"}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
