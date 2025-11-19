# THK-MOM Application Feature & Usage Guide

## 1. Product Overview
THK-MOM (Manufacturing Overview Model) is a Vite + React + TypeScript single-page application that centralizes daily manufacturing intelligence for fabrication, assembly (“Green Room”), and shipping areas. It ships with a seeded in-memory data layer and interactive dashboards so engineers, supervisors, and planners can:

- Visualize asset health, production attainment, and maintenance workload.
- Drill into individual machines, work orders, engineering change orders (ECOs), and shipping orders.
- Launch common shop-floor actions (document uploads, notes, events, maintenance tickets) without leaving context.
- Experiment with “what-if” assignments for machine ownership using the planner.

The UI relies on Tailwind CSS v4, shadcn/ui components (Radix primitives), lucide-react icons, and framer-motion transitions for a fluid experience.

---

## 2. Getting Started
### 2.1 Prerequisites
- Node.js 18+ (Node 20 LTS recommended).
- npm 9+ or a compatible package manager.

### 2.2 Installation
```bash
npm install
```

### 2.3 Running the App
```bash
npm run dev
```
Vite starts on `http://127.0.0.1:5173/` by default. The app auto-initializes its mock database on first load (no external services required).

### 2.4 Build & Preview
- Production bundle: `npm run build`
- Static preview of the bundle: `npm run preview`

### 2.5 Environment Configuration
- `VITE_USE_LIVE_API`: Set to `true` to enable live backend connectivity; defaults to the local mock datastore.
- `VITE_API_BASE_URL`: Base URL for the live API (e.g., `https://mom.yourdomain.com/api`). Required when live mode is enabled.
- `VITE_API_TOKEN`: Optional bearer token injected into the `Authorization` header for secured APIs.
- `VITE_ALERT_EMAIL_WEBHOOK`: Optional POST endpoint triggered for critical alerts (payload includes alert metadata).
- `VITE_ALERT_SMS_WEBHOOK`: Optional POST endpoint for SMS/paging providers when critical alerts fire.
- Create a `.env.local` file for development overrides and document production secrets in your deployment pipeline or vault.

---

## 3. Layout & Navigation
### 3.1 Top Navigation Bar
- **Hamburger menu / Sheet navigation** (upper left) lists plant areas: Home, Production Overview, Green Room, Fabrication, Shipping, Machine Planner.
- **Title & context** show the active area (e.g., “Manufacturing Overview Model • Green Room”).
- **Quick action buttons** (Upload, Note, Event, Work Order, ECO) open global dialogs regardless of the current area.

### 3.2 Main Content Frame
- The header portion swaps between area dashboards and detail pages, each animated with `framer-motion`.
- The content region (`<main>`) either renders the current dashboard or the selected record detail page (machine, ECO, work order, shipping order).

### 3.3 Universal Machine Sidebar
- Any machine card or table row can open the sidebar drawer.
- Includes machine summary, production metrics, recent documents, open work orders, ECOs, and action shortcuts.
- Designed for quick triage without leaving the surrounding dashboard.

### 3.4 User Menu & Role Switcher
- The top-right menu shows the signed-in persona and exposes a role selector seeded with demo users (Administrator, Engineer, Maintenance, Supervisor, Worker, Viewer).
- Switching roles instantly updates visible plant areas, quick actions, and downstream permissions.
- Avatar initials help differentiate profiles when pair-programming or demoing.
- Administrators can open the **Manage Access** dialog to assign access levels to any user without leaving the app.

---

## 4. Cross-cutting Utilities
### 4.1 Global Search (`⌘/Ctrl + K` friendly)
- Located at the top of dashboards (Home, Production, Green Room, Fabrication).
- Searches across machines, documents, events, work orders, and ECOs using debounced queries.
- Highlights matching fields; selecting a result navigates to the appropriate detail page or updates context (e.g., sets selected machine).

### 4.2 Quick Action Dialogs
Accessible from the header buttons and, where relevant, within the sidebar or detail pages.

| Dialog | Purpose | Key Fields & Behaviors |
| --- | --- | --- |
| **UploadDocumentDialog** | Attach machine backups, manuals, or drawings. | Auto-prefills machine and document type when launched from machine context; optionally limited to fabrication machines. |
| **AddNoteDialog** | Capture operator/supervisor notes. | Supports fabrications-only filtering; stores notes locally (mock). |
| **LogEventDialog** | Register downtime, backups, or maintenance events. | Enforces machine selection; uses in-memory API for persistence. |
| **CreateWorkOrderDialog** | Submit corrective, preventive, or emergency tasks. | Validates required fields; auto-prefills from ECO context when launched via “Create Work Order”. |
| **CreateECODialog** | Log engineering change orders. | Collects change rationale, impacted assets, attachments. |

