# HANDOFF - Opalite (Session 12 -> Fresh Session)

## STATUS: PIVOTED BACK TO LOCAL DEPLOY CLI — SYNCING DUST WALLET

All three alternative deployment options FAILED:
1. **1AM wallet extension** — server-side indexer bug (zswap commitment tree corruption). Sync stuck at 99% forever. ABANDONED.
2. **build.1am.xyz** — requires Google sign-in, just an AI prompt tool. NO-GO.
3. **zkmint.1am.xyz** — meme coin launchpad, not for custom contracts. NOT SUITABLE.

We are back to the original plan: sync the local dust wallet to completion, then deploy via local CLI + Docker proof server.

### Level 1 Submission Checklist

| Requirement | Status |
|---|---|
| Toolchain installed | DONE |
| Contract compiles | DONE |
| Passing test suite | DONE - 3 tests pass |
| managed/ directory | DONE |
| 5 meaningful commits | DONE - 20+ commits |
| Product idea in README | DONE (narrative rebrand pending) |
| Setup instructions | DONE |
| Public vs private witness | DONE |
| Compile screenshot | DONE |
| Deploy CLI built | DONE (with persistence) |
| Wallet created | DONE (seed in .secrets) |
| Proof server running | DONE (Docker, for deploy) |
| Wallet funded | DONE - 1000 tNight via Nethermind faucet (pending in-wallet confirmation) |
| Wallet syncs with network | IN PROGRESS - shielded+unshielded DONE, dust at 14% (resuming) |
| Contract deployed | NOT DONE -- waiting for dust sync |
| Deploy screenshot | NOT DONE |
| Repo made public | NOT DONE -- after deployment |
| Codecov added | NOT DONE -- after repo is public |

### Session 12 Summary

**Attempted:**
1. Explored 1AM wallet as deployment path (zero dust, zero NIGHT, ProofStation sponsors fees).
2. Installed 1AM Chrome extension, connected to preprod successfully.
3. Built contracts.astro page on opalite.social with 1AM wallet integration UI.
4. Fixed FetchZkConfigProvider URL (relative → absolute).
5. Added retry loop for getShieldedAddresses() (60 attempts × 15s).
6. Discovered 1AM wallet sync stuck at 99% — diagnosed as zswap commitment tree corruption.
7. Performed full storage wipe (IndexedDB, LocalStorage, Service Worker, Cache, Extension State, Extensions dir).
8. Killed Chromium, restarted, created new wallet — SAME ERROR. Bug is server-side (1AM indexer).
9. Checked build.1am.xyz — requires Google sign-in, AI prompt tool only. NO-GO.
10. Checked zkmint.1am.xyz — meme coin launchpad. NOT SUITABLE.
11. PIVOTED: resumed local wallet sync via deploy-cli.

**Key Finding:**
The 1AM wallet's sync has a fatal server-side bug in the 1AM indexer:
```
Error: values inserted non-linearly into zswap commitment tree;
  expected to insert index 17032, but received 17031.
  at replayEventsWithChanges → applyUpdate
```
This is NOT fixable on our end. The 1AM indexer (api-preprod.1am.xyz) sends sync events out of order, and the Midnight ledger WASM rejects them. Even a brand new wallet with a different seed hits the same error at the same index. The 1AM wallet approach is DEAD.

### Current State

- **Local wallet sync**: RESUMING from checkpoint at dust appliedIndex 190,866 (~14% of ~1.36M records).
- Shielded sync: COMPLETE
- Unshielded sync: COMPLETE
- Dust sync: 14% (190,866 / ~1,359,000)
- Estimated time to completion: ~20-22 hours at ~15-21 records/sec
- The 1000 tNight faucet funding will be found once dust sync reaches the faucet tx block (~1,359,000 area).
- persistence.ts path fixed (opalite-love → opalite).

### IMMEDIATE NEXT STEPS (Fresh Session)

1. **Check if sync completed:**
```bash
   cd /Workspace/apecsdev/opalite/deploy-cli
   ls -la wallet-state.json
   # Check the appliedIndex in the checkpoint
   python3 -c "import json; d=json.load(open('wallet-state.json')); print(f\"Dust appliedIndex: {d.get('dustWalletState',{}).get('appliedIndex','?')}\")"
   ```

2. **If sync is still running:** Wait. Monitor with:
```bash
   watch -n 10 'ls -la /Workspace/apecsdev/opalite/deploy-cli/wallet-state.json'
   top -d 2
   ```

3. **If sync completed (dust at 100%):**
```bash
   # Start proof server
   cd /Workspace/apecsdev/opalite/deploy-cli
   docker compose -f proof-server.yml up -d

   # Verify proof server is running
   curl -s http://localhost:6300/health || echo "Proof server not responding"

   # Deploy the contract
   npx tsx src/cli.ts deploy

   # Call verifyAge
   npx tsx src/cli.ts call

   # Screenshot the output
   ```

