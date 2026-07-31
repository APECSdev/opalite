# AGENTS - Opalite Love

## CRITICAL RULE
**ON EVERY NEW SESSION, READ`docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite Love - Privacy-Preserving Dating on Midnight Network
- **Repo:**`/Workspace/apecsdev/opalite-love`
- **Live URL:** https://opalite.love
- **Hackathon:** New Moon to Full: Monthly Moonshots on Midnight
- **Current Level:** Level 1 - New Moon (ALMOST COMPLETE, only deployment remaining)

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **Terminal Paste Munging:** Use`python3 << 'PYEOF'` to write files. Heredocs get corrupted.
2. **Astro Layout Conflicts:** Strip ALL original html/head/body/footer tags when using Base.astro.
3. **Tailwind Global Import:** Base.astro must import '../styles/global.css'.
4. **Compact Syntax (v0.23.0):** No contract block wrapper. Top-level: pragma, import, export ledger, export circuit.`let` is reserved but unimplemented. Types Z/Bool/Natural/Bit/number/Int are NOT valid. Counter from CompactStandardLibrary works. Parameter types unknown.
5. **Compact Compile:**`compact compile <source> <target>` e.g.`compact compile src/age_verification.compact src/managed/age_verification`.
6. **Midnight Deps:** compact-runtime@0.16.0, midnight-js@4.1.1, midnight-js-network-id@4.1.1, vitest@^4.1.0, typescript@^6.0.2.
7. **CompactSimulator:** Copy reference simulator, use sed to rename. Circuit calls via`this.contract.impureCircuits.<name>(this.circuitContext).context`.
8. **Node Version:** Node 24.18.1 LTS via nvm. Node 22 removed`--experimental-specifier-resolution=node` which crashed ts-node.`.nvmrc` specifies 24.
9. **TypeScript Runner:** Use`npx tsx <file.ts>`. Do NOT use ts-node/esm or --experimental-specifier-resolution.
10. **Stale Template Cleanup:** Removed old leaderboard packages. Root package.json renamed to opalite-love.
11. **Build Scripts:** Run`pnpm approve-builds`, press 'a' then Enter for classic-level, core-js, esbuild, msgpackr-extract.
12. **Wallet Seeds:** Stored in`.secrets` (chmod 600, gitignored). Never commit.
13. **Deploy CLI Imports:** api.ts imports from`../../packages/contracts/src/managed/age_verification/contract/index.js` (relative from deploy-cli/src/). Contracts package is NOT built to dist/.
14. **Wallet SDK Generation Upgrade (Session 9):** Upgraded from old gen to current: facade 4.0.1, shielded 3.0.1, unshielded 3.1.0, dust 4.1.0. Old gen (facade 3.0.0 etc.) also works but current gen is recommended. Upstream example-counter is stale (still on old gen).
15. **compact-js 2.5.3 Uninstallable:** compact-js 2.5.3 depends on @midnight-ntwrk/ledger-v9 which is NOT published to npm. Pin compact-js to 2.5.1 (uses ledger-v8, the current public generation).
16. **InMemoryTransactionHistoryStorage Removed:** unshielded-wallet 3.1.0 removed this class. Facade's txHistoryStorage field is OPTIONAL (not in DefaultConfiguration type). Just remove the import and the config line. Construction works with plain`UnshieldedWallet(cfg).startWithPublicKey(...)`.
17. **Sync Was NEVER Stuck:** The 'hang' at 'Syncing with network' was silent full-chain sync of ~1,358,236 records from preprod genesis. Every previous run was Ctrl+C'd after ~1 minute. At ~84 records/sec, full sync takes 4-5 hours. The '1000:: Normal Closure' RPC messages are noise (polkadot.js subscription closed by server; does not affect indexer-based sync).
18. **No Sync-From-Index Option:** Grep of shielded/dust/indexer-client d.ts found no startIndex/fromIndex/minIndex/sinceIndex parameter. The new SDK does not support starting sync from a later block.
19. **Progress Logging in api.ts:** After`wallet.start()`, subscriptions to shielded/unshielded/dust state observables print progress with BigInt-safe serializer, throttled to every 20th emission. Remove or gate behind a flag before final commit.
20. **smoldot Override:** The root package.json had`overrides: { smoldot: npm:@aspect-build/empty@0.0.0 }` from the create-mn-app scaffold. smoldot is only used by polkadot.js light-client (ScProvider), NOT WsProvider. Stubbing is harmless. Override was removed in Session 9 but can be reinstated if install issues arise.
21. **Root Deps Stripped:** All @midnight-ntwrk dependencies moved from root package.json to deploy-cli/package.json. Root deps are now empty. This eliminates phantom resolution and makes deploy-cli self-contained.

## Tech Stack
- Node.js v24.18.1 LTS (nvm, .nvmrc=24)
- TypeScript runner: tsx v4.23.1
- Web: Astro + Tailwind CSS (packages/web)
- PDF: jspdf dynamic server-side
- Contracts: Compact language, compactc v0.31.1, language v0.23.0
- Contract runtime: @midnight-ntwrk/compact-runtime@0.16.0
- Testing: Vitest with on-chain simulator
- Deployment: Custom deploy-cli package (tsx-based, self-contained deps)
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
- package.json - Self-contained deps (wallet SDK 4.x gen, midnight-js 4.1.1, tsx)
- src/config.ts - PreprodConfig, PreviewConfig network settings
- src/common-types.ts - AgeVerificationCircuits, AgeVerificationProviders types
- src/logger-utils.ts - Pino logger
- src/api.ts - Wallet creation, faucet funding, DUST, deploy, join, verifyAge. HAS PROGRESS LOGGING INJECTED (lines ~469-482).
- src/cli.ts - Interactive CLI (wallet menu, deploy/join menu, verify actions)
- src/preprod.ts, src/preview.ts - Entry points
- proof-server.yml - Docker compose for proof server

### Root Files
- .secrets (gitignored, chmod 600) - Wallet seeds
- .nvmrc - Node 24
- package.json - Monorepo (workspaces, deps STRIPPED to empty, overrides removed)
- pnpm-workspace.yaml, vercel.json

### Reference Projects (/Workspace/apecsdev/)
- midnight-counter-official/ - Official example-counter (STALE: still on old SDK gen, 5 dependabot commits ahead)
- midnight-counter-reference/ - Preprod deployment setup (counter-cli with old wallet SDK)

## Wallet Info
- Preprod seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
- Preprod address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- Faucet: https://faucet.preprod.midnight.network/
- Machine: 32GB RAM, ~14GB available. Node default heap 4GB is insufficient for full sync.

## Brand Guidelines
- Name: 'Opalite Love' (Title Case, no dot)
- Tagline: Swipe right, reveal later.
- Colors: Opalite gemstone (navy/black, milky blue, lavender, white, rose pink)
- Font web: sans-serif. Font PDF: Poppins Bold + Lato Regular
