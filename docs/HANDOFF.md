# HANDOFF - Opalite Love (Session 8)

## STATUS: LEVEL 1 NEW MOON - ALMOST COMPLETE. ONLY DEPLOYMENT REMAINING.

Contract is written, compiled, tested, documented, committed. Deploy CLI is built and working. The ONLY remaining task is deploying to Preprod/Preview and screenshotting the contract address.

### Level 1 Submission Checklist

| Requirement | Status |
|---|---|
| Toolchain installed | DONE - Node 24.18.1, compact CLI v0.5.1, Docker |
| Contract compiles | DONE |
| Passing test suite | DONE - 3 tests pass |
| managed/ directory | DONE |
| 5 meaningful commits | DONE - 8+ commits |
| Product idea in README | DONE |
| Setup instructions | DONE |
| Public vs private witness | DONE |
| Compile screenshot | DONE |
| Deploy CLI built | DONE - deploy-cli with tsx |
| Wallet created | DONE - seed in .secrets |
| Proof server running | DONE - Docker port 6300 |
| Wallet syncs with network | **BLOCKED - sync stuck** |
| Wallet funded from faucet | BLOCKED - need sync |
| Contract deployed | BLOCKED - need funding |
| Deploy screenshot | NOT DONE |

### What Was Accomplished (Session 8)

1. Removed stale leaderboard packages. Updated root package.json to opalite-love.
2. Created full deploy-cli package adapted from midnight-counter-reference/counter-cli.
3. Upgraded Node 22 to Node 24.18.1 LTS. Switched from ts-node to tsx.
4. Approved pnpm build scripts (classic-level, core-js, esbuild, msgpackr-extract).
5. Verified all imports load correctly with tsx on Node 24.
6. Created Preprod wallet. Seed saved to .secrets (gitignored).
7. Proof server running via Docker (midnightntwrk/proof-server:8.0.3, port 6300).

### THE BLOCKING ISSUE: Wallet Sync Stuck

When running `npx tsx src/preprod.ts` from deploy-cli/, the wallet restores but gets stuck at 'Syncing with network':

  RPC-CORE: subscribeRuntimeVersion(): RuntimeVersion:: disconnected from wss://rpc.preprod.midnight.network/: 1000:: Normal Closure

The wallet shows the unshielded address but cannot sync. The '1000:: Normal Closure' code means the server is intentionally closing the WebSocket connection.

### Possible Causes to Investigate

1. **Preprod RPC down or changed:** Test connectivity with curl or wscat to wss://rpc.preprod.midnight.network
2. **Try Preview network:** Run `npx tsx src/preview.ts` instead. Creates NEW wallet (option 1). Different network ID.
3. **Proof server version mismatch:** We use midnightntwrk/proof-server:8.0.3. Check reference project for updates.
4. **Wallet SDK version incompatibility:** Our versions (facade 3.0.0, dust 3.0.0, hd 3.0.2, shielded 2.1.0, unshielded 2.1.0) may not match current Preprod.
5. **Check reference project:** Compare config.ts, proof-server.yml, and package.json versions with /Workspace/apecsdev/midnight-counter-reference/
6. **Check Midnight docs:** Look for network status, migration guides, or endpoint changes.
7. **Network endpoints may have changed:** The Preprod RPC/indexer URLs in config.ts are from the reference project and may be outdated.

### IMMEDIATE NEXT STEPS

1. Investigate sync issue (start with Preprod RPC connectivity test, then try Preview)
2. Once sync works: fund wallet from faucet
3. Deploy contract (CLI option 1)
4. Screenshot contract address
5. Add deployment address to README
6. Commit, push to GitHub, submit to hackathon

### Pickup Commands

  # Ensure Node 24
  nvm use 24

  # Check proof server
  docker ps --filter name=proof-server
  cd /Workspace/apecsdev/opalite-love
  docker compose -f deploy-cli/proof-server.yml up -d

  # Test Preprod RPC
  curl -s https://rpc.preprod.midnight.network/ -o /dev/null -w '%{http_code}'

  # Try Preview network (new wallet, choose option 1)
  cd deploy-cli
  npx tsx src/preview.ts

  # Try Preprod (restore seed, choose option 2)
  npx tsx src/preprod.ts
  # Paste: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21

  # Compare reference project
  diff /Workspace/apecsdev/midnight-counter-reference/counter-cli/src/config.ts deploy-cli/src/config.ts
  diff /Workspace/apecsdev/midnight-counter-reference/package.json package.json
  cat /Workspace/apecsdev/midnight-counter-reference/counter-cli/proof-server.yml

  # Check for newer proof server images
  docker search midnightntwrk/proof-server

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

### Dependency Versions

  @midnight-ntwrk/compact-runtime: 0.16.0
  @midnight-ntwrk/compact-js: 2.5.1
  @midnight-ntwrk/ledger-v8: 8.1.0
  @midnight-ntwrk/midnight-js: 4.1.1
  @midnight-ntwrk/wallet-sdk-facade: 3.0.0
  @midnight-ntwrk/wallet-sdk-dust-wallet: 3.0.0
  @midnight-ntwrk/wallet-sdk-hd: 3.0.2
  @midnight-ntwrk/wallet-sdk-shielded: 2.1.0
  @midnight-ntwrk/wallet-sdk-unshielded-wallet: 2.1.0
  proof-server: midnightntwrk/proof-server:8.0.3
  tsx: 4.23.1
  Node.js: v24.18.1
  pnpm: 10.7.0
