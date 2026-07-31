# HANDOFF - Opalite Love (Session 10 Final -> Fresh Session)

## STATUS: LEVEL 1 NEW MOON - ONE STEP LEFT AFTER DUST SYNC

Contract: written, compiled, tested, documented, committed, pushed. Deploy CLI: built with wallet persistence. README: enhanced. Wallet: funded with 1000 tNight (pending in-wallet confirmation). All code pushed to GitHub.

**THE ONLY BLOCKER: dust wallet sync still running (~52,765 / ~1,359,737 = 3.9% at last measurement). It is checkpointed, so just keep re-running the sync command after any crash/reboot until dust reports synced. Then deploy.**

### Level 1 Submission Checklist

| Requirement | Status |
|---|---|
| Toolchain installed | DONE |
| Contract compiles | DONE |
| Passing test suite | DONE - 3 tests pass |
| managed/ directory | DONE |
| 5 meaningful commits | DONE - 20+ commits pushed |
| Product idea in README | DONE |
| Setup instructions | DONE |
| Public vs private witness | DONE |
| Compile screenshot | DONE |
| Deploy CLI built | DONE - self-contained, current SDK gen, with persistence |
| Wallet created | DONE - seed in .secrets |
| Proof server running | DONE - Docker port 6300 |
| Wallet funded from faucet | DONE - 1000 tNight via Nethermind faucet (tx 00bc56d9...654fed) |
| Wallet syncs with network | IN PROGRESS - shielded DONE, unshielded DONE, dust ~4% (checkpointed, resume loop) |
| Contract deployed | NOT DONE - blocked on dust sync |
| Deploy screenshot | NOT DONE |
| Repo made public | NOT DONE - after deployment |
| Codecov added | NOT DONE - after repo is public |

### Session 10 Summary (The Persistence Breakthrough)

