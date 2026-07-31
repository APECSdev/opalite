# HANDOFF - Opalite Love (Session 9 Final)

## STATUS: LEVEL 1 NEW MOON — ALMOST COMPLETE. ONLY DEPLOYMENT REMAINING.

Contract: written, compiled, tested, documented, committed, pushed. Deploy CLI: built, wallet constructs, levelPrivateStateProvider configured. README: enhanced with badges and banner. All code pushed to GitHub.

THE ONLY BLOCKER: wallet sync OOMs before completing full chain scan. Need bigger heap (20GB+) OR persistence solution to avoid re-sync.

### Level 1 Submission Checklist

| Requirement | Status |
|---|---|
| Toolchain installed | DONE |
| Contract compiles | DONE |
| Passing test suite | DONE - 3 tests pass |
| managed/ directory | DONE |
| 5 meaningful commits | DONE - 18+ commits pushed |
| Product idea in README | DONE |
| Setup instructions | DONE |
| Public vs private witness | DONE |
| Compile screenshot | DONE |
| Deploy CLI built | DONE - self-contained, current SDK gen |
| Wallet created | DONE - seed in .secrets |
| Proof server running | DONE - Docker port 6300 |
| Wallet syncs with network | BLOCKED — OOM at 64% with 10GB heap |
| Wallet funded from faucet | BLOCKED — faucet showed error, need retry |
| Contract deployed | BLOCKED — need sync + funding |
| Deploy screenshot | NOT DONE |
| Repo made public | NOT DONE — after deployment |
| Codecov added | NOT DONE — after repo is public |

### Session 9 Summary

**Accomplished:**
1. Moved all Midnight deps from root to deploy-cli/package.json (eliminated phantom resolution)
2. Upgraded wallet SDK to current gen: facade 4.0.1, shielded 3.0.1, unshielded 3.1.0, dust 4.1.0
3. Pinned compact-js to 2.5.1 (2.5.3 needs unpublished ledger-v9)
4. Fixed InMemoryTransactionHistoryStorage removal (optional in new facade)
5. Injected progress logging into api.ts (BigInt-safe, throttled)
6. Discovered sync was NEVER stuck — silent full-chain scan of 1.36M records
7. Added midnightDbName to LevelDB config ('opalite-love-preprod-wallet')
8. Confirmed levelPrivateStateProvider is fully configured (accountId + passwordProvider) but does NOT persist sync state
9. Updated README with favicon, OG banner, Codecov badge, tech badges, setup guide
10. Pushed all commits to GitHub (18+ commits)

**Two OOM Crashes:**
- Run 1 (4GB heap): OOM at 44,377/1,358,359 = 3.3% after ~9 minutes
- Run 2 (10GB heap): OOM at 867,394/1,358,359 = 64% after ~61 minutes
- Memory growth is roughly linear: ~8.6GB used at 64% → ~13.4GB needed for 100%
- Machine has 31GB RAM, ~16GB available

### THE BLOCKER: Sync OOM

The shielded wallet scans all 1,358,359 records from preprod genesis. Memory grows linearly with records processed. At 64% (867k records), the V8 heap was at 8.6GB. Extrapolating:

  867,394 records → 8.6 GB heap
  1,358,359 records → ~13.4 GB heap needed
  Plus overhead → ~16 GB heap should complete

**Next attempt: 20GB heap**
  NODE_OPTIONS='--max-old-space-size=20480' npx tsx src/preprod.ts

Machine has 16GB available RAM. 20GB heap will use swap but should complete. If it OOMs again, we MUST get a persistence answer from the Midnight team.

### PERSISTENCE: The Root Cause (UNRESOLVED — ASK DISCORD)

levelPrivateStateProvider IS fully configured in api.ts (lines 546-556):
- accountId: coin public key
- privateStoragePasswordProvider: base64(key) + '!'
- midnightDbName: 'opalite-love-preprod-wallet'
- privateStateStoreName: 'age-verification-private-state'

BUT it only persists CONTRACT private state (age verification counter) and signing keys.
It does NOT persist SYNC STATE (chain scan position, merkle tree).
Every wallet restart re-syncs from genesis (index 0).

