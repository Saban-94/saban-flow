import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/ituran")({
  head: () => ({
    meta: [
      { title: "איתוראן — נועה ח. סבן" },
      { name: "description", content: "איתוראן — מערכת נועה" },
      { property: "og:title", content: "איתוראן — נועה" },
      { property: "og:description", content: "איתוראן — מערכת נועה" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="איתוראן" subtitle="בבנייה — המסך יושלם בהמשך" />
    </>
  ),
});
