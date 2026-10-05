import { PageHeader } from "@/components/ui";
import { getAuditEvents, getCurrentUser, getTeamMembers } from "@/lib/api";
import { ProfileTabs } from "../ProfileTabs";
import { SettingsPanels } from "./SettingsPanels";

export const metadata = { title: "Settings · Agent Gray" };

export default async function SettingsPage() {
  const [members, audit, user] = await Promise.all([getTeamMembers(), getAuditEvents(), getCurrentUser()]);
  return <>
    <PageHeader eyebrow="Workspace administration" title="Settings" description="Manage workspace access." />
    <ProfileTabs />
    <SettingsPanels initialMembers={members} audit={audit} currentUserId={user.userId} canManage={["owner", "admin"].includes(user.role)} />
  </>;
}
