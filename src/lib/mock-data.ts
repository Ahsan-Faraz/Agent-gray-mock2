import type { AuditEvent, CallListItem, ContactList, ContactRow, CreditBalance, CreditPurchase, ExportJob, Integration, ListContact, TeamMember, TimezoneReviewContact, User } from "./types";

export const currentUser: User = {
  userId: 1,
  name: "Ahsan Faraz",
  email: "ahsan@acme-realty.com",
  organization: "Acme Realty",
  role: "owner",
};

export const creditBalance: CreditBalance = {
  available: 1240,
  reserved_credits: 160,
  total_balance: 1400,
};

export const lists: ContactList[] = [
  { id: 108, name: "October webinar sign-ups", description: "Leads from the Oct 2 webinar form", source_type: "csv", run_mode: "live", status: "running", contact_count: 320, new_contact_count: 296, rerun_contact_count: 24, processed_count: 182, verified_count: 121, wrong_person_count: 18, no_engagement_count: 34, failure_count: 9, progress_percent: 57, credits_consumed: 182, created_at: "2026-10-04T09:12:00Z", updated_at: "2026-10-05T11:40:00Z", started_at: "2026-10-04T09:20:00Z" },
  { id: 107, name: "HubSpot inbound Q4", description: "Inbound leads synced from HubSpot", source_type: "contacts", run_mode: "live", status: "scheduled", scheduled_date: "2026-10-07", contact_count: 160, new_contact_count: 160, rerun_contact_count: 0, processed_count: 0, verified_count: 0, wrong_person_count: 0, no_engagement_count: 0, failure_count: 0, progress_percent: 0, credits_consumed: 0, created_at: "2026-10-03T15:30:00Z", updated_at: "2026-10-03T15:30:00Z" },
  { id: 106, name: "Open house Lakeview", description: "Visitor sheet from Sept 28 open house", source_type: "csv", run_mode: "live", status: "completed", contact_count: 84, new_contact_count: 84, rerun_contact_count: 0, processed_count: 84, verified_count: 61, wrong_person_count: 7, no_engagement_count: 12, failure_count: 4, progress_percent: 100, credits_consumed: 84, created_at: "2026-09-29T10:05:00Z", updated_at: "2026-09-29T16:48:00Z", started_at: "2026-09-29T10:10:00Z" },
  { id: 105, name: "GoHighLevel buyers", description: "Buyer pipeline contacts", source_type: "gohighlevel", run_mode: "live", status: "completed", contact_count: 512, new_contact_count: 470, rerun_contact_count: 42, processed_count: 512, verified_count: 344, wrong_person_count: 51, no_engagement_count: 92, failure_count: 25, progress_percent: 100, credits_consumed: 512, created_at: "2026-09-22T08:20:00Z", updated_at: "2026-09-23T14:02:00Z", started_at: "2026-09-22T08:30:00Z" },
  { id: 104, name: "Facebook lead ads September", description: "", source_type: "csv", run_mode: "live", status: "completed", contact_count: 240, new_contact_count: 240, rerun_contact_count: 0, processed_count: 240, verified_count: 139, wrong_person_count: 38, no_engagement_count: 51, failure_count: 12, progress_percent: 100, credits_consumed: 240, created_at: "2026-09-15T13:44:00Z", updated_at: "2026-09-16T09:10:00Z", started_at: "2026-09-15T14:00:00Z" },
  { id: 103, name: "Old CRM export", description: "Stale contacts from 2024", source_type: "csv", run_mode: "live", status: "cancelled", contact_count: 900, new_contact_count: 900, rerun_contact_count: 0, processed_count: 210, verified_count: 88, wrong_person_count: 41, no_engagement_count: 63, failure_count: 18, progress_percent: 23, credits_consumed: 210, created_at: "2026-09-08T11:00:00Z", updated_at: "2026-09-08T15:21:00Z", started_at: "2026-09-08T11:05:00Z" },
];

