# HANDOFF - Opalite Love (Session 9)

## STATUS: LEVEL 1 NEW MOON - ALMOST COMPLETE. ONLY DEPLOYMENT REMAINING.

Contract: written, compiled, tested, documented, committed. Deploy CLI: built, wallet constructs on current SDK gen. THE ONLY BLOCKER IS SYNC TIME: first-time shielded sync processes ~1.36M records from preprod genesis and takes 4-5 hours with a large heap.

### Level 1 Submission Checklist

| Requirement | Status |
|---|---|
| Toolchain installed | DONE |
| Contract compiles | DONE |
| Passing test suite | DONE - 3 tests pass |
| managed/ directory | DONE |
| 5 meaningful commits | DONE - 8+ commits |
| Product idea in README | DONE |
| Setup instructions | DONE |
| Public vs private witness | DONE |
| Compile screenshot | DONE |
| Deploy CLI built | DONE - self-contained, current SDK gen |
| Wallet created | DONE - seed in .secrets |
| Proof server running | DONE - Docker port 6300 |
| Wallet syncs with network | WORKS but takes 4-5 hours + big heap |
| Wallet funded from faucet | BLOCKED - need sync |
| Contract deployed | BLOCKED - need funding |
| Deploy screenshot | NOT DONE |

### What Was Accomplished (Session 9)

1. Diagnosed root package.json as holding ALL Midnight deps (phantom resolution for deploy-cli). Moved every @midnight-ntwrk dep into deploy-cli/package.json. Stripped root deps to empty.
2. Upgraded wallet SDK to current generation: facade 4.0.1, shielded 3.0.1, unshielded 3.1.0, dust 4.1.0. Upstream example-counter confirmed stale (still on old gen).
3. Discovered compact-js 2.5.3 depends on unpublished @midnight-ntwrk/ledger-v9. Pinned compact-js to 2.5.1 (ledger-v8 = current public gen). Validated by midnight-wallet-dapp repo using same pins.
4. Fixed API change: InMemoryTransactionHistoryStorage removed in unshielded 3.1.0. Facade txHistoryStorage is optional. Removed import + config line. Construction verified: wallet builds, address derives, wallet.start() executes.
5. Confirmed smoldot override was from create-mn-app scaffold (harmless, only affects polkadot light-client path). Removed override from root package.json.
6. Injected progress logging into api.ts after wallet.start(): subscribes to shielded/unshielded/dust state observables, prints progress with BigInt-safe JSON serializer, throttled to every 20th emission.
7. **CRITICAL DISCOVERY: Sync was never stuck.** Progress logging proved the wallet IS syncing: shielded appliedIndex climbed 0 -> 44,377 toward 1,358,236. isConnected: true. The 'hang' was silent progress through preprod's full transaction history. Every previous run since session 8 was Ctrl+C'd after ~1 minute.
8. Identified OOM: default 4GB heap exhausted at ~3.3% through sync (44k/1.36M records, ~9 minutes). Machine has 32GB RAM, 14GB available.
9. Confirmed NO sync-from-index option exists in the new SDK (grep of shielded/dust/indexer-client d.ts returned empty).
10. Found serialization support exists in facade BUT requires InMemoryTransactionHistoryStorage (which was removed from the package). Catch-22 to investigate.

### THE KEY FINDING: Sync Is Slow, Not Broken

Progress data from the instrumented run:

  shielded: appliedIndex 0 -> 44,377, target 1,358,236, isConnected: true
  dust:      appliedIndex 0 -> 6,871,  target 1,358,240, isConnected: true
  unshielded: appliedId 0, highestTransactionId 0 (address-based, fast)

Rate: ~84 records/sec. Full sync: ~4.5 hours. OOM at 4GB heap after 9 min / 3.3%.

The '1000:: Normal Closure' RPC-CORE messages are noise: polkadot.js subscription gets closed by the server. Does not affect indexer-based sync. Appeared in every run, old and new SDK gen.

### THREE PATHS TO UNBLOCK DEPLOYMENT

**Path A: Full sync with big heap (brute force, guaranteed)**
  NODE_OPTIONS='--max-old-space-size=20480' npx tsx src/preprod.ts
  Let it run 4-5 hours. 32GB machine, 14GB available, 20GB heap should work.
  Risk: if memory growth is superlinear, may still OOM. Watch [sync] lines.
  After sync completes ONCE: investigate serialization to avoid re-syncing.

**Path B: Relax wait condition to unshielded-only (shortcut, may work)**
  Our code waits on wallet.state().isSynced (ALL three wallets synced).
  Unshielded uses address-based queries (fast, not full-chain scan).
  Patch waitForSync to wait on unshielded only, then fund + deploy.
  Risk: DUST generation may require dust wallet sync (time-based, needs chain history).
  Test: after unshielded syncs, try generating DUST. If it works, deploy.

**Path C: Investigate serialization (fixes re-sync for future runs)**
  Facade d.ts says serialize/restore needs InMemoryTransactionHistoryStorage.
  That class was removed from unshielded-wallet 3.1.0.
  Find what replaced it: grep TransactionHistoryStorage across all @midnight-ntwrk packages.
  Maybe the V1Builder's withTransactionHistoryDefaults() creates it internally.
  If we can serialize wallet state to disk after first sync, future runs restore instantly.

### IMMEDIATE NEXT STEPS

