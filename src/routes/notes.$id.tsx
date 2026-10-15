import { createFileRoute, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { NOTES, auditNote, ils, noteTotal } from "@/lib/data";
import { approvals, useApprovals } from "@/lib/store";
import { PageHeader, StatusPill } from "@/components/AppShell";

export const Route = createFileRoute("/notes/$id")({
  loader: ({ params }) => {
    const n = NOTES.find((x) => x.id === params.id);
    if (!n) throw notFound();
    return n;
  },
  head: ({ params }) => ({
    meta: [
      { title: `תעודה ${params.id} — נועה ח. סבן` },
      { name: "description", content: "תצוגת תעודת משלוח עם שכבות בקרה וחותמות." },
      { property: "og:title", content: `תעודה ${params.id}` },
      { property: "og:description", content: "בקרת נועה AI, חותמת ראמי וחותמת מנכ״ל." },
    ],
  }),
  component: Viewer,
});

function Viewer() {
  const n = Route.useLoaderData();
  const ap = useApprovals()[n.id];
  const a = auditNote(n);
  return (
    <>
      <PageHeader
        title={`ת.מ. ${n.id}`}
        subtitle={n.customer}
        action={<StatusPill s={a.status} />}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_340px] md:px-8">
        <div className="space-y-4">
          {(n.scans ?? []).map((src, i) => (
            <div key={src} className="relative overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={src} alt={`סריקה ${i + 1}`} className="w-full" />
              {i === 0 && ap?.rami && (
                <div className="stamp absolute bottom-16 left-6 bg-card/60 text-sm text-rami">
                  ח. סבן — נבדק ואושר ע״י ראמי מסארווה ✍️
                  <br />
                  {ap.rami.at}
                </div>
              )}
              {i === 0 && ap?.harel && (
                <div className="stamp absolute bottom-40 right-6 bg-card/60 text-sm text-ceo">
                  ח. סבן (1994) בע״מ — אושר סופית לחיוב 👑
                  <br />
                  הראל אידלסון · {ap.harel.at}
                </div>
              )}
            </div>
          ))}
        </div>
        <aside className="space-y-3">
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h2 className="font-bold">בקרת נועה AI</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {a.findings.map((f, i) => (
                <li key={i}>
                  {f.status === "ok" ? "🟢" : f.status === "warn" ? "⚠️" : "🔴"} {f.text}
                </li>
              ))}
            </ul>
            <div className="mt-3 font-display text-2xl font-bold">{ils(noteTotal(n))}</div>
          </div>
          {!ap?.rami && (
            <button
              onClick={() => {
                approvals.rami(n.id);
                toast.success("נחתם ע״י ראמי");
              }}
              className="w-full rounded-2xl bg-rami py-3 font-bold text-rami-foreground"
            >
              חתימת ראמי ✍️
            </button>
          )}
          {ap?.rami && !ap?.harel && (
            <button
              onClick={() => {
                approvals.harel(n.id);
                toast.success("אושר לחיוב 👑");
              }}
              className="w-full rounded-2xl bg-ceo py-3 font-bold text-ceo-foreground"
            >
              אישור מנכ״ל 👑
            </button>
          )}
          {ap && (
            <button
              onClick={() => approvals.reset(n.id)}
              className="w-full rounded-2xl border py-2 text-sm"
            >
              איפוס חתימות
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
