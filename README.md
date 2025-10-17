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

## Notes
- Dark mode toggling uses a `.dark` class on `html`; UI tokens come from `src/index.css`.
- Components live under `src/components` with `ui`, `dashboard`, `pages`, `dialogs`, `machine` subfolders.

## Troubleshooting
- If styles look off, ensure Tailwind PostCSS is active (run the dev server) and that `src/index.css` is imported in `src/main.tsx`.
- If a Radix component import is missing, install the corresponding `@radix-ui/*` package.
