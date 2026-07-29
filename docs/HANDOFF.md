# HANDOFF — Midnight Builder Challenge (2025-07-29)

## ROOT CAUSES — TWO FOUND, ONE FIXED

### CAUSE 1 (FIXED): Mullvad VPN Kill Switch Blocking Docker Bridge Traffic

**Symptom:** Every connection to Docker published ports from the host failed with ECONNRESET / "socket hang up" / "Connection reset by peer". The wallet SDK could not sync. curl to the indexer returned empty reply. Raw Python sockets got ConnectionResetError.

**Root cause:** Mullvad VPN installs nftables rules that reject all host-originated TCP not exiting via the `wg0-mullvad` WireGuard interface. Docker bridge networks (172.16.0.0/12) are not exempted by default. docker-proxy's upstream leg (host to container IP) was rejected, causing downstream RST to all clients.

**Evidence:**
- nftables ruleset showed: `oif "wg0-mullvad" accept` then blanket `reject` in both output and forward chains.
- ufw inactive, firewalld inactive — Mullvad was the only firewall actor.
- In-network curl (container to container on same Docker bridge) returned HTTP 405 — indexer healthy.
- Host to published port: TCP connect succeeded, then RST.
- Host to container bridge IP direct: Connection refused in 0ms.
- `systemctl restart docker` did NOT fix it (rules belong to Mullvad, not Docker).

**Fix:** `mullvad lan set allow` — adds RFC1918 accept rules (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) before the reject. Verified: host to published port now returns HTTP 405. WS connections exchange real data (bytesRead: 5308, 95460, 22356).

**Security note:** This allows LAN devices to reach host services listening on 0.0.0.0 (including Docker published ports). On trusted home network this is the intended use. Reversible: `mullvad lan set block`.

### CAUSE 2 (CURRENT BLOCKER): TypeError in printWalletSummary

**Symptom:** After wallet sync completes (checkmark shown), the CLI crashes:
```
TypeError: Cannot read properties of undefined (reading 'encode')
    at MidnightBech32m.encode (wallet-sdk-address-format/dist/index.js:43:34)
    at printWalletSummary (counter-cli/src/api.ts:400)
    at buildWalletAndWaitForFunds (counter-cli/src/api.ts:440)
    at buildWallet (counter-cli/src/cli.ts:68)
    at run (counter-cli/src/cli.ts:238)
```

**Root cause (preliminary):** `printWalletSummary` calls `MidnightBech32m.encode(networkId, item)` where `item[Bech32mSymbol]` is undefined. This is a shielded or dust address object that lacks the Bech32m symbol — because a fresh genesis wallet on an undeployed network has no shielded/dust state yet (no transactions, no shielded coins).

**Note on line numbers:** The crash stack trace says api.ts:285 and api.ts:343, but the actual grep shows printWalletSummary at line 400 and buildWalletAndWaitForFunds at line 440. The discrepancy is from tsx source map imprecision. The grep line numbers are authoritative.

**Evidence that sync SUCCEEDED:**
- The spinner showed a checkmark.
- The node is healthy and did NOT crash (verified: manual stack runs indefinitely, produces blocks every 6s, responds to RPC).
- The node 1000 Normal Closure was client-initiated (SDK disconnecting after sync), NOT a node crash.
- The indexer 1006 WS closures were SDK teardown, NOT indexer failures.
- 95KB of subscription data was received on one WS connection.

## VERIFIED FACTS
1. **Node:** HEALTHY. Substrate dev node, produces blocks every 6s, responds to HTTP RPC (405 on GET, expects POST). Stays up indefinitely on its own. Container name: counter-node. Internal port: 9944.
2. **Indexer:** HEALTHY. Returns 405 on GET /api/v3/graphql (correct for POST-only GraphQL endpoint). Indexes blocks from node. Container name: counter-indexer. Internal port: 8088. WS endpoint: /api/v3/graphql/ws.
3. **Proof server:** Container name: counter-proof-server. Internal port: 6300. Wait strategy: log message "Actix runtime found; starting in Actix runtime".
4. **Node 1000 Normal Closure during standalone run:** CLIENT-INITIATED. The wallet SDKs Polkadot.js API disconnected after sync. NOT a node crash.
5. **Indexer 1006 WS close:** SDK teardown consequence. NOT an indexer failure.
6. **Wallet sync:** Appears to SUCCEED based on checkmark, data received, and node stability.
7. **The TypeError:** Is DOWNSTREAM of sync, in the display/summary function. NOT a sync failure.

