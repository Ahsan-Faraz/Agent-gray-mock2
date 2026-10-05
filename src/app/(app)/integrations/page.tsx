import { PageHeader } from "@/components/ui";
import { getExportJobs, getIntegrations } from "@/lib/api";
import { IntegrationCards } from "./IntegrationCards";

export const metadata = { title: "Integrations · Agent Gray" };

export default async function IntegrationsPage() {
  const [integrations, exports] = await Promise.all([getIntegrations(), getExportJobs()]);
  return <>
    <PageHeader eyebrow="Workspace" title="Integrations" description="Connect the CRMs your team uses. Import contacts, keep source records linked, and send selected Agent Gray results back after processing." />
    <IntegrationCards initial={integrations} exports={exports} />
  </>;
}
