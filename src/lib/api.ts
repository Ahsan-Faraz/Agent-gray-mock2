// Mock data layer. Every page reads through these functions, so connecting the
// real backend means replacing each body with the matching call from
// callsure-frontend/src/api/product.ts and keeping the return types.
import { auditEvents, calls, contactTotals, contacts, contactsForList, creditBalance, currentUser, exportJobs, integrations, lists, purchases, teamMembers, timezoneReview } from "./mock-data";

export async function getCurrentUser() { return currentUser; }

export async function getCreditBalance() { return creditBalance; }

// listProductBatches
export async function getLists() { return lists; }

// getProductBatch
export async function getList(id: number) {
  const list = lists.find((item) => item.id === id);
  if (!list) return null;
  return { list, contacts: contactsForList(list) };
}

// listProductCalls
export async function getCalls() { return { calls, total: 1964 }; }

// listProductContacts
export async function getContacts() { return { contacts, totals: contactTotals }; }

// previewProductBatchTimezone (synchronous so the client wizard can call it)
export function previewTimezones(count: number) { return timezoneReview(count); }

// getCreditPurchases
export async function getPurchases() { return purchases; }

// listTenantMembers / listTenantAuditEvents
export async function getTeamMembers() { return teamMembers; }
export async function getAuditEvents() { return auditEvents; }

// CRM integrations + recent export jobs
export async function getIntegrations() { return integrations; }
export async function getExportJobs() { return exportJobs; }
