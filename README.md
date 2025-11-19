# THK-MOM (Vite + React + shadcn/ui)

A Vite React TypeScript app integrating shadcn/ui (Radix), Tailwind CSS v4, and the THK-MOM demo features (Green Room dashboard, machine pages, dialogs, and reports).

## Stack
- Vite 7 + React 19 + TypeScript
- Tailwind CSS v4 with `@tailwindcss/postcss`, `tailwindcss-animate`
- shadcn/ui patterns (Radix primitives): dialog, select, tabs, tooltip, sheet, etc.
- framer-motion, lucide-react, sonner, jsPDF

## Scripts
- Dev: `npm run dev` (starts Vite on http://localhost:5173)
- Build: `npm run build`
- Preview: `npm run preview`

## Environment
- `VITE_USE_LIVE_API`: Toggle between mock data (default) and live backend connectivity (`true`).
- `VITE_API_BASE_URL`: Base URL for the live API when live mode is enabled.
- `VITE_API_TOKEN`: Optional bearer token appended to live API requests.
- `VITE_ALERT_EMAIL_WEBHOOK`: Optional POST endpoint invoked for critical alerts (email integrations).
- `VITE_ALERT_SMS_WEBHOOK`: Optional POST endpoint invoked for critical alerts (SMS/paging integrations).

## Notes
- Dark mode toggling uses a `.dark` class on `html`; UI tokens come from `src/index.css`.
- Components live under `src/components` with `ui`, `dashboard`, `pages`, `dialogs`, `machine` subfolders.
- The header role switcher (`AuthProvider`) ships with Administrator, Engineer, Maintenance, Supervisor, Worker, and Viewer personas. Admins can open **Manage Access** to reassign levels; per-user preferences (default area, machine filters) persist in `localStorage`.
- Automated alerting (`AlertProvider`) evaluates machine/maintenance/shipping health every minute. Use the header bell to review or dismiss active alerts; add new rules in `src/utils/alertRules.ts`.

## Troubleshooting
- If styles look off, ensure Tailwind PostCSS is active (run the dev server) and that `src/index.css` is imported in `src/main.tsx`.
- If a Radix component import is missing, install the corresponding `@radix-ui/*` package.