1. Start Path A (big-heap full sync) in one terminal — let it run for hours
2. In parallel, investigate Path B (relax wait) and Path C (serialization)
3. If Path B works: fund from faucet, generate DUST, deploy, screenshot, submit
4. If Path A completes first: fund, deploy, screenshot, submit. Then implement Path C for future.
5. Remove progress logging from api.ts (or gate behind env var) before final commit
6. Commit all Session 9 changes (deploy-cli deps, api.ts patches, root cleanup)

### Pickup Commands

  # Ensure Node 24
  nvm use 24
  cd /Workspace/apecsdev/opalite-love

  # Check proof server
  docker ps --filter name=proof-server
  docker compose -f deploy-cli/proof-server.yml up -d

  # PATH A: Start full sync with 20GB heap (let run for HOURS)
  cd deploy-cli
  NODE_OPTIONS='--max-old-space-size=20480' npx tsx src/preprod.ts 2>&1 | tee /tmp/sync-full.log
  # option 2, paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
  # DO NOT Ctrl+C — minimum 2 hours, ideally let it run to completion

  # Check sync progress (in another terminal)
  tail -5 /tmp/sync-full.log

  # PATH B: Investigate relaxing wait condition
  grep -n 'isSynced\|waitForSync' src/api.ts | head -15
  # Line 504: withStatus('Syncing with network', () => waitForSync(wallet))
  # Patch waitForSync to wait on unshielded.state only, not full wallet.state

  # PATH C: Investigate serialization
  grep -rn 'TransactionHistoryStorage' deploy-cli/node_modules/@midnight-ntwrk/*/dist/index.d.ts
  grep -rn 'serialize\|restore\|snapshot' deploy-cli/node_modules/@midnight-ntwrk/wallet-sdk-facade/dist/index.d.ts

  # After sync completes (any path):
  # 1. Fund from faucet: https://faucet.preprod.midnight.network/
  #    Address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
  # 2. Generate DUST from tNight
  # 3. Deploy contract (CLI option 1)
  # 4. Screenshot contract address
  # 5. Add deployment address to README
  # 6. Commit, push, submit to hackathon

### Files Modified (Session 9, NOT YET COMMITTED)

  deploy-cli/package.json  - NEW: self-contained deps, wallet SDK 4.x gen
  package.json (root)     - deps stripped to empty, overrides removed
  deploy-cli/src/api.ts   - removed InMemoryTransactionHistoryStorage, added progress logging

### Sync Progress Field Reference

  shielded/dust state.progress:
    appliedIndex - records processed so far
    highestRelevantWalletIndex - sync target (chain tip for this wallet)
    highestIndex - always 0 in our runs (unknown meaning)
    highestRelevantIndex    - always 0 in our runs (unknown meaning)
    isConnected - true once indexer subscription established

  unshielded state.progress:
    appliedId - transactions processed
    highestTransactionId    - sync target (address-specific, not full chain)
    isConnected - connection status

### Compact Contract

  pragma language_version >= 0.20;
  import CompactStandardLibrary;
  export ledger verifiedCount: Counter;
  export circuit verifyAge(): [] {
      verifiedCount.increment(1);
  }

### Network Endpoints

  Preprod:
    indexer: https://indexer.preprod.midnight.network/api/v3/graphql
    indexerWS: wss://indexer.preprod.midnight.network/api/v3/graphql/ws
    node: https://rpc.preprod.midnight.network
    proofServer: http://127.0.0.1:6300
    faucet: https://faucet.preprod.midnight.network/

  Preview:
    indexer: https://indexer.preview.midnight.network/api/v3/graphql
    indexerWS: wss://indexer.preview.midnight.network/api/v3/graphql/ws
    node: https://rpc.preview.midnight.network
    proofServer: http://127.0.0.1:6300

### Dependency Versions (deploy-cli/package.json)

  @midnight-ntwrk/compact-js: 2.5.1
  @midnight-ntwrk/compact-runtime: 0.16.0
  @midnight-ntwrk/ledger-v8: 8.1.0
  @midnight-ntwrk/midnight-js: 4.1.1
  @midnight-ntwrk/midnight-js-contracts: 4.1.1
  @midnight-ntwrk/midnight-js-types: 4.1.1
  @midnight-ntwrk/midnight-js-utils: 4.1.1
  @midnight-ntwrk/midnight-js-protocol: 4.1.1
  @midnight-ntwrk/midnight-js-http-client-proof-provider: 4.1.1
  @midnight-ntwrk/midnight-js-indexer-public-data-provider: 4.1.1
  @midnight-ntwrk/midnight-js-level-private-state-provider: 4.1.1
  @midnight-ntwrk/midnight-js-network-id: 4.1.1
  @midnight-ntwrk/midnight-js-node-zk-config-provider: 4.1.1
  @midnight-ntwrk/wallet-sdk-facade: 4.0.1
  @midnight-ntwrk/wallet-sdk-shielded: 3.0.1
  @midnight-ntwrk/wallet-sdk-unshielded-wallet: 3.1.0
  @midnight-ntwrk/wallet-sdk-dust-wallet: 4.1.0
  @midnight-ntwrk/wallet-sdk-hd: 3.0.2
  @midnight-ntwrk/wallet-sdk-address-format: 3.1.2
  proof-server: midnightntwrk/proof-server:8.0.3
  tsx: 4.23.1
  Node.js: v24.18.1
  pnpm: 10.7.0
