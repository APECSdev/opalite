# PERSISTENCE - SDK Native Serialize/Restore (Session 10 Discovery)

## VERDICT: The wallet SDK has FULL native serialize/restore. Sync progress IS
## included in the serialized state. Restoring resumes sync where it left off.

## Evidence (from installed d.ts files)

### Sub-wallet APIs (shielded 3.0.1, dust 4.1.0, unshielded 3.1.0)
-`serializeState(): Promise<string>` on each sub-wallet API
-`waitForSyncedState(allowedGap?: bigint)` on each
- State objects have`.serialize(): string` and
`capabilities.serialization.serialize(wallet)` /`.deserialize(aux, data)`

### Static restore on each wallet class
- Shielded:`startWithSeed(seed)` |`startWithSecretKeys(sk)` |`restore(serializedState)`
- Dust:`startWithSeed(seed, dustParameters)` |`startWithSecretKey(sk, dp)` |`restore(serializedState)`
- Unshielded:`startWithPublicKey(publicKey)` |`restore(serializedState)`

### CoreWallet.restore includes sync progress (THE key finding)
- shielded CoreWallet.restore(localState: ZswapLocalState, secretKeys,
  syncProgress: Omit<SyncProgressData,'isConnected'>, protocolVersion, networkId)
- SyncProgressData = {appliedIndex, highestRelevantWalletIndex, highestIndex,
  highestRelevantIndex, isConnected}
- So appliedIndex (chain scan position) persists across restore.

### Facade requirements
- facade/dist/index.d.ts comment: pass`InMemoryTransactionHistoryStorage`
  to enable serialize/restore. We removed it (removed from unshielded-wallet 3.1.0).
- Replacement:`TransactionHistoryStorage` namespace now lives in
`@midnight-ntwrk/wallet-sdk-abstractions` (seen in unshielded v1/TransactionHistory.d.ts).
  MUST find the in-memory impl export there and re-add txHistoryStorage to facade config.

### Facade instance surface (probe dump, 35 methods)
- Sub-wallets exposed as:`wallet.shielded`,`wallet.unshielded`,`wallet.dust`
- Lifecycle:`start`,`stop`,`state`,`waitForSyncedState`
- Tx: submitTransaction, transferTransaction, balance*/sign*/finalize*, initSwap,
  registerNightUtxosForDustGeneration, createDustActionTransaction, revertTransaction

## CRITICAL WARNINGS

1. Raw state is NOT JSON-serializable: shielded core state is a WASM pointer
   (`state.state.__wbg_ptr`), unshielded uses Immutable.js-style structures
   (`_editable/_edit/_root/_size`). NEVER JSON.stringify the raw state.
   ALWAYS use`serializeState()` which handles WASM/Immutable encoding to a string.
2. SIGINT handler was swallowed by the CLI spinner framework (clack) - our graceful
   dump never ran (no /tmp/wallet-state-final.json). DO NOT rely on shutdown hooks.
   Persistence MUST be periodic (interval-based checkpointing), not on-exit.
3. Chain is live: highestRelevantWalletIndex grew to ~1,358,776 (was 1,358,359).

## IMPLEMENTATION PLAN

1. Find in-memory TransactionHistoryStorage in wallet-sdk-abstractions,
   re-add`txHistoryStorage` to facade config in api.ts.
2. State file: deploy-cli/wallet-state.json (gitignored) containing
   {version, savedAt, shielded: <string>, dust: <string>, unshielded: <string>}.
3. SAVE: periodic timer every 60-120s during sync:
`await wallet.shielded.serializeState()` (+ dust + unshielded),
   write tmp file then atomic rename. LOG serialized byte sizes each checkpoint
   (tells us live-state size vs transient garbage).
4. LOAD: if wallet-state.json exists at startup, build sub-wallets via
`Class.restore(serialized)` instead of`startWithSeed(seed)`, then construct facade.
5. Crash-resume cycle: sync -> OOM -> restart -> restore -> resume from last
   checkpoint. Each restart sheds transient sync garbage, so progress ratchets
   forward within a bounded heap. Checkpoint every 60s => max 60s lost work.
6. After sync completes + deploy: keep checkpointing (fast, small writes).

## Sync progress reference (2026-07-31)
- Run 1: 4GB heap, OOM @ 44,377/1,358,359 (3.3%, ~9min)
- Run 2: 10GB heap, OOM @ 867,394/1,358,359 (64%, ~61min)
- Probe run: healthy emissions, appliedIndex climbing, isConnected:true
