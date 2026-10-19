import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "הזמנות — נועה ח. סבן" },
      { name: "description", content: "הזמנות — מערכת נועה" },
      { property: "og:title", content: "הזמנות — נועה" },
      { property: "og:description", content: "הזמנות — מערכת נועה" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="הזמנות" subtitle="בבנייה — המסך יושלם בהמשך" />
    </>
  ),
});