**Accomplished:**
1. Discovered the wallet SDK has native serialize/restore: `serializeState(): Promise<string>` on each sub-wallet API, and `ShieldedWallet(cfg).restore(serialized)` / same for dust + unshielded.
2. Confirmed `CoreWallet.restore` includes `syncProgress` (appliedIndex etc.) - so restoring RESUMES sync where it left off, not from genesis.
3. Found `InMemoryTransactionHistoryStorage` moved to `@midnight-ntwrk/wallet-sdk-abstractions@2.1.0` (removed from unshielded-wallet 3.1.0). Re-added to facade config.
4. Wrote `deploy-cli/src/persistence.ts`: load/save/checkpoint timer (60s) + adaptive `makeTxHistoryStorage()` factory.
5. Patched `deploy-cli/src/api.ts`: import persistence, load saved state before `WalletFacade.init`, swap factory functions to `.restore(saved)` when state exists, start checkpoint timer after `wallet.start()`, inject `txHistoryStorage` into walletConfig.
6. PROVEN: Run 3 OOM'd at appliedIndex 995,261 (73%) with checkpoints saving. Run 4 restored at 994,424 and completed shielded sync to the live tip. Checkpoint files stayed 172-306KB (live state tiny; 8.6GB OOM was transient garbage).
7. Found Nethermind alternate faucet (https://midnight-tmnight-preprod.nethermind.dev/) after official faucet errored. Successfully funded 1000 tNight.
8. Committed and pushed all persistence work.

**Sync history (Session 9-10):**

| Run | Heap | Start | Reached | % | Duration | Outcome |
|---|---|---|---|---|---|---|
| 1 | 4GB | 0 | 44,377 | 3.3% | ~9 min | OOM |
| 2 | 10GB | 0 | 867,394 | 64% | ~61 min | OOM |
| 3 | 10GB | 0 (fresh) | 995,261 | 73% | ~45 min | OOM (checkpoints saved) |
| 4 | 10GB | 994,424 (restore) | shielded DONE, dust 52,765 | shielded 100%, dust 4% | ongoing | shielded + unshielded completed, dust grinding |

### THE REMAINING BLOCKER: Dust Sync

- Dust wallet must scan the full ~1,359,737-record chain. At ~8-21 records/sec (faster now that shielded is done), remaining ~1.3M records = many hours.
- It IS checkpointed every 60s, so crashes/reboots just mean re-run and resume. No progress is lost beyond 60s.
- Do NOT try to skip dust sync - DUST pays transaction fees for deploy, and the dust wallet must be synced to see/generated DUST from the 1000 tNight.
- If dust pace is unacceptable, ask Midnight Discord whether dust sync can be fast-forwarded, but the checkpointed resume loop should get there on its own.

### IMMEDIATE NEXT STEPS (Fresh Session)

1. **Check if dust sync is still running or crashed:**
   ```
   ps aux | grep 'tsx src/preprod' | grep -v grep
   tail -20 /tmp/sync-run4.log
```

2. **If crashed, resume (same command, same seed):**
   ```
   cd /Workspace/apecsdev/opalite-love/deploy-cli
   nvm use 24
   docker compose -f proof-server.yml up -d
   NODE_OPTIONS='--max-old-space-size=10240' npx tsx src/preprod.ts 2>&1 | tee /tmp/sync-run5.log
   # option 2, paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
```
   Look for `[persistence] RESTORING wallet state saved at ...` and dust `appliedIndex` resuming high (not 0).

3. **Repeat the resume loop until dust reports synced** (appliedIndex ~= highestRelevantWalletIndex). The CLI spinner will advance past 'Syncing with network' automatically.

4. **Once all three wallets are synced, the CLI proceeds. Follow the prompts:**
   - Confirm 1000 tNight balance is visible (unshielded).
   - Generate DUST from tNight (registerNightUtxosForDustGeneration / the CLI's DUST menu option).
   - Deploy the age verification contract (CLI deploy option).
   - Screenshot the contract address + deploy confirmation.
   - Call verifyAge to prove the contract works.
   - Screenshot the verifyAge result.

5. **After deployment:**
   - Add the deployed contract address to README.md.
   - Commit and push.
   - Make the repo public on GitHub.
   - Add Codecov integration.
   - Submit to the hackathon with repo link + screenshots.

### Pickup Commands (Fresh Session Start)

```
# Ensure Node 24
nvm use 24
cd /Workspace/apecsdev/opalite-love

# Check proof server
docker ps --filter name=proof-server
docker compose -f deploy-cli/proof-server.yml up -d

# Check if sync is still running
ps aux | grep 'tsx src/preprod' | grep -v grep
tail -20 /tmp/sync-run4.log 2>/dev/null || tail -20 /tmp/sync-run5.log 2>/dev/null

# Resume sync if needed (LET RUN FOR HOURS - do not Ctrl+C)
cd deploy-cli
NODE_OPTIONS='--max-old-space-size=10240' npx tsx src/preprod.ts 2>&1 | tee /tmp/sync-run5.log
# option 2, paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21

# Check dust sync progress (another terminal)
grep -o '"appliedIndex":"[0-9]*"' /tmp/sync-run5.log | tail -1

# Check memory usage
ps -o pid,rss,vsz,cmd -p $(pgrep -f 'tsx src/preprod') 2>/dev/null
free -g | head -2

# Verify faucet tx landed (indexer GraphQL)
curl -s -X POST https://indexer.preprod.midnight.network/api/v4/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query($h:String!){transaction(hash:$h){hash blockHeight}}","variables":{"h":"00bc56d944ae087195f7cd2b6c3bde9efde21fdf0b770c8e8bd487a56213654fed"}}' \
  | python3 -m json.tool

# Escape hatch: force fresh sync (ignores wallet-state.json)
# WALLET_FRESH=1 NODE_OPTIONS='--max-old-space-size=10240' npx tsx src/preprod.ts
```

### Funding Status

- 1000 tNight sent via Nethermind faucet (https://midnight-tmnight-preprod.nethermind.dev/) at 2026-07-31 ~06:15 EDT.
- Transaction ID: 00bc56d944ae087195f7cd2b6c3bde9efde21fdf0b770c8e8bd487a56213654fed
- Recipient: mn_addr_preprod1afy0u68xmt77wlneszepf7z2q97e40hzqyhy6kxwkqyslu9g0p7qskm7dw
- Pending in-wallet confirmation once the CLI advances past the sync spinner (unshielded wallet is synced, so the balance will appear).
- If the tx didn't land, re-request from the Nethermind faucet.

### Files Modified in Session 10 (All Committed and Pushed)

- `deploy-cli/package.json` - Added @midnight-ntwrk/wallet-sdk-abstractions@2.1.0
- `deploy-cli/src/persistence.ts` - **NEW** Wallet state checkpoint/restore module
- `deploy-cli/src/api.ts` - Persistence wired in (load/restore/checkpoint/txHistoryStorage)
- `pnpm-lock.yaml` - Updated
- `AGENTS.md` - Updated for Session 10
- `docs/HANDOFF.md` - This file
- `docs/PERSISTENCE.md` - Persistence discovery notes (reference)

### Git Status

- Branch: master
- Remote: git@github.com:APECSdev/opalite-love.git
- Status: All committed and pushed (20+ commits)
- Working tree: clean (except gitignored wallet-state.json + /tmp logs)

### Compact Contract

```
pragma language_version >= 0.20;
import CompactStandardLibrary;
export ledger verifiedCount: Counter;
export circuit verifyAge(): [] {
    verifiedCount.increment(1);
}
```

### Network Endpoints

```
Preprod:
  indexer: https://indexer.preprod.midnight.network/api/v3/graphql  (v4 also works)
  indexerWS: wss://indexer.preprod.midnight.network/api/v3/graphql/ws
  node: https://rpc.preprod.midnight.network
  proofServer: http://127.0.0.1:6300
  faucet (official): https://faucet.preprod.midnight.network/
  faucet (Nethermind, RECOMMENDED): https://midnight-tmnight-preprod.nethermind.dev/
```

### Dependency Versions (deploy-cli/package.json)

```
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
@midnight-ntwrk/wallet-sdk-abstractions: 2.1.0
proof-server: midnightntwrk/proof-server:8.0.3
tsx: 4.23.1
Node.js: v24.18.1
pnpm: 10.7.0
```
