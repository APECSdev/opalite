# AGENTS - Opalite

## CRITICAL RULE
**ON EVERY NEW SESSION, READ`docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**


## CRITICAL CLI DOCUMENTATION (Session 12 post-mortem)

### How to start the deploy CLI (INTERACTIVE — no subcommands)

The CLI is a MENU-based interactive program, NOT a subcommand CLI.
There is NO`sync` command. Sync happens automatically after wallet restore.

**Start command:**
```bash
cd /Workspace/apecsdev/opalite/deploy-cli
npx tsx src/preprod.ts # OR: pnpm preprod
```

**Menu flow to resume sync:**
1. Choose`[2] Restore wallet from seed`
2. Paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
3. Sync resumes automatically from`wallet-state.json` checkpoint

**Wallet menu options:**
- [1] Create a new wallet  (DO NOT USE — would discard sync progress)
- [2] Restore wallet from seed  (USE THIS — loads checkpoint, resumes sync)
- [3] Exit

**Contract menu (after sync completes):**
- [1] Deploy a new age verification contract
- [2] Join an existing age verification contract
- [3] Monitor DUST balance
- [4] Exit

**Age verification menu (after deploy):**
- [1] Verify age (increment counter)
- [2] Display current verified count
- [3] Exit

### How to monitor sync (Terminal 2)

The`wallet-state.json` structure is NOT reliably documented (top-level keys
unknown —`dustWalletState` key returned None in session 12). Use file
size/mtime growth as the sync-progress indicator instead:

```bash
watch -n 10 'ls -la /Workspace/apecsdev/opalite/deploy-cli/wallet-state.json && stat -c "mtime: %y" /Workspace/apecsdev/opalite/deploy-cli/wallet-state.json'
```

Checkpoint saves every 60s while sync is running. If mtime/size grows, sync
is progressing.

### npm scripts (deploy-cli/package.json)

-`preprod`  ->`tsx src/preprod.ts`  (preprod network entry point)
-`preview`  ->`tsx src/preview.ts` (preview network entry point)

### Key files (deploy-cli/src/)

-`preprod.ts`        — entry point, calls cli.run()
-`preview.ts`        — preview entry point
-`cli.ts`            — interactive menu (exports run())
-`api.ts`            — wallet build, sync, deploy, call logic
-`persistence.ts`    — serializeState()/restore() for wallet checkpoints
-`config.ts`         — network endpoints, midnightDbName
-`common-types.ts`   — type definitions
-`logger-utils.ts`   — pino logger setup


### RELIABLE SYNC MONITOR (verified approach, Session 12)

Do NOT parse wallet-state.json for progress — its internal structure is
unknown (top-level keys version/savedAt/shielded/unshielded/dust, with each
field being stringified JSON; appliedIndex was NOT found in the dust field
by recursive search — the serialized state stores progress differently).

Instead, capture Terminal 1's stdout, which prints lines in a KNOWN format:
    dust {"appliedIndex":"131738","highestRelevantWalletIndex":"1362820",...}

Terminal 1 (log to file via tee):
    cd /Workspace/apecsdev/opalite/deploy-cli
    NODE_OPTIONS="--max-old-space-size=10240" npx tsx src/preprod.ts 2>&1 | tee /tmp/opalite-sync.log

Terminal 2 (parse the log):
    PREV_A=0
    while true; do
      clear
      echo "=== $(date) ==="
      LINE=$(grep -o 'dust {"appliedIndex":"[0-9]*","highestRelevantWalletIndex":"[0-9]*"' /tmp/opalite-sync.log | tail -1)
      A=$(echo "$LINE" | grep -oP '"appliedIndex":"\K[0-9]+')
      T=$(echo "$LINE" | grep -oP '"highestRelevantWalletIndex":"\K[0-9]+')
      if [ -n "$A" ] && [ -n "$T" ]; then
        REMAIN=$((T - A))
        PCT=$(awk "BEGIN{printf \"%.2f\", $A/$T*100}")
        if [ "$PREV_A" -gt 0 ] && [ "$A" -gt "$PREV_A" ]; then
          RATE=$(( (A - PREV_A) / 10 ))
          [ "$RATE" -gt 0 ] && echo "Rate: ~${RATE} blocks/sec | ETA: ~$(awk "BEGIN{printf \"%.1f\", $REMAIN/$RATE/3600}") hours"
        fi
        PREV_A=$A
        echo "Blocks indexed:  $A"
        echo "Total blocks:    $T"
        echo "Remaining:       $REMAIN"
        echo "Progress: ${PCT}%"
      else
        echo "No sync lines in log yet."
      fi
      ps aux | grep 'tsx.*preprod' | grep -v grep > /dev/null && echo "Status: RUNNING" || echo "Status: *** NOT RUNNING ***"
      sleep 10
    done

Note: total (~1,362,820) can also grow slightly as the chain produces new blocks.

### Lesson learned

The previous AGENTS/HANDOFF said "npx tsx src/cli.ts sync" — that was WRONG.
`cli.ts` only exports`run()`; it has no subcommands. The actual entry point
is`preprod.ts` which calls`cli.run(config, logger)`. Always verify entry
points against package.json scripts before documenting commands.

## Project Overview
- **Project:** Opalite - Privacy-First Social Network on Midnight
- **Tagline:** Your social life, shielded.
- **Direction:** Private social network with zero-knowledge age-gated communities. (Formerly "Opalite Love", a privacy-preserving dating app. Pivoted 2026-07-31.)
- **Repo:** https://github.com/APECSdev/opalite (renamed from opalite-love)
- **Local dir:** /Workspace/apecsdev/opalite
- **Domain:** opalite.social (registered, canonical). Legacy: opalite.love.
- **Hackathon:** Rise In - New Moon to Full: Monthly Moonshots on Midnight
- **Current Level:** Level 1 - New Moon. Contract DEPLOYED to preprod. 2 age verifications confirmed on-chain. Submission attempted — Rise In shows "Program is complete, cannot make changes." Contacting Rise In team directly for org repo submission guidance.
- **DEADLINE:** Level 1 submission BLOCKED by Rise In platform. Fork created (nyusternie/opalite) as workaround but same error. Contacting Rise In team. Repo is public, screenshots live, contract verified.

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
25. README Updated: Full rebrand complete (Opalite Love -> Opalite, social network narrative, badges, clone URLs). cli.ts BANNER updated.
26. Faucet Official: https://faucet.preprod.midnight.network/ - intermittent errors.
27. Faucet Nethermind (USE THIS): https://midnight-tmnight-preprod.nethermind.dev/ - reliable. Delivered 1000 tNight.
28. PERSISTENCE IMPLEMENTED AND PROVEN:`deploy-cli/src/persistence.ts` uses serializeState()/restore(). Checkpoints every 60s. WALLET_FRESH=1 escape hatch. PROVEN across runs.
29. Raw Wallet State NOT JSON-serializable: Use serializeState() always.
30. txHistoryStorage Required: Via InMemoryTransactionHistoryStorage from abstractions@2.1.0.
31. Chain is Live: highestRelevantWalletIndex grows ~5-10 records/min.
32. Dust Wallet Slow Sync: ~15-21 records/sec. Must scan full ~1.36M chain. Checkpointed, survives crashes.
33. SIGINT Handler Swallowed: clack spinner intercepts SIGINT. Persistence MUST be periodic, not on-exit.
34. REBRAND (2026-07-31): Opalite Love → Opalite. Repo renamed. Domain opalite.social. Tagline "Your social life, shielded." README + cli.ts BANNER rebranded (Session 13).
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
50. **LOCAL DEPLOY CLI — SUCCESS**: Dust sync completed. Contract deployed to preprod via local CLI + Docker proof server. Contract address: 7842c12a360192c4505a002cf54a26904d7791589244a8161fb22d34c40a4199. Two age verifications confirmed on-chain (blocks 1917094, 1917099). Verified count: 2.

51. **DEPLOYMENT COMPLETE (Session 13)**: Contract deployed to preprod. Address: 7842c12a360192c4505a002cf54a26904d7791589244a8161fb22d34c40a4199. Two verifyAge() calls confirmed on-chain (blocks 1917094, 1917099). Verified count: 2. Proof server (Docker, port 6300) used for deploy + call. README + cli.ts rebranded (Opalite Love -> Opalite).
52. **SUBMISSION — RISE IN BLOCKED (Session 14)**: Rise In platform shows "Program is complete — cannot make changes" error. Created fork nyusternie/opalite as workaround — same error. Rise In OAuth app only requests "Access public information" scope (no read:org), so org repos (APECSdev/opalite) don't appear in the submission dropdown. Org had "Access restricted" policy — removed restrictions, revoked + re-authorized Rise In OAuth — still no org repos visible. Will contact Rise In team directly for guidance on submitting from a GitHub organization. Repo is public, 49 commits, contract deployed + verified, screenshots live, README complete.
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
- wallet-state.json — gitignored persisted wallet state (DO NOT COMMIT, DO NOT DELETE). Sync COMPLETE. Contains deployed contract private state.

### Root Files
- .secrets (gitignored, chmod 600) — Wallet seeds
- .nvmrc -- Node 24
- package.json -- Monorepo (name still "opalite-love", cosmetic)
- .gitignore -- includes`skills/`
- README.md -- Full rebrand complete (Opalite, social network)
- AGENTS.md, docs/HANDOFF.md -- Session context
- skills/ -- midnight-agent-skills (gitignored, 5 skills, reference only)

## Wallet Info
- Preprod seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
- Preprod address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- Funding: 1000 tNight sent via Nethermind faucet (tx 00bc56d9...654fed). Found and used for deployment.
- **CONTRACT DEPLOYED:** Address 7842c12a360192c4505a002cf54a26904d7791589244a8161fb22d34c40a4199
- **Verify tx 1:** 003b2f9fd149154f3e555607df20c0482c7ecf4140d29ea0ad3951749218c7e231 (block 1917094)
- **Verify tx 2:** 00806c785a67a6ff79251a9f48c655d99c513ebebe1154a8bde5266d2ac2e6c763 (block 1917099)
- **Verified count:** 2
- Local sync status: ALL COMPLETE (shielded, unshielded, dust). Contract deployed + 2 verifications.
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
