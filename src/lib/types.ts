// Shapes mirror the backend product API (callsure-frontend/src/api/product.ts).
// "Batch" is shown as "List" in the UI, but field names stay the same so the
// mock layer in api.ts can be swapped for real fetch calls later.

export type ListStatus = "created" | "scheduled" | "scheduled_starting" | "waiting_for_numbers" | "running" | "completed" | "cancelled" | "failed";

// Batch
export type ContactList = {
  id: number;
  name: string;
  description: string;
  source_type: string;
  run_mode: "live" | "simulated";
  status: ListStatus;
  scheduled_date?: string | null;
  contact_count: number;
  new_contact_count: number;
  rerun_contact_count: number;
  processed_count: number;
  verified_count: number;
  wrong_person_count: number;
  no_engagement_count: number;
  failure_count: number;
  progress_percent: number;
  credits_consumed: number;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
};

// BatchContactRow
export type ListContact = {
  execution_id: number;
  contact_id: number;
  contact_name: string;
  phone_e164: string;
  processing_status: string;
  sureconnect_outcome: string;
  confidence?: number | null;
  priority_tier: string;
  review_state: string;
  call_id?: number;
  updated_at: string;
};

// CallListItem (subset used by the dashboard)
export type CallListItem = {
  id: number;
  contact_name: string;
  phone_e164: string;
  telephony_provider: string;
  call_status: string;
  final_disposition: string;
  updated_at: string;
};

// ProductContactRow (subset used when selecting contacts for a list)
export type ContactRow = {
  id: number;
  full_name: string;
  source: string;
  location: string;
  mobile_phone_e164: string;
  processing_state: "never_processed" | "processed";
};

export type TimezoneReviewContact = {
  id: number;
  name: string;
  phone: string;
  location: string;
  source: string;
  is_new: boolean;
  timezone: string;
  timezone_label: string;
  timezone_status: "resolved" | "needs_review";
  timezone_message?: string;
  timezone_candidates?: string[];
};

export type CreditBalance = {
  available: number;
  reserved_credits: number;
  total_balance: number;
};

export type CreditPurchase = {
  id: number;
  created_at: string;
  credits: number;
  amount_cents: number;
  status: "paid" | "checkout_pending" | "failed" | "expired" | "refunded";
};

export type MemberRole = "owner" | "admin" | "operator" | "viewer";

export type TeamMember = {
  user_id: number;
  username: string;
  email: string;
  role: MemberRole;
};

export type AuditEvent = {
  id: number;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
};

export type CRMProvider = "gohighlevel" | "hubspot" | "attio";

export type Integration = {
  provider: CRMProvider;
  displayName: string;
  initials: string;
  color: string;
  description: string;
  capabilityLabels: string[];
  status: "Connected" | "Not connected" | "Needs attention" | "Reconnect required";
  account: string | null;
  workspace_id: string | null;
  total_contacts: number | null;
  last_connected_at: string | null;
  last_successful_sync_at: string | null;
  sync_status: string | null;
};

export type ExportJob = {
  id: number;
  destination: string;
  status: string;
  contacts: number;
  created_at: string;
};

export type User = {
  userId: number;
  name: string;
  email: string;
  organization: string;
  role: MemberRole;
};
