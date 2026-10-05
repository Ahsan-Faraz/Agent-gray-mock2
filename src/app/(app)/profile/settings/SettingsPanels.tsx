"use client";

import clsx from "clsx";
import { History, UserPlus, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, EmptyState, StatusBadge, inputClass, td, th } from "@/components/ui";
import { dateTime, initials } from "@/lib/format";
import type { AuditEvent, MemberRole, TeamMember } from "@/lib/types";

// Content follows the original SettingsPage (non-admin sections). Changes are mock-only.
const ROLES: Array<[MemberRole, string]> = [["viewer", "Viewer"], ["operator", "Operator"], ["admin", "Admin"], ["owner", "Owner"]];
type Section = "team" | "audit";

export function SettingsPanels({ initialMembers, audit, currentUserId, canManage }: { initialMembers: TeamMember[]; audit: AuditEvent[]; currentUserId: number; canManage: boolean }) {
  const toast = useToast();
  const [section, setSection] = useState<Section>("team");
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("operator");
  const [adding, setAdding] = useState(false);

  const invite = (event: FormEvent) => {
    event.preventDefault();
    setAdding(true);
    window.setTimeout(() => {
      setMembers((current) => [...current, { user_id: Date.now(), username: email.split("@")[0], email, role }]);
      toast("Member added");
      setEmail("");
      setAdding(false);
    }, 400);
  };

  return <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 lg:flex-col" aria-label="Settings sections">
      {([["team", "Team access", Users], ["audit", "Audit trail", History]] as const).map(([value, label, Icon]) => <button key={value} onClick={() => setSection(value)} aria-current={section === value ? "page" : undefined} className={clsx("flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold transition", section === value ? "bg-brand-50 text-brand-ink" : "text-muted hover:bg-nav-hover hover:text-ink")}>
        <Icon size={16} aria-hidden="true" />{label}
      </button>)}
    </nav>

    {section === "team" ? <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-bold text-navy">Team access</h2>
        <p className="mt-0.5 text-[13px] text-muted">Workspace membership and role changes are server-authorized.</p>
      </div>
      {canManage && <form onSubmit={invite} className="flex flex-wrap gap-2 border-b border-line bg-canvas px-5 py-4">
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClass} h-10 min-w-0 flex-1 sm:max-w-72`} placeholder="Existing user email" aria-label="Existing user email" />
        <select value={role} onChange={(event) => setRole(event.target.value as MemberRole)} className={`${inputClass} h-10 w-auto`} aria-label="Member role">
          {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <Button size="sm" type="submit" className="h-10" disabled={adding}><UserPlus size={15} aria-hidden="true" /> {adding ? "Adding…" : "Add member"}</Button>
      </form>}
      {members.length === 0 ? <EmptyState title="No member list" description="You may not have permission to manage members, or no members were returned." /> : <ul className="divide-y divide-line">
        {members.map((member) => {
          const editable = canManage && member.user_id !== currentUserId;
          return <li key={member.user_id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-ink">{initials(member.username)}</span>
            <div className="min-w-0 flex-1"><strong className="block truncate text-navy">{member.username}</strong><span className="block truncate text-[13px] text-muted">{member.email}</span></div>
            <div className="flex items-center gap-2">
              {editable && <select value={member.role} onChange={(event) => setMembers((current) => current.map((item) => item.user_id === member.user_id ? { ...item, role: event.target.value as MemberRole } : item))} className="h-9 rounded-lg border border-subtle/70 bg-surface px-2 text-sm" aria-label={`Role for ${member.username}`}>
                {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>}
              <StatusBadge value={member.role} />
              {editable && <Button size="sm" variant="ghost" onClick={() => { setMembers((current) => current.filter((item) => item.user_id !== member.user_id)); toast(`${member.username} removed`); }} aria-label={`Remove ${member.username}`}>Remove</Button>}
            </div>
          </li>;
        })}
      </ul>}
    </Card> : <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-bold text-navy">Audit trail</h2>
        <p className="mt-0.5 text-[13px] text-muted">Recent configuration, integration, and list actions for this workspace.</p>
      </div>
      {audit.length === 0 ? <EmptyState title="No audit events" description="No audit events were returned or you do not have access to them." /> : <div className="relative overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead><tr className="border-b border-line"><th className={th}>Action</th><th className={th}>Resource</th><th className={th}>When</th></tr></thead>
          <tbody>{audit.map((event) => <tr key={event.id} className="border-b border-line last:border-0">
            <td className={td}><strong className="font-semibold text-navy">{event.action}</strong></td>
            <td className={td}>{event.resource_type} {event.resource_id}</td>
            <td className={`${td} whitespace-nowrap text-muted`}>{dateTime(event.created_at)}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>}
  </div>;
}