4. **After successful deploy:**
    - Screenshot the deploy output (contract address, transaction hash)
    - Screenshot the call output (verified count incremented)
    - Make the repo public on GitHub
    - Add Codecov
    - Submit to hackathon

### Pickup Commands (Fresh Session Start)

```bash
# Ensure Node 24
nvm use 24
cd /Workspace/apecsdev/opalite

# Check sync progress
cd deploy-cli
ls -la wallet-state.json
python3 -c "
import json
d = json.load(open('wallet-state.json'))
dust = d.get('dustWalletState', {})
print(f\"Dust appliedIndex: {dust.get('appliedIndex', '?')}\")
print(f\"Dust highestRelevant: {dust.get('highestRelevantWalletIndex', '?')}\")
"

# Check if sync process is still running
ps aux | grep "tsx.*cli" | grep -v grep

# Check proof server
docker ps --filter name=proof-server

# If sync done, deploy:
# docker compose -f proof-server.yml up -d
# npx tsx src/cli.ts deploy
# npx tsx src/cli.ts call
```

### 1AM Wallet Investigation Details (FOR HISTORICAL REFERENCE)

The 1AM wallet was investigated as a way to deploy without syncing the local dust wallet. The ProofStation (api-preprod.1am.xyz) sponsors all transaction fees (zero dust, zero NIGHT). The approach was:

1. Connect 1AM wallet in browser:`window.midnight['1am'].connect('preprod')`
2. Get shielded addresses:`connectedAPI.getShieldedAddresses()`
3. Build providers (FetchZkConfigProvider, indexerPublicDataProvider, proofProvider, walletProvider, midnightProvider)
4. Deploy via midnight-js-contracts:`deployContract(providers, options)`

This approach FAILED because:
-`getShieldedAddresses()` is gated behind sync completion
- The 1AM wallet sync NEVER completes due to a server-side indexer bug
- The bug: "values inserted non-linearly into zswap commitment tree; expected to insert index 17032, but received 17031"
- This error is in the 1AM indexer (api-preprod.1am.xyz), not local state
- Persists after full storage wipe + new wallet creation
- The 1AM wallet approach is DEAD

The buildProviders code from the 1AM docs (for historical reference):

```javascript
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

async function buildProviders(connectedAPI) {
  const config = await connectedAPI.getConfiguration();
  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    window.location.origin + '/contract/compiled/age_verification',
    fetch.bind(window),
  );

  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri, config.indexerWsUri,
  );

  const provingProvider = await connectedAPI.getProvingProvider(zkConfigProvider);
  const proofProvider = {
    async proveTx(unprovenTx) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const { shieldedAddress } = await connectedAPI.getShieldedAddresses();
  const walletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    async balanceTx(tx) {
      const serialized = tx.serialize();
      const hex = Array.from(serialized).map(b => b.toString(16).padStart(2, '0')).join('');
      const result = await connectedAPI.balanceUnsealedTransaction(hex);
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      const bytes = new Uint8Array(result.tx.match(/.{2}/g).map(b => parseInt(b, 16)));
      return Transaction.deserialize('signature', 'proof', 'binding', bytes);
    },
  };

  const midnightProvider = {
    async submitTx(tx) {
      const serialized = tx.serialize();
      const hex = Array.from(serialized).map(b => b.toString(16).padStart(2, '0')).join('');
      await connectedAPI.submitTransaction(hex);
      return tx.identifiers()[0];
    },
  };

  return { publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider };
}
```

### Compact Contract (UNCHANGED)

```compact
pragma language_version >= 0.20;
import CompactStandardLibrary;
export ledger verifiedCount: Counter;
export circuit verifyAge(): [] {
    verifiedCount.increment(1);
}
```

### Files Modified in Session 12 (All Committed)

-`packages/web/src/pages/contracts.astro` — Fixed FetchZkConfigProvider URL + retry loop + Check sync button (NOW UNUSED but kept for reference)
-`deploy-cli/src/persistence.ts` — Fixed path (opalite-love → opalite)
-`AGENTS.md` -- Updated for Session 12
-`docs/HANDOFF.md` -- This file

### Git Status

- Branch: master
- Remote: git@github.com:APECSdev/opalite.git
- Status: All committed and pushed
- Working tree: clean (pending AGENTS/HANDOFF commit)

### Key Unknowns

1. **Will the local dust sync complete successfully?** It was at 14% when killed. Resuming from checkpoint. Should work — persistence is proven.
2. **Will the 1000 tNight faucet funding be found?** The faucet tx was sent to our address. The dust wallet will find it once sync reaches that block.
3. **How long will the remaining sync take?** ~20-22 hours at ~15-21 records/sec for ~1.17M remaining records (1,359,000 - 190,866).
4. **Will the proof server work for deploy?** Docker proof-server:8.0.3 on port 6300. Should work — it was set up in earlier sessions.
