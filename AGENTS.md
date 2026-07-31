# AGENTS - Opalite Love

## CRITICAL RULE
**ON EVERY NEW SESSION, READ `docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite Love - Privacy-Preserving Dating on Midnight Network
- **Repo:** `/Workspace/apecsdev/opalite`
- **GitHub:** https://github.com/APECSdev/opalite-love (currently PRIVATE, goes public after deployment)
- **Live URL:** https://opalite.love
- **Hackathon:** Rise In - New Moon to Full: Monthly Moonshots on Midnight
- **Current Level:** Level 1 - New Moon (deployment is the only remaining step after dust sync)

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **Terminal Paste Munging:** Use `python3 << 'PYEOF'` to write files. Heredocs get corrupted.
2. **Astro Layout Conflicts:** Strip ALL original html/head/body/footer tags when using Base.astro.
3. **Tailwind Global Import:** Base.astro must import `../styles/global.css`.
4. **Compact Syntax (v0.23.0):** No contract block wrapper. Top-level: pragma, import, export ledger, export circuit. `let` is reserved but unimplemented. Types Z/Bool/Natural/Bit/number/Int are NOT valid. Counter from CompactStandardLibrary works.
5. **Compact Compile:** `compact compile <source> <target>` e.g. `compact compile src/age_verification.compact src/managed/age_verification`.
6. **Midnight Deps:** compact-runtime@0.16.0, midnight-js@4.1.1, midnight-js-network-id@4.1.1, vitest@^4.1.0, typescript@^6.0.2.
7. **CompactSimulator:** Copy reference simulator, use sed to rename. Circuit calls via `this.contract.impureCircuits.<name>(this.circuitContext).context`.
8. **Node Version:** Node 24.18.1 LTS via nvm. `.nvmrc` specifies 24.
9. **TypeScript Runner:** Use `npx tsx <file.ts>`. Do NOT use ts-node/esm.
10. **Stale Template Cleanup:** Removed old leaderboard packages. Root package.json renamed to opalite-love.
11. **Build Scripts:** Run `pnpm approve-builds`, press 'a' then Enter for classic-level, core-js, esbuild, msgpackr-extract.
12. **Wallet Seeds:** Stored in `.secrets` (chmod 600, gitignored). Never commit.
13. **Deploy CLI Imports:** api.ts imports from `../../packages/contracts/src/managed/age_verification/contract/index.js` (relative from deploy-cli/src/).
14. **Wallet SDK Generation Upgrade:** facade 4.0.1, shielded 3.0.1, unshielded 3.1.0, dust 4.1.0. Upstream example-counter is stale (still on old gen).
15. **compact-js 2.5.3 Uninstallable:** Depends on unpublished @midnight-ntwrk/ledger-v9. Pin compact-js to 2.5.1 (uses ledger-v8).
16. **InMemoryTransactionHistoryStorage Removed from unshielded-wallet:** Moved to `@midnight-ntwrk/wallet-sdk-abstractions@2.1.0`. Re-added to facade config via `new InMemoryTransactionHistoryStorage(WalletEntrySchema, mergeWalletEntries)`.
17. **Sync Was NEVER Stuck:** Silent full-chain sync of ~1,359,000 records from preprod genesis. Takes hours. '1000:: Normal Closure' RPC messages are noise.
18. **No Sync-From-Index Option:** Grep of shielded/dust/indexer-client d.ts found no startIndex/fromIndex/minIndex parameter.
19. **Progress Logging in api.ts:** After `wallet.start()`, subscriptions print progress with BigInt-safe serializer, throttled to every 20th emission.
20. **smoldot Override:** Removed from root package.json. Was harmless anyway.
21. **Root Deps Stripped:** All @midnight-ntwrk dependencies moved from root to deploy-cli/package.json.
22. **midnightDbName Added:** LevelDB database named 'opalite-love-preprod-wallet' in config.ts and wired into levelPrivateStateProvider in api.ts. Persists contract private state + signing keys (NOT sync state).
23. **levelPrivateStateProvider Limitation:** Only persists contract private state and signing keys, NOT sync state. Sync restarts from 0 every run UNLESS you use the persistence layer (issue #28).
24. **Sync OOM Pattern:** 4GB heap -> OOM at 3.3%. 10GB heap -> OOM at 64-73%. Memory growth is mostly transient sync garbage, NOT live state (checkpoint files stayed 172-306KB). Crash-resume loop via persistence solves this.
25. **README Updated:** Has favicon, OG banner, Codecov badge, tech badges, project structure table, getting started guide, age verification contract section.
26. **Faucet - Official:** https://faucet.preprod.midnight.network/ - intermittent 'Transaction submission error'.
27. **Faucet - Alternate (USE THIS):** https://midnight-tmnight-preprod.nethermind.dev/ - Nethermind-hosted, reliable. Delivered 1000 tNight successfully (tx 00bc56d9...654fed) on 2026-07-31.
28. **PERSISTENCE IMPLEMENTED AND PROVEN:** `deploy-cli/src/persistence.ts` uses SDK-native `serializeState()` + `Class.restore(serialized)`. Checkpoints every 60s to `deploy-cli/wallet-state.json` (gitignored, atomic tmp+rename). On boot, api.ts loads saved state and swaps factory functions to `.restore(saved)` instead of `.startWithSeed()`. `WALLET_FRESH=1` env escape hatch forces fresh sync. PROVEN: restore resumed shielded from appliedIndex 994,424 after OOM. Checkpoint = 172-306KB (live state tiny).
29. **Raw Wallet State is NOT JSON-serializable:** shielded core state is a WASM pointer (`__wbg_ptr`), unshielded uses Immutable.js structures. NEVER JSON.stringify the raw state. ALWAYS use `serializeState()` which handles WASM/Immutable encoding to a string.
30. **txHistoryStorage Required for Facade Serialize/Restore:** Re-added via `InMemoryTransactionHistoryStorage` from `@midnight-ntwrk/wallet-sdk-abstractions@2.1.0`. Adaptive factory in persistence.ts: tries `.create()` then constructor; constructor form works on this version.
31. **Chain is Live:** highestRelevantWalletIndex grows ~5-10 records/min. ~1,358,359 at Session 9 start -> ~1,359,737 by Session 10 end.
32. **Dust Wallet is the Slow Sync:** ~8-21 records/sec (slower while shielded competes for CPU, faster once shielded done). Must scan full ~1.36M chain. Checkpointed, so survives crashes/reboots via the resume loop. Shielded and unshielded both complete in one 10GB cycle from a fresh start or restore; dust takes many hours.
33. **SIGINT Handler Swallowed by CLI Framework:** clack spinner intercepts SIGINT and exits before custom handlers run. Persistence MUST be periodic (interval-based), not on-exit. The 60s timer in persistence.ts is `unref()`d so it won't hold the process open.

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
- package.json - Self-contained deps (wallet SDK 4.x gen, midnight-js 4.1.1, tsx, abstractions 2.1.0)
- src/config.ts - PreprodConfig, PreviewConfig, contractConfig (with midnightDbName)
- src/common-types.ts - AgeVerificationCircuits, AgeVerificationProviders types
- src/logger-utils.ts - Pino logger
- src/persistence.ts - **NEW** Wallet state checkpoint/restore (serializeState/restore, 60s timer, txHistoryStorage factory)
- src/api.ts - Wallet creation, faucet funding, DUST, deploy, join, verifyAge. Has progress logging + persistence wired in.
- src/cli.ts - Interactive CLI (wallet menu, deploy/join menu, verify actions)
- src/preprod.ts, src/preview.ts - Entry points
- proof-server.yml - Docker compose for proof server
- wallet-state.json - **gitignored** persisted wallet state (DO NOT COMMIT, DO NOT DELETE)

### Root Files
- .secrets (gitignored, chmod 600) - Wallet seeds
- .nvmrc - Node 24
- package.json - Monorepo (workspaces, deps STRIPPED to empty)
- pnpm-workspace.yaml, vercel.json
- README.md - Enhanced with badges, banner, setup guide
- LICENSE - MIT
- AGENTS.md, docs/HANDOFF.md, docs/PERSISTENCE.md - Session context

## Wallet Info
- Preprod seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
- Preprod address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- **Funding status: 1000 tNight sent via Nethermind faucet (tx 00bc56d944ae087195f7cd2b6c3bde9efde21fdf0b770c8e8bd487a56213654fed) on 2026-07-31. Pending confirmation in-wallet once unshielded sync advances.**
- Faucet primary: https://faucet.preprod.midnight.network/ (intermittent errors)
- Faucet alternate (RECOMMENDED): https://midnight-tmnight-preprod.nethermind.dev/
- Machine: 31GB RAM, ~16GB available. 10GB heap (`--max-old-space-size=10240`) covers one shielded sync cycle.

## Persistence Architecture (IMPLEMENTED + PROVEN)
- `deploy-cli/src/persistence.ts` is the single source of truth for wallet state persistence.
- SAVE: every 60s, `wallet.shielded.serializeState()` + `.unshielded.serializeState()` + `.dust.serializeState()` -> atomic write to `deploy-cli/wallet-state.json`.
- LOAD: on boot, `loadSavedWalletState()` reads the file; api.ts swaps factory functions to `ShieldedWallet(cfg).restore(saved.shielded)` etc. instead of `.startWithSecretKeys(...)`.
- `WALLET_FRESH=1` env var ignores saved state and starts from genesis (escape hatch if restore misbehaves).
- Checkpoint files are 172-306KB (live wallet state is tiny; the multi-GB heap usage during sync is transient garbage that dies with the process).
- Crash-resume loop: sync -> OOM -> re-run -> restore -> resume from last checkpoint (max 60s lost). VALIDATED across runs 3->4.
- `txHistoryStorage` is constructed via `makeTxHistoryStorage()` (adaptive: `.create()` or constructor) and injected into walletConfig; required by facade for serialize/restore.

## Brand Guidelines
- Name: 'Opalite Love' (Title Case, no dot)
- Tagline: Swipe right, reveal later.
- Colors: Opalite gemstone (navy/black, milky blue, lavender, white, rose pink)
- Font web: sans-serif. Font PDF: Poppins Bold + Lato Regular