## CURRENT INFRASTRUCTURE STATE
A manual compose stack was started with `docker compose -f standalone.yml up -d`. It may or may not still be running. Check with:
```bash
docker ps --filter name=counter-
```
If running, ports are ephemeral (check docker ps output). If gone, restart:
```bash
cd /Workspace/apecsdev/midnight-counter-reference/counter-cli && docker compose -f standalone.yml up -d
```

## EPHEMERAL PATCHES (in root node_modules — LOST on npm install)
These patches add verbose error logging. They are NOT required for the fix but help debugging. If lost, they are not critical to reapply.

1. `node_modules/@midnight-ntwrk/wallet-sdk-indexer-client/dist/effect/WsSubscriptionClient.js`:
- Added `import { inspect } from 'util';`
- Replaced `new ServerError({ message: String(err) })` with `new ServerError({ message: inspect(err, { depth: 10 }) })`

2. `node_modules/@midnight-ntwrk/wallet-sdk-unshielded-wallet/dist/v1/Sync.js` (and shielded + dust-wallet equivalents):
- Added inspect-based error logging in Stream.mapError.

3. `counter-cli/src/cli.ts`:
- Added `import * as util from 'util';` at top of file (line 1).
- Replaced `logger.error(`Error: <span data-nanogpt-math-ph="0"></span>{util.inspect(e, { depth: null })}`);`

## NEXT SESSION — EXACT STEPS

### Step 1: Verify environment
```bash
mullvad lan get 2>/dev/null || mullvad lan set allow
docker ps --filter name=counter- --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```
If no containers, start them:
```bash
cd /Workspace/apecsdev/midnight-counter-reference/counter-cli && docker compose -f standalone.yml up -d && sleep 30
```

### Step 2: Get the crash site source (THIS IS THE FIRST COMMAND TO RUN)
```bash
sed -n '400,530p' /Workspace/apecsdev/midnight-counter-reference/counter-cli/src/api.ts
```
This shows `printWalletSummary` (line 400) and `buildWalletAndWaitForFunds` (line 440). The crash is in printWalletSummary encoding a shielded/dust address that is undefined.

### Step 3: Diagnose
Look at what `printWalletSummary` does with `state`:
- Which address fields does it access and encode?
- Which address is undefined (shielded, dust, or both)?
- Is this expected for a fresh wallet with no transactions?

### Step 4: Fix
Add a guard in `printWalletSummary` for undefined/missing shielded/dust addresses. A fresh genesis wallet on an undeployed network has no shielded/dust state — the display function must handle this gracefully (skip or show "not yet available" instead of crashing).

### Step 5: Run
```bash
cd /Workspace/apecsdev/midnight-counter-reference/counter-cli && docker compose -f standalone.yml down && npm run standalone
```
(down first because standalone.ts starts its own testcontainers env with fixed container_name values — both cannot coexist.)

### Expected success flow
1. Containers start (node, indexer, proof-server).
2. Wallet builds from genesis seed.
3. Wallet syncs with network (checkmark).
4. printWalletSummary displays addresses (unshielded at minimum; shielded/dust may be empty/zero).
5. Providers configured.
6. Contract menu appears: deploy, join, monitor DUST.
7. Deploy counter contract.
8. CLI prints contract address.
9. Counter interaction menu: increment, display, exit.

## CLI.TS FLOW (for reference)
```
run(config, logger, dockerEnv)
  -> dockerEnv.up()  // starts containers
  -> mapContainerPort()  // remaps config.indexer/indexerWS/node/proofServer to testcontainers mapped ports
  -> buildWallet(config, rli)
    -> buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED)  // standalone mode
      -> syncs wallet
      -> printWalletSummary(syncedState, unshieldedKeystore)  // CRASHES HERE
  -> configureProviders(walletCtx, config)
  -> mainLoop(providers, walletCtx, rli)
    -> deployOrJoin()
      -> deploy() or joinContract()
    -> counter interactions (increment, display)
  -> finally: wallet.stop(), env.down(), "Goodbye."
```

## VERSIONS
- wallet-sdk-facade: 3.0.0
- wallet-sdk-indexer-client: 1.2.0
- wallet-sdk-address-format: (check node_modules for version)
- indexer-standalone image: midnightntwrk/indexer-standalone:4.0.0
- Node.js: v22.23.1
- Docker: standard bridge networking, ephemeral port mapping
