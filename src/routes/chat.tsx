import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "נועה — נועה ח. סבן" }, { name: "description", content: "נועה — מערכת נועה" }, { property: "og:title", content: "נועה — נועה" }, { property: "og:description", content: "נועה — מערכת נועה" }] }),
  component: () => (
    <>
      <PageHeader title="נועה" subtitle="בבנייה — המסך יושלם בהמשך" />
    </>
  ),
});