Toaster notifications (via Sonner) confirm successful actions.

### 4.3 Role-Based Access & Personalization
- Capabilities gate navigation, quick actions, and feature visibility (e.g., only administrator-level users see the Machine Planner workspace, while maintenance and supervisor roles can open maintenance dialogs).
- Demo personas and role→capability mapping live in `src/data/users.ts`; extend this file to align with production LDAP/SSO roles.
- User preferences (default plant area, per-area machine filters) persist in `localStorage` via `AuthProvider`; backend integrations can swap this for server-backed settings.
- `useAuth()` exposes helpers (`hasCapability`, `updatePreferences`) so feature teams can respect access rules in new components.
- Supported access levels: **Administrator**, **Engineer**, **Maintenance**, **Supervisor**, **Worker**, and **Viewer**. Administrators can adjust assignments in-app via the Manage Access dialog (header → Manage Access).

### 4.4 Alerting & Escalation
- A global alert evaluator (`AlertProvider`) runs every 60 seconds, watching machine status, maintenance backlog, ECO reviews, shipping queue, and scrap ratios (configurable in `src/utils/alertRules.ts`).
- The bell icon in the header opens the Alert Center, showing active warnings/criticals along with timestamps. Alerts can be refreshed manually or dismissed once addressed.
- Severity is colour-coded: critical alerts highlight in red, warnings amber, informational blue. Toast notifications pop the first time an alert is triggered.
- Extend or tailor alert logic by editing `ALERT_RULES` and adding domain-specific checks (e.g., overtime thresholds, custom KPIs).
- External integrations: populate `VITE_ALERT_EMAIL_WEBHOOK` or `VITE_ALERT_SMS_WEBHOOK` to POST alert payloads (handled by `src/utils/alertNotifications.ts`) to downstream email/SMS systems when critical alerts fire.

---

## 5. Dashboards & Workspaces
### 5.1 Home Dashboard (`src/components/dashboard/HomeDashboard.tsx`)
- **Global KPIs**: Total machines, uptime %, plan attainment, scrap, open work orders, ECOs in review.
- **Area summaries**: Production, Green Room, Fabrication, Shipping cards showing active/down counts and attainment; “Open” buttons jump to detailed dashboards.
- **Recent activity tables**: Latest work orders, ECOs, production highlights, and events.
- Ideal for supervisors starting their shift or leadership seeking at-a-glance context.

### 5.2 Production Overview Dashboard
- Aggregates metrics across Fabrication, Green Room, and Shipping.
- Provides card-based summaries per area: uptime, outstanding work orders, machine counts, shipping backlog.
- Offers call-to-action buttons to enter each workspace.

### 5.3 Green Room Dashboard
- Tailored for assembly/retainer/measurement machines.
- **Status Tiles**: total machines, active vs. down, pending maintenance work orders, ECOs in review, old backups.
- **Tabs**: Machines (with filter/search), Documents, Events, Maintenance (work orders), Changes (ECOs).
- **Dialogs**: “Down Machines,” “Pending Work Orders,” “ECOs in Review,” and “Old Backups” provide curated lists.
- **Floor Map View**: Visual layout showing machine status by coordinates (leveraging `FloorMapView` and `MachineCard`).

### 5.4 Fabrication Dashboard
- Mirrors Green Room structure for fabrication categories (cutting, grinding, molding, etc.).
- Includes local storage-backed Handoff Notes panel for shift communications.
- Utilization insights compute daily attainment and downtime per category using mock production data.

### 5.5 Shipping Dashboard
- Centers on outbound logistics: shipping orders, part readiness, forklift equipment.
- Allows selecting orders for detail view (ShippingOrderDetailsPage) and linking related machines.

### 5.6 Machine Area Planner
- Presents a grid of machine codes and area assignments.
- Auto-classifies from current machine metadata; users can override and persist choices in `localStorage`.
- Filters by search term or area, with badges summarizing counts per area.
- Useful for reorganizing the plant digitally before implementing physical moves.

---

## 6. Detail Pages & Record Management
- Each detail page surfaces any active alerts tied to that asset/order/ECO so owners can triage issues without jumping back to dashboards.
### 6.1 Machine Details Page
- Tabs for Summary, Production History, Maintenance, Documents, Components, Settings, ECOs.
- Supports editing machine metadata with validation (e.g., down machines require downtime reason).
- Inline dialogs to create work orders, upload documents, add notes, log events, and create ECOs.
- Displays KPI progress bars, trend charts, and linked data tables.

