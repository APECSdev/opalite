# AGENTS - Opalite

## CRITICAL RULE
**ON EVERY NEW SESSION, READ`docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Overview
- **Project:** Opalite - Privacy-First Social Network on Midnight
- **Tagline:** Your social life, shielded.
- **Direction:** Private social network with zero-knowledge age-gated communities. (Formerly "Opalite Love", a privacy-preserving dating app. Pivoted 2026-07-31.)
- **Repo:** https://github.com/APECSdev/opalite (renamed from opalite-love)
- **Local dir:** /Workspace/apecsdev/opalite
- **Domain:** opalite.social (registered, canonical). Legacy: opalite.love.
- **Hackathon:** Rise In - New Moon to Full: Monthly Moonshots on Midnight
- **Current Level:** Level 1 - New Moon. Contract written/compiled/tested (3 tests pass). Deploying via LOCAL CLI (1AM wallet approach FAILED — see issue 47). Local wallet sync resuming (dust at 14%).
- **DEADLINE:** Level 1 submission delayed due to sync time. Will submit when dust sync completes.

## Solved Issues (DO NOT RE-DIAGNOSE)
1. Terminal Paste Munging: Use`python3 << 'PYEOF'` to write files. Heredocs get corrupted by terminal paste.
2. Astro Layout: Strip ALL original html/head/body/footer tags when using Base.astro.
3. Tailwind Global Import: Base.astro must import`../styles/global.css`.
4. Compact Syntax (v0.23.0): No contract block wrapper. Top-level: pragma, import, export ledger, export circuit.
5. Compact Compile:`compact compile src/age_verification.compact src/managed/age_verification`.
6. Midnight Deps: compact-runtime@0.16.0, midnight-js@4.1.1, vitest@^4.1.0, typescript@^6.0.2.
7. CompactSimulator: Copy reference simulator, use sed to rename.
8. Node Version: Node 24.18.1 LTS via nvm.`.nvmrc` specifies 24.
9. TypeScript Runner: Use`npx tsx <file.ts>`.
10. Stale Template Cleanup: Removed old leaderboard packages.
11. Build Scripts: Run`pnpm approve-builds`, press 'a' then Enter.
12. Wallet Seeds: Stored in`.secrets` (chmod 600, gitignored).
13. Deploy CLI Imports: api.ts imports from`../../packages/contracts/src/managed/age_verification/contract/index.js`.
14. Wallet SDK Generation Upgrade: facade 4.0.1, shielded 3.0.1, unshielded 3.1.0, dust 4.1.0.
15. compact-js 2.5.3 Uninstallable: Pin to 2.5.1 (uses ledger-v8).
16. InMemoryTransactionHistoryStorage: Moved to wallet-sdk-abstractions@2.1.0.
17. Sync Was NEVER Stuck: Silent full-chain sync of ~1,359,000 records from preprod genesis. Takes hours.
18. No Sync-From-Index Option: Grep found no startIndex/fromIndex parameter.
19. Progress Logging: BigInt-safe serializer, throttled to every 20th emission.
20. smoldot Override: Removed from root package.json.
21. Root Deps Stripped: All @midnight-ntwrk deps moved to deploy-cli.
22. midnightDbName: LevelDB named 'opalite-preprod-wallet' in config.ts.
23. levelPrivateStateProvider: Persists contract private state + signing keys, NOT sync state.
24. Sync OOM Pattern: 4GB→OOM at 3.3%, 10GB→OOM at 64-73%. Memory is transient sync garbage.
25. README Updated: Badges, banner, setup guide. Narrative rebrand pending.
26. Faucet Official: https://faucet.preprod.midnight.network/ - intermittent errors.
27. Faucet Nethermind (USE THIS): https://midnight-tmnight-preprod.nethermind.dev/ - reliable. Delivered 1000 tNight.
28. PERSISTENCE IMPLEMENTED AND PROVEN:`deploy-cli/src/persistence.ts` uses serializeState()/restore(). Checkpoints every 60s. WALLET_FRESH=1 escape hatch. PROVEN across runs.
29. Raw Wallet State NOT JSON-serializable: Use serializeState() always.
30. txHistoryStorage Required: Via InMemoryTransactionHistoryStorage from abstractions@2.1.0.
31. Chain is Live: highestRelevantWalletIndex grows ~5-10 records/min.
32. Dust Wallet Slow Sync: ~15-21 records/sec. Must scan full ~1.36M chain. Checkpointed, survives crashes.
33. SIGINT Handler Swallowed: clack spinner intercepts SIGINT. Persistence MUST be periodic, not on-exit.
34. REBRAND (2026-07-31): Opalite Love → Opalite. Repo renamed. Domain opalite.social. Tagline "Your social life, shielded."
35. Indexer has NO direct tx-by-hash lookup: transactions query uses offset pagination.
36. 1AM WALLET CONCEPT: The 1AM wallet (Chrome extension) + ProofStation sponsors ALL transaction fees. Zero dust, zero NIGHT required.`balanceUnsealedTransaction(hex)` routes to ProofStation. SEEMED like the path to deploy without syncing local dust wallet. HOWEVER — SEE ISSUE 47.
37. midnight-agent-skills installed: 5 skills in`skills/` (gitignored). midnight-sdk-guide has 1AM wallet integration info.
38. Local dir renamed: /Workspace/apecsdev/opalite-love → /Workspace/apecsdev/opalite. persistence.ts path fixed with sed (opalite-love → opalite).
39. contracts.astro page exists:`packages/web/src/pages/contracts.astro` (UI for 1AM wallet integration — NOW UNUSED but kept for reference). Local CLI deploy does not use the web page.
40. ZK keys + compiled contract copied to web app:`packages/web/public/contract/compiled/age_verification/` +`packages/web/src/contracts/age_verification.contract.js`.
41. compact-js v2.5.1 API: Exports CompiledContract, ContractExecutable, ProvableCircuitId, VerifierKey, ZKIR, getProvableCircuitIds. Does NOT use make/pipe (contracts.astro had wrong API — now moot since we're using local CLI).
42. midnight-js-contracts exports: deployContract, submitCallTx, createUnprovenDeployTx, findDeployedContract, getPublicStates, etc.
43. 1AM wallet API: window.midnight['1am'].connect('preprod') works. getConfiguration() works. BUT getShieldedAddresses() fails during sync with "Wallet is syncing — open 1AM and wait for sync to finish".
44. buildProviders code from 1AM docs: Captured exact wiring (FetchZkConfigProvider, indexerPublicDataProvider, proofProvider, walletProvider, midnightProvider). Uses @midnight-ntwrk/ledger-v8 for CostModel + Transaction.deserialize. NOW MOOT — see issue 47.
45. THREE DEPLOYMENT OPTIONS explored: (1) build.1am.xyz — NO-GO (issue 48). (2) zkmint.1am.xyz — not suitable (issue 49). (3) 1AM wallet extension — FAILED (issue 47). ALL THREE FAILED. Pivoted to local CLI (issue 50).
46. zkmint source at github.com/webisoftSoftware/zk-mint — reference only, not needed.
47. **1AM WALLET SYNC FAILED — SERVER-SIDE INDEXER BUG**: The 1AM wallet's sync has a fatal error: "values inserted non-linearly into zswap commitment tree; expected to insert index 17032, but received 17031." This error occurs in`replayEventsWithChanges → applyUpdate` in the Midnight ledger WASM. It persists even after: (a) clearing ALL extension storage (IndexedDB, LocalStorage, Service Worker, Cache, Extension State), (b) killing Chromium, (c) creating a BRAND NEW wallet with a different seed. The error is in the 1AM INDEXER (api-preprod.1am.xyz) sending events out of order, NOT in local state. The wallet gets stuck at 99% in an infinite error loop. **1AM WALLET APPROACH ABANDONED.** The 1AM wallet window.midnight['1am'].connect('preprod') DOES connect successfully, getConfiguration() DOES return correct preprod endpoints, but getShieldedAddresses() is gated behind sync completion, and sync NEVER completes due to the server-side bug.
48. **build.1am.xyz IS A NO-GO**: It's just an AI prompt tool ("Write Compact contracts, generate frontends, compile and deploy - all with AI"). Requires Google sign-in (unacceptable). Cannot deploy custom pre-compiled contracts. Only generates from templates/prompt. Templates: Counter, Token, voting, Escrow, DAO, Privacy mixer. Not suitable for our use case.
49. **zkmint.1am.xyz NOT SUITABLE**: A meme coin launchpad + Night-ID (.night names) registrar. Not a general-purpose contract deployer. Source at github.com/webisoftSoftware/zk-mint could be studied for 1AM integration patterns but is NOT needed since we pivoted to local CLI.
50. **PIVOTED BACK TO LOCAL DEPLOY CLI**: The local wallet (deploy-cli) has shielded + unshielded sync COMPLETE. Only dust sync is at 14% (appliedIndex 190,866, checkpointed). Resuming sync to complete dust, then deploy via local CLI + Docker proof server. This is the ONLY viable path. Sync takes ~20-22 hours at ~15-21 records/sec for ~1.36M records. The 1000 tNight faucet funding will be found once dust sync reaches the faucet tx block.

## Tech Stack
- Node.js v24.18.1 LTS (nvm, .nvmrc=24)
- TypeScript runner: tsx v4.23.1
- Web: Astro + Tailwind CSS via @tailwindcss/vite (packages/web)
- Contracts: Compact language, compactc v0.31.1, language v0.23.0
- Contract runtime: @midnight-ntwrk/compact-runtime@0.16.0
- compact-js: @midnight-ntwrk/compact-js@2.5.1
- Testing: Vitest with on-chain simulator (3 tests passing)
- Deployment CLI: deploy-cli package (tsx-based, self-contained deps, wallet persistence)
- Proof server: Docker midnightntwrk/proof-server:8.0.3 port 6300 (needed for deploy/call, NOT for sync)
- Package manager: pnpm v10.7.0 with workspaces

## Key Directories
### Web (packages/web/)
- src/pages/index.astro, whitepaper.astro, contracts.astro, whitepaper.pdf.ts
- src/layouts/Base.astro, src/components/Nav.astro
- src/contracts/age_verification.contract.js (compiled contract module copy)
- public/contract/compiled/age_verification/ (keys + zkir)
- astro.config.mjs (wasm + topLevelAwait plugins for 1AM integration — now unused)

### Contracts (packages/contracts/)
- src/age_verification.compact — Compact contract (ledger: verifiedCount Counter, circuit: verifyAge)
- src/managed/age_verification/contract/index.js — compiled contract module
- src/managed/age_verification/keys/ — ZK keys (verifyAge.prover, verifyAge.verifier)
- src/managed/age_verification/zkir/ — ZK IR
- src/test/ — Simulator and test suite (3 tests passing)

### Deploy CLI (deploy-cli/)
- package.json — Self-contained deps (wallet SDK 4.x, midnight-js 4.1.1, tsx)
- src/config.ts, src/common-types.ts, src/logger-utils.ts, src/persistence.ts, src/api.ts, src/cli.ts
- proof-server.yml — Docker compose for proof server
- wallet-state.json — gitignored persisted wallet state (DO NOT COMMIT, DO NOT DELETE). Last checkpoint: dust appliedIndex 190,866.

### Root Files
- .secrets (gitignored, chmod 600) — Wallet seeds
- .nvmrc -- Node 24
- package.json -- Monorepo (name still "opalite-love", cosmetic)
- .gitignore -- includes`skills/`
- README.md -- Enhanced (narrative rebrand pending)
- AGENTS.md, docs/HANDOFF.md -- Session context
- skills/ -- midnight-agent-skills (gitignored, 5 skills, reference only)

## Wallet Info
- Preprod seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
- Preprod address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- Funding: 1000 tNight sent via Nethermind faucet (tx 00bc56d9...654fed). Will be found when dust sync reaches that block.
- Local sync status: shielded DONE, unshielded DONE, dust at appliedIndex 190,866 (~14%). RESUMING.
- 1AM wallet: ABANDONED (server-side indexer bug — see issue 47)
- Faucet (Nethermind): https://midnight-tmnight-preprod.nethermind.dev/

## Persistence Architecture (IMPLEMENTED + PROVEN)
-`deploy-cli/src/persistence.ts` -- serializeState()/restore() for wallet state.
- SAVE: every 60s, atomic write to`deploy-cli/wallet-state.json`.
- LOAD: on boot, swap factory functions to`.restore(saved)`.
-`WALLET_FRESH=1` env var ignores saved state.
- Path fix applied: sed replaced "opalite-love" → "opalite" in persistence.ts.

## Brand Guidelines
- Name: "Opalite" (was "Opalite Love")
- Tagline: "Your social life, shielded." (was "Swipe right, reveal later.")
- Domain: opalite.social (canonical), opalite.love (legacy/redirect)
- Direction: Privacy-first social network with zero-knowledge age-gated communities
- Colors: Opalite gemstone palette (navy/black, milky blue, lavender, white, rose pink)
- Font web: sans-serif. Font PDF: Poppins Bold + Lato Regular

## Network Endpoints (Preprod)
- Indexer HTTP: https://indexer.preprod.midnight.network/api/v4/graphql
- Indexer WS: wss://indexer.preprod.midnight.network/api/v4/graphql/ws
- Node RPC: wss://rpc.preprod.midnight.network
- 1AM ProofStation: https://api-preprod.1am.xyz (ABANDONED — server-side bug)
- Faucet (Nethermind): https://midnight-tmnight-preprod.nethermind.dev/
- Faucet (Official): https://faucet.preprod.midnight.network/ (intermittent)

## Dependency Versions (deploy-cli/package.json)
@midnight-ntwrk/compact-js: 2.5.1, compact-runtime: 0.16.0, ledger-v8: 8.1.0, midnight-js: 4.1.1, wallet-sdk-facade: 4.0.1, shielded: 3.0.1, unshielded: 3.1.0, dust: 4.1.0, hd: 3.0.2, address-format: 3.1.2, abstractions: 2.1.0, proof-server: midnightntwrk/proof-server:8.0.3, tsx: 4.23.1, Node: v24.18.1, pnpm: 10.7.0

## 1AM Wallet Investigation Results (FOR REFERENCE — ABANDONED)
- 1AM Chrome extension ID: bphnkdkcnfhompoegfpgnkidcjfbojjp
- window.midnight['1am'] exists with connect() function, apiVersion 4.0.0
- connect('preprod') works, returns connectedAPI with methods: getShieldedBalances, getUnshieldedBalances, getDustBalance, getShieldedAddresses, getUnshieldedAddress, getDustAddress, getTxHistory, balanceUnsealedTransaction, balanceSealedTransaction, makeTransfer, makeIntent, signData, submitTransaction, getProvingProvider, getConfiguration, getConnectionStatus, decryptTransactionOutputs, hintUsage
- getConfiguration() returns: { networkId: "preprod", indexerUri: "https://indexer.preprod.midnight.network/api/v4/graphql", indexerWsUri: "wss://indexer.preprod.midnight.network/api/v4/graphql/ws", proverServerUri: "https://api-preprod.1am.xyz", substrateNodeUri: "wss://rpc.preprod.midnight.network" }
- getConnectionStatus() returns: { status: "connected", networkId: "preprod" }
- getShieldedAddresses() FAILS with "Wallet is syncing — open 1AM and wait for sync to finish"
- ALL wallet methods are gated behind sync completion
- Sync NEVER completes due to server-side indexer bug (zswap commitment tree corruption)
- Bug: "values inserted non-linearly into zswap commitment tree; expected to insert index 17032, but received 17031" in replayEventsWithChanges → applyUpdate
- Bug persists after full storage wipe + new wallet → server-side issue in 1AM indexer
- contracts.astro on opalite.social/contracts has UI + retry loop for getShieldedAddresses (60 attempts × 15s) — will never succeed due to server-side bug
- buildProviders code from 1AM docs captured in HANDOFF.md for historical reference
