# AGENTS — Opalite Love

## CRITICAL RULE
**ON EVERY NEW SESSION, READ `docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite Love — Privacy-Preserving Dating on Midnight Network
- **Repo:** `/Workspace/apecsdev/opalite-love`
- **Live URL:** https://opalite.love
- **Hackathon:** New Moon to Full: Monthly Moonshots on Midnight ($8,000 Prize Pool)

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **Terminal Paste Munging:** The user's terminal emulator corrupts large multi-line pastes (heredocs). Always use `python3 << 'PYEOF'` to write or modify files, as Python handles the standard input safely.
2. **Astro Layout Conflicts:** When refactoring existing HTML pages to use a shared `Base.astro` layout, manually strip ALL original `<html>`, `<head>`, `<body>`, and `<footer>` tags. Only keep the content inside `<main>`.
3. **Tailwind Global Import:** `Base.astro` must contain `import '../styles/global.css';` for Tailwind classes to apply across the site.

## Tech Stack & Architecture
- **Framework:** Astro (Monorepo with `packages/web`)
- **Styling:** Tailwind CSS (Dark mode, Fuchsia/Opalite color scheme)
- **PDF Generation:** `jspdf` (dynamic, server-side rendering via `/whitepaper.pdf.ts`)
- **Fonts:** Custom TTFs loaded dynamically via `fs` in the PDF endpoint (`packages/web/src/fonts/OpaliteTitle.ttf`, `OpaliteBody.ttf`)

## Key Directories (`packages/web/`)
- `src/pages/index.astro` — Landing page (Hero, How it Works, Download)
- `src/pages/whitepaper.astro` — Page embedding the PDF
- `src/pages/whitepaper.pdf.ts` — API endpoint generating the dynamic PDF
- `src/layouts/Base.astro` — Shared HTML shell (Head, OG tags, Favicon, Tailwind import)
- `src/components/Nav.astro` — Shared header (Title case "Opalite Love", larger font)
- `src/components/Footer.astro` — Shared footer
- `src/data/whitepaper/` — `content.ts`, `meta.ts`, `types.ts`, `figures/` (architecture diagram)
- `public/` — `og-image.png`, `favicon.ico`, `favicon.png`, `favicon.svg`

## Brand Guidelines
- **Name:** "Opalite Love" (No dot, Title Case)
- **Tagline:** Swipe right, reveal later.
- **Colors:** Opalite gemstone theme (Deep navy/black bg, iridescent milky blue, soft lavender, glowing white, rose pink)
- **Font (Web):** Sans-serif (clean, modern)
- **Font (PDF):** Title: Poppins Bold (`OpaliteTitle.ttf`), Body: Lato Regular (`OpaliteBody.ttf`)
