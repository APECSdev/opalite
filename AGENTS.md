# AGENTS - Opalite Love

## CRITICAL RULE
**ON EVERY NEW SESSION, READ`docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite Love - Privacy-Preserving Dating on Midnight Network
- **Repo:**`/Workspace/apecsdev/opalite-love`
- **GitHub:** https://github.com/APECSdev/opalite-love (currently PRIVATE, will go public after deployment)
- **Live URL:** https://opalite.love
- **Hackathon:** Rise In — New Moon to Full: Monthly Moonshots on Midnight
- **Current Level:** Level 1 - New Moon (ALMOST COMPLETE, only deployment remaining)

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **Terminal Paste Munging:** Use`python3 << 'PYEOF'` to write files. Heredocs get corrupted.
2. **Astro Layout Conflicts:** Strip ALL original html/head/body/footer tags when using Base.astro.
3. **Tailwind Global Import:** Base.astro must import '../styles/global.css'.
4. **Compact Syntax (v0.23.0):** No contract block wrapper. Top-level: pragma, import, export ledger, export circuit.`let` is reserved but unimplemented. Types Z/Bool/Natural/Bit/number/Int are NOT valid. Counter from CompactStandardLibrary works.
5. **Compact Compile:**`compact compile <source> <target>` e.g.`compact compile src/age_verification.compact src/managed/age_verification`.
6. **Midnight Deps:** compact-runtime@0.16.0, midnight-js@4.1.1, midnight-js-network-id@4.1.1, vitest@^4.1.0, typescript@^6.0.2.
7. **CompactSimulator:** Copy reference simulator, use sed to rename. Circuit calls via`this.contract.impureCircuits.<name>(this.circuitContext).context`.
8. **Node Version:** Node 24.18.1 LTS via nvm.`.nvmrc` specifies 24.
9. **TypeScript Runner:** Use`npx tsx <file.ts>`. Do NOT use ts-node/esm.
10. **Stale Template Cleanup:** Removed old leaderboard packages. Root package.json renamed to opalite-love.
11. **Build Scripts:** Run`pnpm approve-builds`, press 'a' then Enter for classic-level, core-js, esbuild, msgpackr-extract.
12. **Wallet Seeds:** Stored in`.secrets` (chmod 600, gitignored). Never commit.
13. **Deploy CLI Imports:** api.ts imports from`../../packages/contracts/src/managed/age_verification/contract/index.js` (relative from deploy-cli/src/).
14. **Wallet SDK Generation Upgrade:** facade 4.0.1, shielded 3.0.1, unshielded 3.1.0, dust 4.1.0. Upstream example-counter is stale (still on old gen).
15. **compact-js 2.5.3 Uninstallable:** Depends on unpublished @midnight-ntwrk/ledger-v9. Pin compact-js to 2.5.1 (uses ledger-v8).
16. **InMemoryTransactionHistoryStorage Removed:** unshielded-wallet 3.1.0 removed this class. Facade txHistoryStorage is optional. Remove import and config line.
17. **Sync Was NEVER Stuck:** Silent full-chain sync of ~1,358,236 records from preprod genesis. Takes 4-5 hours. '1000:: Normal Closure' RPC messages are noise.
18. **No Sync-From-Index Option:** Grep of shielded/dust/indexer-client d.ts found no startIndex/fromIndex/minIndex parameter.
19. **Progress Logging in api.ts:** After`wallet.start()`, subscriptions print progress with BigInt-safe serializer, throttled to every 20th emission.
20. **smoldot Override:** From create-mn-app scaffold. Only affects polkadot light-client, NOT WsProvider. Harmless. Removed from root package.json.
21. **Root Deps Stripped:** All @midnight-ntwrk dependencies moved from root to deploy-cli/package.json. Root deps are empty.
22. **midnightDbName Added:** LevelDB database named 'opalite-love-preprod-wallet' in config.ts and wired into levelPrivateStateProvider in api.ts.
23. **levelPrivateStateProvider IS Fully Configured:** api.ts lines 546-556 pass accountId (coin public key) and privateStoragePasswordProvider (base64-encoded key + '!'). BUT it only persists contract private state and signing keys, NOT sync state (chain scan position). Sync starts from 0 every time.
24. **Sync OOM Pattern:** 4GB heap → OOM at 3.3% (44k records, ~9 min). 10GB heap → OOM at ~64% (867k records, ~61 min). Memory growth is roughly linear. Need ~16GB heap to complete full sync (1.36M records). Machine has 31GB RAM, ~16GB available.
25. **README Updated:** Has favicon, OG banner, Codecov badge, tech badges, project structure table, getting started guide, age verification contract section.
26. **Faucet API:** The faucet at https://faucet.preprod.midnight.network/ is an Express app. POST /api/drip and /api/faucet return 404. The web UI works (200 OK) but showed 'Transaction submission error' during Session 9. Need to retry or use Discord faucet bot.

## Tech Stack
- Node.js v24.18.1 LTS (nvm, .nvmrc=24)
- TypeScript runner: tsx v4.23.1
- Web: Astro + Tailwind CSS (packages/web)
- PDF: jspdf dynamic server-side
- Contracts: Compact language, compactc v0.31.1, language v0.23.0
- Contract runtime: @midnight-ntwrk/compact-runtime@0.16.0
- Testing: Vitest with on-chain simulator (3 tests passing)
- Deployment: Custom deploy-cli package (tsx-based, self-contained deps)
- Proof server: Docker midnightntwrk/proof-server:8.0.3 port 6300
- Package manager: pnpm v10.7.0 with workspaces

## Key Directories
### Web (packages/web/)
- src/pages/index.astro, whitepaper.astro, whitepaper.pdf.ts
- src/layouts/Base.astro, src/components/Nav.astro, Footer.astro
- src/data/whitepaper/ (content.ts, meta.ts, types.ts, figures/)
- public/ (og-image.png, favicon.png, favicon.ico, favicon.svg)

### Contracts (packages/contracts/)
- src/age_verification.compact - Compact contract (ledger: verifiedCount Counter, circuit: verifyAge)
- src/managed/age_verification/ - Compiled artifacts (circuits, keys, contract JS/TS)
- src/test/ - Simulator and test suite (3 tests passing)
- src/witnesses.ts, src/index.ts - Exports
- README.md, screenshots/compile-and-tests.png

### Deploy CLI (deploy-cli/)
- package.json - Self-contained deps (wallet SDK 4.x gen, midnight-js 4.1.1, tsx)
- src/config.ts - PreprodConfig, PreviewConfig, contractConfig (with midnightDbName)
- src/common-types.ts - AgeVerificationCircuits, AgeVerificationProviders types
- src/logger-utils.ts - Pino logger
- src/api.ts - Wallet creation, faucet funding, DUST, deploy, join, verifyAge. HAS PROGRESS LOGGING INJECTED.
- src/cli.ts - Interactive CLI (wallet menu, deploy/join menu, verify actions)
- src/preprod.ts, src/preview.ts - Entry points
- proof-server.yml - Docker compose for proof server

### Root Files
- .secrets (gitignored, chmod 600) - Wallet seeds
- .nvmrc - Node 24
- package.json - Monorepo (workspaces, deps STRIPPED to empty)
- pnpm-workspace.yaml, vercel.json
- README.md - Enhanced with badges, banner, setup guide
- LICENSE - MIT
- AGENTS.md, docs/HANDOFF.md - Session context

## Wallet Info
- Preprod seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
- Preprod address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- Faucet: https://faucet.preprod.midnight.network/
- Machine: 31GB RAM, ~16GB available. Need 16GB+ heap for full sync.

## Persistence Architecture (CRITICAL — UNRESOLVED)
- levelPrivateStateProvider IS configured in api.ts (lines 546-556) with accountId + passwordProvider
- It persists: contract private state (age verification counter), signing keys
- It does NOT persist: sync state (shielded/dust chain scan position, merkle tree)
- Result: every wallet restart re-syncs from genesis (index 0)
- serialize/restore: mentioned in facade d.ts comment but NOT public API methods
- InMemoryTransactionHistoryStorage: removed from unshielded-wallet 3.1.0
- midnightDbName: added to config but does NOT fix sync persistence
- NEED TO ASK MIDNIGHT DISCORD TEAM for the correct persistence pattern

## Brand Guidelines
- Name: 'Opalite Love' (Title Case, no dot)
- Tagline: Swipe right, reveal later.
- Colors: Opalite gemstone (navy/black, milky blue, lavender, white, rose pink)
- Font web: sans-serif. Font PDF: Poppins Bold + Lato Regular
