# AGENTS — Opalite Love

## CRITICAL RULE
**ON EVERY NEW SESSION, READ `docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite Love — Privacy-Preserving Dating on Midnight Network
- **Repo:** `/Workspace/apecsdev/opalite-love`
- **Live URL:** https://opalite.love
- **Hackathon:** New Moon to Full: Monthly Moonshots on Midnight ($8,000 Prize Pool)
- **Current Level:** Level 1 — New Moon Submission (ALMOST COMPLETE, only deployment remaining)

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **Terminal Paste Munging:** The user's terminal emulator corrupts large multi-line pastes (heredocs). Always use `python3 << 'PYEOF'` to write or modify files, as Python handles the standard input safely.
2. **Astro Layout Conflicts:** When refactoring existing HTML pages to use a shared `Base.astro` layout, manually strip ALL original `<html>`, `<head>`, `<body>`, and `<footer>` tags. Only keep the content inside `<main>`.
3. **Tailwind Global Import:** `Base.astro` must contain `import '../styles/global.css';` for Tailwind classes to apply across the site.
4. **Compact Language Syntax (v0.23.0):** Compact contracts do NOT use a `contract` block wrapper. Everything is top-level: `pragma language_version >= 0.20;` then `import CompactStandardLibrary;` then `export ledger name: Type;` and `export circuit name(params): ReturnType { ... }`. Return type `[]` means void. The `let` keyword is reserved for future use — inline expressions directly. Types `Z`, `Bool`, `boolean`, `Natural`, `Bit`, `number`, `Int` are NOT valid type names. The `Counter` type from `CompactStandardLibrary` works. Parameter types are unknown — we could not get any parameter type to compile.
5. **Compact Compile Command:** Syntax is `compact compile <source-pathname> <target-directory-pathname>` (e.g., `compact compile src/age_verification.compact src/managed/age_verification`).
6. **Midnight Dependency Versions:** `@midnight-ntwrk/compact-runtime` is at `0.16.0` (NOT `^1.0.0`). `@midnight-ntwrk/midnight-js-network-id` is at `4.1.1`. `vitest` is at `^4.1.0`. `typescript` is at `^6.0.2`.
7. **CompactSimulator Pattern:** Tests use a simulator class that wraps the compiled contract. The simulator imports from `@midnight-ntwrk/compact-runtime` and the managed contract output. Circuit calls go through `this.contract.impureCircuits.<circuitName>(this.circuitContext).context`. Copy the reference simulator and use `sed` to rename.

## Tech Stack & Architecture
- **Web Framework:** Astro (Monorepo with `packages/web`)
- **Styling:** Tailwind CSS (Dark mode, Fuchsia/Opalite color scheme)
- **PDF Generation:** `jspdf` (dynamic, server-side rendering via `/whitepaper.pdf.ts`)
- **Smart Contracts:** Compact language (Midnight Network), compiled with `compactc v0.31.1` (language v0.23.0)
- **Contract Runtime:** `@midnight-ntwrk/compact-runtime@0.16.0`
- **Contract Testing:** Vitest with on-chain simulator pattern
- **Fonts:** Custom TTFs loaded dynamically via `fs` in the PDF endpoint

## Key Directories
### Web (`packages/web/`)
- `src/pages/index.astro` — Landing page (Hero, How it Works, Download)
- `src/pages/whitepaper.astro` — Page embedding the PDF
- `src/pages/whitepaper.pdf.ts` — API endpoint generating the dynamic PDF
- `src/layouts/Base.astro` — Shared HTML shell (Head, OG tags, Favicon, Tailwind import)
- `src/components/Nav.astro` — Shared header (Title case 'Opalite Love', larger font)
- `src/components/Footer.astro` — Shared footer
- `src/data/whitepaper/` — `content.ts`, `meta.ts`, `types.ts`, `figures/` (architecture diagram)
- `public/` — `og-image.png`, `favicon.ico`, `favicon.png`, `favicon.svg`

### Contracts (`packages/contracts/`)
- `src/age_verification.compact` — Compact contract (public ledger state: verifiedCount Counter)
- `src/managed/age_verification/` — Compiled artifacts (circuits, keys, contract JS/TS)
- `src/test/age-verification-simulator.ts` — On-chain simulator for testing
- `src/test/age-verification.test.ts` — Test suite (3 tests, all passing)
- `src/witnesses.ts` — Private state type and witnesses export
- `src/index.ts` — Contract and witnesses re-export
- `package.json` — Scripts: compact, test, build
- `README.md` — Product idea, public/private witness explanation, setup instructions
- `screenshots/compile-and-tests.png` — Screenshot of compile + test output

### Reference Projects (`/Workspace/apecsdev/`)
- `midnight-counter-official/` — Official Midnight example-counter (reference for contract structure)
- `midnight-counter-reference/` — Another copy with Preprod deployment setup (counter-cli with wallet SDK)

## Brand Guidelines
- **Name:** 'Opalite Love' (No dot, Title Case)
- **Tagline:** Swipe right, reveal later.
- **Colors:** Opalite gemstone theme (Deep navy/black bg, iridescent milky blue, soft lavender, glowing white, rose pink)
- **Font (Web):** Sans-serif (clean, modern)
- **Font (PDF):** Title: Poppins Bold (`OpaliteTitle.ttf`), Body: Lato Regular (`OpaliteBody.ttf`)