const firstNames = ["Olivia", "Liam", "Emma", "Noah", "Ava", "James", "Sophia", "Lucas", "Mia", "Ethan", "Isabella", "Mason", "Amelia", "Logan", "Harper", "Elijah", "Evelyn", "Aiden", "Abigail", "Carter"];
const lastNames = ["Johnson", "Martinez", "Brown", "Davis", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "White", "Harris", "Clark", "Lewis", "Walker", "Young", "Allen", "King", "Wright", "Scott"];
const cities = ["Austin, TX", "Denver, CO", "Phoenix, AZ", "Miami, FL", "Seattle, WA", "Chicago, IL", "Atlanta, GA", "Dallas, TX"];

const outcomeTier: Record<string, string> = { verified: "P1", no_engagement: "P2", wrong_person: "P3", failed: "P4" };

function person(seed: number) {
  return {
    name: `${firstNames[seed % firstNames.length]} ${lastNames[(seed * 3) % lastNames.length]}`,
    phone: `+1${200 + (seed % 700)}${String(1000000 + ((seed * 7919) % 9000000)).slice(0, 7)}`,
    location: cities[seed % cities.length],
  };
}

// Deterministic per-list contacts so the same list always shows the same rows.
export function contactsForList(list: ContactList): ListContact[] {
  const pool = [
    ...Array(list.verified_count).fill("verified"),
    ...Array(list.wrong_person_count).fill("wrong_person"),
    ...Array(list.no_engagement_count).fill("no_engagement"),
    ...Array(list.failure_count).fill("failed"),
  ] as string[];
  const count = Math.min(list.contact_count, 50);
  const processedRows = Math.round((list.processed_count / list.contact_count) * count);
  return Array.from({ length: count }, (_, index) => {
    const seed = list.id * 31 + index * 7;
    const processed = index < processedRows && pool.length > 0;
    const outcome = processed ? pool[(seed * 13) % pool.length] : "";
    const { name, phone } = person(seed);
    return {
      execution_id: list.id * 1000 + index,
      contact_id: seed,
      contact_name: name,
      phone_e164: phone,
      processing_status: processed ? "completed" : list.status === "running" && index === processedRows ? "running" : "queued",
      sureconnect_outcome: outcome,
      confidence: processed ? 0.55 + ((seed * 11) % 45) / 100 : null,
      priority_tier: outcomeTier[outcome] ?? "",
      review_state: "",
      call_id: processed ? list.id * 1000 + index : undefined,
      updated_at: list.updated_at,
    };
  });
}

const callStatuses = ["completed", "completed", "no-answer", "completed", "busy", "completed", "failed"];
const dispositions: Record<string, string> = { completed: "verified", "no-answer": "no_engagement", busy: "no_engagement", failed: "invalid_number" };
export const calls: CallListItem[] = Array.from({ length: 8 }, (_, index) => {
  const { name, phone } = person(500 + index * 17);
  const status = callStatuses[index % callStatuses.length];
  return { id: 9000 + index, contact_name: name, phone_e164: phone, telephony_provider: "twilio", call_status: status, final_disposition: index === 3 ? "wrong_person" : dispositions[status], updated_at: new Date(Date.UTC(2026, 9, 5, 11, 40 - index * 6)).toISOString() };
});

export const contacts: ContactRow[] = Array.from({ length: 14 }, (_, index) => {
  const { name, phone, location } = person(900 + index * 13);
  return { id: 3000 + index, full_name: name, source: ["csv", "gohighlevel", "manual", "csv", "hubspot"][index % 5], location, mobile_phone_e164: phone, processing_state: index % 3 === 0 ? "processed" : "never_processed" };
});

export const contactTotals = { all: 1842, newContacts: 316, processed: 1526 };

export function timezoneReview(count: number): TimezoneReviewContact[] {
  return contacts.slice(0, Math.min(count, 8)).map((contact, index) => {
    const needsReview = index === 2 || index === 5;
    return {
      id: contact.id,
      name: contact.full_name,
      phone: contact.mobile_phone_e164,
      location: needsReview ? (index === 2 ? "Springfield" : "") : contact.location,
      source: contact.source,
      is_new: contact.processing_state === "never_processed",
      timezone: needsReview ? "" : "America/Chicago",
      timezone_label: needsReview ? "" : "Central Time",
      timezone_status: needsReview ? "needs_review" : "resolved",
      timezone_message: needsReview ? (index === 2 ? "This location matches more than one timezone." : "No location provided.") : undefined,
      timezone_candidates: index === 2 ? ["America/Chicago", "America/New_York"] : undefined,
    };
  });
}

