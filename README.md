# Agent Gray: Mockup 2

Frontend mockup of the Agent Gray user dashboard, built with mock data so the design can be reviewed before it is connected to the existing backend.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · lucide-react

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The login and signup forms accept any input and continue into the app.

## Pages

| Route | Page |
| --- | --- |
| `/login`, `/signup` | Sign in / create account |
| `/dashboard` | Counts, recent calls, recent lists, report download |
| `/lists` | All lists (previously "Batches") |
| `/lists/new` | Create a list from a CSV or durable Contacts, then review credits and timezones |
| `/lists/[id]` | List progress, results and stored call analysis |
| `/integrations` | GoHighLevel, HubSpot and Attio connections and mappings |
| `/profile/settings` | Team access and audit trail (opened from the profile menu) |
| `/profile/billing` | Credits, buying credits and purchase history (opened from the profile menu) |
| `/help` | Workspace flow |

## Changes from the current frontend

- Login and signup headline: "Know Who To Call Before You Call"
- Calls and Contacts tabs removed; Settings and Billing moved to the profile menu (top right)
- Batches renamed to Lists
- New visual design (dark only): wide collapsible sidebar, breadcrumb top bar, tabbed list details, step-by-step list creation and slide-over CRM details; page text is unchanged from the current frontend

## Connecting the backend

Every page reads data through `src/lib/api.ts`, which currently returns the mock data in `src/lib/mock-data.ts`. The types in `src/lib/types.ts` mirror the backend API, so connecting it means replacing each function in `api.ts` with the matching backend call. The pages themselves don't need to change.

## Structure

```
src/
  app/
    (auth)/        login, signup
    (app)/         dashboard, lists, integrations, profile, help
  components/      shared UI, sidebar, top bar, dialogs
  lib/             api (mock layer), mock data, types, formatting
public/
  logo.png         original logo
  logo-mark.png    logo as a transparency mask so it takes theme colors
```