### 6.2 Work Order Details Page
- Shows task breakdown, status, parts usage, labor, and related evidence.
- Provides actions to change status, log progress, or launch associated dialogs.

### 6.3 ECO Details Page
- Offers context around change rationale, impacted components/documents, attachments, and workflow status.
- Can spawn a prefilled work-order dialog for implementation tasks.

### 6.4 Shipping Order Details Page
- Tracks item lines, ready quantities, priority, assigned teams, and timestamps.
- Supports updates through the mock API (e.g., mark packed/shipped, allocate parts).

---

## 7. Data Layer & Mock Services
- `src/utils/api.ts` exposes asynchronous functions (getMachines, updateMachine, getWorkOrders, allocateToOrder, etc.) backed by in-memory data (`src/data/mock-data.ts`).
- Calls mimic real endpoints for UI consumption while keeping the project self-contained.
- Machine updates enforce business rules (e.g., downtime requires a reason).
- Shipping utilities simulate allocation and state changes (packed/shipped timestamps).
- When integrating with a real backend, use `api.ts` as the contract reference.

---

## 8. Usage Scenarios
### 8.1 Diagnosing a Down Machine
1. Use Global Search or dashboard cards to locate the machine.
2. Open the Machine Sidebar for a quick glance or jump into Machine Details.
3. Review recent events, documents, and open work orders.
4. Log a new event or create a maintenance work order if needed.

### 8.2 Managing ECO Implementation
1. Navigate to Green Room or Fabrication dashboard → “Changes” tab.
2. Open the ECO to review scope, impacted assets, and attachments.
3. Launch “Create Work Order” from the ECO page to assign implementation tasks.
4. Track progress via the Work Order Details page and update status upon completion.

### 8.3 Preparing Shipments
1. Switch to the Shipping dashboard to view open orders.
2. Filter/select an order to open Shipping Order Details.
3. Verify part readiness, allocate inventory, and mark orders packed or shipped.
4. Use Machine Sidebar to coordinate with relevant packaging equipment if a machine issue impacts throughput.

### 8.4 Rebalancing Machine Ownership
1. Open Machine Area Planner from the navigation menu.
2. Filter by machine code or area to audit current assignments.
3. Use dropdowns to reassign machines; changes persist locally.
4. Export or document the updated plan for offline execution.

---

## 9. Troubleshooting & Tips
- **Initialization hang**: Confirm the dev server console shows “Initialized local in-memory DB.” Refresh the browser once the log appears.
- **Styling anomalies**: Ensure `src/index.css` is imported in `main.tsx` and Tailwind PostCSS plugin runs (i.e., use `npm run dev` or `npm run build`).
- **Data resets**: Restarting the dev server resets the in-memory database to mock defaults. Persistent “notes” in Fabrication dashboard rely on `localStorage`.
- **Port conflicts**: Configure Vite with `npm run dev -- --port <PORT>` if 5173 is in use.
- **Next integration steps**: Swap mock API calls with real endpoints while preserving function signatures for minimal UI refactor.

---

## 10. File Reference Map
- `src/App.tsx`: Root UI state machine controlling navigation, dialogs, and detail page rendering.
- `src/components/dashboard/*`: Area dashboards, status tiles, planner, search.
- `src/components/pages/*`: Full-detail record pages.
- `src/components/dialogs/*`: Modal forms for quick actions.
- `src/components/machine/UniversalMachineSidebar.tsx`: Contextual machine drawer.
- `src/utils/api.ts`: In-memory data service mimicking backend operations.
- `src/data/mock-data.ts`: Seed data used to populate dashboards and detail views.

Use this guide alongside the inline component documentation to onboard engineers, QA, and operations stakeholders quickly.

## 11. Future Enhancements TODO
- [x] **Live data connectivity**: Introduce a production-ready data client that connects dashboards to real MES/SCADA endpoints while preserving the mock layer for offline development.
- [x] **Role-based access & personalization**: Implement user roles, capability gating, and persisted area/filter preferences per user.
- [x] **Alerting & escalation rules**: Add configurable thresholds that surface in-app alerts and trigger notifications when equipment or KPIs breach limits.
- [ ] **Historical & predictive analytics**: Expand machine detail views with multi-day trends, predictive MTBF/MTTR insights, and comparative performance metrics.
- [ ] **Exportable reports**: Provide PDF/CSV generators for shift summaries, maintenance status, and shipping backlogs, including scheduling hooks.
- [ ] **Collaboration enhancements**: Add threaded comments, @mentions, and a global activity feed to capture context around work orders, ECOs, and machine updates.