export const purchases: CreditPurchase[] = [
  { id: 9, created_at: "2026-10-01T10:00:00Z", credits: 1000, amount_cents: 100000, status: "paid" },
  { id: 8, created_at: "2026-09-20T09:30:00Z", credits: 500, amount_cents: 50000, status: "paid" },
  { id: 7, created_at: "2026-09-20T09:24:00Z", credits: 500, amount_cents: 50000, status: "failed" },
  { id: 6, created_at: "2026-09-05T14:12:00Z", credits: 1000, amount_cents: 100000, status: "paid" },
];

export const teamMembers: TeamMember[] = [
  { user_id: 1, username: "Ahsan Faraz", email: "ahsan@acme-realty.com", role: "owner" },
  { user_id: 2, username: "Sara Khan", email: "sara@acme-realty.com", role: "admin" },
  { user_id: 3, username: "Daniel Reed", email: "daniel@acme-realty.com", role: "operator" },
  { user_id: 4, username: "Maya Lopez", email: "maya@acme-realty.com", role: "viewer" },
];

export const auditEvents: AuditEvent[] = [
  { id: 41, action: "batch.started", resource_type: "batch", resource_id: "108", created_at: "2026-10-04T09:20:00Z" },
  { id: 40, action: "batch.created", resource_type: "batch", resource_id: "108", created_at: "2026-10-04T09:12:00Z" },
  { id: 39, action: "batch.scheduled", resource_type: "batch", resource_id: "107", created_at: "2026-10-03T15:30:00Z" },
  { id: 38, action: "integration.sync_completed", resource_type: "crm_connection", resource_id: "hubspot", created_at: "2026-10-03T15:02:00Z" },
  { id: 37, action: "member.role_changed", resource_type: "membership", resource_id: "3", created_at: "2026-10-02T12:44:00Z" },
  { id: 36, action: "credits.purchased", resource_type: "credit_purchase", resource_id: "9", created_at: "2026-10-01T10:00:00Z" },
];

export const integrations: Integration[] = [
  { provider: "gohighlevel", displayName: "GoHighLevel", initials: "GH", color: "#16a36a", description: "Import and keep GoHighLevel location contacts linked to Agent Gray.", capabilityLabels: ["Contact sync", "Result export", "Outcome tags"], status: "Connected", account: "Acme Realty", workspace_id: "loc_8hT2kQ", total_contacts: 1204, last_connected_at: "2026-09-12T10:00:00Z", last_successful_sync_at: "2026-10-05T08:00:00Z", sync_status: "completed" },
  { provider: "hubspot", displayName: "HubSpot", initials: "HS", color: "#ff6b35", description: "Sync HubSpot contacts while preserving their CRM identity.", capabilityLabels: ["Contact sync", "Result export"], status: "Connected", account: "acme-realty.hubspot.com", workspace_id: "48213377", total_contacts: 412, last_connected_at: "2026-09-20T09:00:00Z", last_successful_sync_at: "2026-10-03T15:02:00Z", sync_status: "completed" },
  { provider: "attio", displayName: "Attio", initials: "AT", color: "#6d5ce7", description: "Connect Attio People records to your verification workflow.", capabilityLabels: ["Contact sync", "Result export"], status: "Not connected", account: null, workspace_id: null, total_contacts: null, last_connected_at: null, last_successful_sync_at: null, sync_status: null },
];

export const exportJobs: ExportJob[] = [
  { id: 12, destination: "GoHighLevel", status: "completed", contacts: 512, created_at: "2026-09-23T15:00:00Z" },
  { id: 11, destination: "HubSpot", status: "completed", contacts: 84, created_at: "2026-09-29T17:10:00Z" },
];
