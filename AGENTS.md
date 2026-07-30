# AGENTS - Opalite Love

## CRITICAL RULE
**ON EVERY NEW SESSION, READ `docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite Love - Privacy-Preserving Dating on Midnight Network
- **Repo:** `/Workspace/apecsdev/opalite-love`
- **Live URL:** https://opalite.love
- **Hackathon:** New Moon to Full: Monthly Moonshots on Midnight
- **Current Level:** Level 1 - New Moon (ALMOST COMPLETE, only deployment remaining)

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **Terminal Paste Munging:** Use `python3 << 'PYEOF'` to write files. Heredocs get corrupted.
2. **Astro Layout Conflicts:** Strip ALL original html/head/body/footer tags when using Base.astro.
3. **Tailwind Global Import:** Base.astro must import '../styles/global.css'.
4. **Compact Syntax (v0.23.0):** No contract block wrapper. Top-level: pragma, import, export ledger, export circuit. `let` is reserved but unimplemented. Types Z/Bool/Natural/Bit/number/Int are NOT valid. Counter from CompactStandardLibrary works. Parameter types unknown.
5. **Compact Compile:** `compact compile <source> <target>` e.g. `compact compile src/age_verification.compact src/managed/age_verification`.
6. **Midnight Deps:** compact-runtime@0.16.0, midnight-js@4.1.1, midnight-js-network-id@4.1.1, vitest@^4.1.0, typescript@^6.0.2.
7. **CompactSimulator:** Copy reference simulator, use sed to rename. Circuit calls via `this.contract.impureCircuits.<name>(this.circuitContext).context`.
8. **Node Version:** Node 24.18.1 LTS via nvm. Node 22 removed `--experimental-specifier-resolution=node` which crashed ts-node. `.nvmrc` specifies 24.
9. **TypeScript Runner:** Use `npx tsx <file.ts>`. Do NOT use ts-node/esm or --experimental-specifier-resolution.
10. **Stale Template Cleanup:** Removed old leaderboard packages. Root package.json renamed to opalite-love.
11. **Build Scripts:** Run `pnpm approve-builds`, press 'a' then Enter for classic-level, core-js, esbuild, msgpackr-extract.
12. **Wallet Seeds:** Stored in `.secrets` (chmod 600, gitignored). Never commit.
13. **Deploy CLI Imports:** api.ts imports from `../../packages/contracts/src/managed/age_verification/contract/index.js` (relative from deploy-cli/src/). Contracts package is NOT built to dist/.

## Tech Stack
- Node.js v24.18.1 LTS (nvm, .nvmrc=24)
- TypeScript runner: tsx v4.23.1
- Web: Astro + Tailwind CSS (packages/web)
- PDF: jspdf dynamic server-side
- Contracts: Compact language, compactc v0.31.1, language v0.23.0
- Contract runtime: @midnight-ntwrk/compact-runtime@0.16.0
- Testing: Vitest with on-chain simulator
- Deployment: Custom deploy-cli package (tsx-based)
- Proof server: Docker midnightntwrk/proof-server:8.0.3 port 6300
- Package manager: pnpm v10.7.0 with workspaces

## Key Directories
### Web (packages/web/)
- src/pages/index.astro, whitepaper.astro, whitepaper.pdf.ts
- src/layouts/Base.astro, src/components/Nav.astro, Footer.astro
- src/data/whitepaper/ (content.ts, meta.ts, types.ts, figures/)
- public/ (og-image.png, favicons)

### Contracts (packages/contracts/)
- src/age_verification.compact - Compact contract (ledger: verifiedCount Counter, circuit: verifyAge)
- src/managed/age_verification/ - Compiled artifacts (circuits, keys, contract JS/TS)
- src/test/ - Simulator and test suite (3 tests passing)
- src/witnesses.ts, src/index.ts - Exports
- README.md, screenshots/compile-and-tests.png

### Deploy CLI (deploy-cli/)
- package.json - Scripts: preprod (tsx src/preprod.ts), preview (tsx src/preview.ts)
- proof-server.yml - Docker compose for proof server
- src/config.ts - PreprodConfig, PreviewConfig network settings
- src/common-types.ts - AgeVerificationCircuits, AgeVerificationProviders types
- src/logger-utils.ts - Pino logger
- src/api.ts - Wallet creation, faucet funding, DUST, deploy, join, verifyAge
- src/cli.ts - Interactive CLI (wallet menu, deploy/join menu, verify actions)
- src/preprod.ts, src/preview.ts - Entry points

### Root Files
- .secrets (gitignored, chmod 600) - Wallet seeds
- .nvmrc - Node 24
- package.json - Monorepo (workspaces: packages/contracts, packages/web, deploy-cli)
- pnpm-workspace.yaml, vercel.json

### Reference Projects (/Workspace/apecsdev/)
- midnight-counter-official/ - Official example-counter
- midnight-counter-reference/ - Preprod deployment setup (counter-cli with wallet SDK)

## Wallet Info
- Preprod seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
- Preprod address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- Faucet: https://faucet.preprod.midnight.network/

## Brand Guidelines
- Name: 'Opalite Love' (Title Case, no dot)
- Tagline: Swipe right, reveal later.
- Colors: Opalite gemstone (navy/black, milky blue, lavender, white, rose pink)
- Font web: sans-serif. Font PDF: Poppins Bold + Lato Regular