**Discord questions to ask the Midnight team:**
1. How do you persist wallet sync state across restarts with wallet-sdk-facade 4.x?
2. InMemoryTransactionHistoryStorage was removed from unshielded-wallet 3.1.0 — what replaced it?
3. Is there a way to start sync from a specific block index instead of genesis?
4. Does levelPrivateStateProvider persist the chain scan state, or only contract private state?
5. What is the recommended pattern for avoiding full re-sync on every wallet restart?

### IMMEDIATE NEXT STEPS (Session 10)

1. **Check Discord** for responses from Midnight team about persistence
2. **Start sync with 20GB heap:**
   cd /Workspace/apecsdev/opalite-love/deploy-cli
   NODE_OPTIONS='--max-old-space-size=20480' npx tsx src/preprod.ts 2>&1 | tee /tmp/sync-run3.log
   # option 2, paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
   # LET IT RUN — do not Ctrl+C — may take 1-2 hours with 20GB heap

3. **Retry faucet** while sync runs:
   - Web: https://faucet.preprod.midnight.network/
   - Address: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
   - If web fails, ask on Discord for a faucet bot

4. **When sync completes (isSynced: true):**
   - Fund from faucet (if not already done)
   - Generate DUST from tNight
   - Deploy contract (CLI option 1)
   - Screenshot contract address
   - Call verifyAge to prove it works
   - Screenshot verifyAge result
   - Add deployment address to README

5. **After deployment:**
   - Make repo public on GitHub
   - Add Codecov integration
   - Submit to hackathon with repo link + screenshots

### Pickup Commands

  # Ensure Node 24
  nvm use 24
  cd /Workspace/apecsdev/opalite-love

  # Check proof server
  docker ps --filter name=proof-server
  docker compose -f deploy-cli/proof-server.yml up -d

  # Start 20GB heap sync (LET RUN FOR HOURS)
  cd deploy-cli
  NODE_OPTIONS='--max-old-space-size=20480' npx tsx src/preprod.ts 2>&1 | tee /tmp/sync-run3.log
  # option 2, paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21

  # Check sync progress (another terminal)
  tail -5 /tmp/sync-run3.log

  # Check memory usage
  ps -o pid,rss,vsz,cmd -p $(pgrep -f 'tsx src/preprod') 2>/dev/null
  free -g | head -2

  # Retry faucet
  # Web: https://faucet.preprod.midnight.network/
  # Paste: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw

  # After sync + funding + DUST:
  # Follow CLI prompts: deploy contract, call verifyAge, screenshot everything
  # Then: git add -A, git commit, git push, make repo public, submit to hackathon

### Files Modified (All Committed and Pushed)

  deploy-cli/package.json  - Self-contained deps, wallet SDK 4.x gen
  deploy-cli/src/config.ts - Added midnightDbName to contractConfig
  deploy-cli/src/api.ts    - Removed InMemoryTransactionHistoryStorage, added progress logging, added midnightDbName
  package.json (root)      - Deps stripped to empty, overrides removed
  README.md                - Enhanced with banner, badges, setup guide
  AGENTS.md                - Updated for Session 9
  docs/HANDOFF.md          - This file

### Git Status
  Branch: master
  Remote: git@github.com:APECSdev/opalite-love.git
  Status: All committed and pushed (18+ commits)
  Working tree: clean

### Sync Progress History

| Run | Heap | Reached | % | Duration | Outcome |
|---|---|---|---|---|---|
| 1 | 4GB (default) | 44,377 | 3.3% | ~9 min | OOM |
| 2 | 10GB | 867,394 | 64% | ~61 min | OOM |
| 3 | 20GB (planned) | ? | ? | ? | Pending |

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

### Dependency Versions (deploy-cli/package.json)

  @midnight-ntwrk/compact-js: 2.5.1
  @midnight-ntwrk/compact-runtime: 0.16.0
  @midnight-ntwrk/ledger-v8: 8.1.0
  @midnight-ntwrk/midnight-js: 4.1.1
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
