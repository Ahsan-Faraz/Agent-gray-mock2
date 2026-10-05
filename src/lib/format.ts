// Labels match callsure-frontend so both apps read the same.

export const BRAND = { name: "Agent Gray", first: "Agent", second: "Gray" };

export function number(value: number | undefined | null) {
  return (value ?? 0).toLocaleString("en-US");
}

// Plain "YYYY-MM-DD" dates are calendar days, so read them as local dates;
// otherwise they parse as UTC midnight and show a day early in US timezones.
function parse(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export function date(value: string) {
  return parse(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function dateTime(value: string) {
  return parse(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

export function confidencePercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${Math.round(value <= 1 ? value * 100 : value)}%`;
}

// Status values are shown as words: "waiting_for_numbers" -> "Waiting for numbers".
export function humanize(value: string | null | undefined) {
  const text = (value || "unknown").replaceAll("_", " ").replaceAll("-", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sourceLabel(source: string) {
  const labels: Record<string, string> = { gohighlevel: "GoHighLevel contacts", csv: "CSV", manual: "Manual", api: "Agent Gray Contacts", contacts: "Agent Gray Contacts", import: "Imported contacts", hubspot: "HubSpot contacts", attio: "Attio contacts" };
  return (labels[source] ?? source) || "Agent Gray Contacts";
}

export function priorityLabel(tier: string | null | undefined, reviewState?: string | null) {
  if (reviewState === "needs_review" || reviewState === "manual_review") tier = "P3";
  switch (tier) {
    case "P1": return "P1 - Likely Answer";
    case "P2": return "P2 - Likely Voicemail";
    case "P3": case "needs_review": case "manual_review": return "P3 - Likely Unreachable";
    case "P4": return "P4 - Others";
    default: return "—";
  }
}

export function classificationResultLabel(value: string) {
  return value === "needs_review" || value === "manual_review" ? priorityLabel("P3") : value;
}

export function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
