# HANDOFF — Midnight Builder Challenge (2025-07-29, Session 4 Final)

## STATUS: COUNTER REFERENCE COMPLETE — NEXT: HELLO WORLD

The counter reference project is fully working:
- Wallet syncs with local standalone network
- Counter contract deploys successfully
- Counter increments and displays correctly
- Contract address: 0caec20dbd0dea08f64803087add6eb41eea8ace31ac5882e33012f1824d416c

The next target is `midnight-hello-official` or `midnight-hello-world` (check `/Workspace/apecsdev/` for the exact directory name). This is the next project to get working for the hackathon entry.

---

## COMPLETE ROOT CAUSE HISTORY

### CAUSE 1 (FIXED in Session 3): Mullvad VPN Kill Switch

**Symptom:** Every connection to Docker published ports from the host failed with ECONNRESET / "socket hang up" / "Connection reset by peer". The wallet SDK could not sync. curl to the indexer returned empty reply.

**Root cause:** Mullvad VPN installs nftables rules that reject all host-originated TCP not exiting via the `wg0-mullvad` WireGuard interface. Docker bridge networks (172.16.0.0/12) are not exempted by default. docker-proxy's upstream leg (host to container IP) was rejected, causing downstream RST to all clients.

**Evidence:**
- nftables ruleset showed: `oif "wg0-mullvad" accept` then blanket `reject` in both output and forward chains.
- ufw inactive, firewalld inactive — Mullvad was the only firewall actor.
- In-network curl (container to container on same Docker bridge) returned HTTP 405 — indexer healthy.
- Host to published port: TCP connect succeeded, then RST.
- Host to container bridge IP direct: Connection refused in 0ms.
- `systemctl restart docker` did NOT fix it (rules belong to Mullvad, not Docker).

**Fix:** `mullvad lan set allow` — adds RFC1918 accept rules (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) before the reject.

**Security note:** This allows LAN devices to reach host services listening on 0.0.0.0 (including Docker published ports). Reversible: `mullvad lan set block`.

### CAUSE 2 (FIXED in Session 4): npm Dual-Package Symbol Identity Mismatch

**Symptom:** After wallet sync completes (checkmark shown), the CLI crashes:
```
TypeError: Cannot read properties of undefined (reading 'encode')
    at MidnightBech32m.encode (wallet-sdk-address-format/dist/index.js:43:34)
    at printWalletSummary (counter-cli/src/api.ts:400)
    at buildWalletAndWaitForFunds (counter-cli/src/api.ts:440)
```

**Root cause:** npm hoisting created two instances of `@midnight-ntwrk/wallet-sdk-address-format`:
- **Hoisted:** v3.1.2 at `/node_modules/@midnight-ntwrk/wallet-sdk-address-format/`
- **Nested:** v3.1.0 at:
  - `/node_modules/@midnight-ntwrk/wallet-sdk-dust-wallet/node_modules/@midnight-ntwrk/wallet-sdk-address-format/`
  - `/node_modules/@midnight-ntwrk/wallet-sdk-shielded/node_modules/@midnight-ntwrk/wallet-sdk-address-format/`
  - `/node_modules/@midnight-ntwrk/wallet-sdk-unshielded-wallet/node_modules/@midnight-ntwrk/wallet-sdk-address-format/`

`Symbol('MidnightBech32m')` creates a UNIQUE symbol per package instance (even with the same description string). The dust wallet's `Keys.js` imports `DustAddress` from its nested v3.1.0 and creates `new DustAddress(state.publicKey.publicKey)` — a v3.1.0 instance with v3.1.0's `Bech32mSymbol`. But `api.ts` imports `MidnightBech32m` from the hoisted v3.1.2, whose `Bech32mSymbol` is a DIFFERENT symbol. When `MidnightBech32m.encode` does `item[Bech32mSymbol_v3.1.2]`, it returns `undefined` on a v3.1.0 `DustAddress` (which has `Bech32mSymbol_v3.1.0`), causing `undefined.encode()` → TypeError.

The shielded address did NOT crash because `api.ts` constructs `new ShieldedAddress(coinPubKey, encPubKey)` from the hoisted v3.1.2 import — same version, same symbol.

**Fix applied to `counter-cli/src/api.ts`:**
1. Added `DustAddress` to the import from `@midnight-ntwrk/wallet-sdk-address-format` (the hoisted v3.1.2):
```typescript
import {
  DustAddress,
  MidnightBech32m,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from '@midnight-ntwrk/wallet-sdk-address-format';
```

2. Replaced the dust address encoding in `printWalletSummary`:
- Before: `MidnightBech32m.encode(networkId, state.dust.address).toString()`
- After: `DustAddress.encodePublicKey(networkId, state.dust.publicKey)`

This constructs a v3.1.2 `DustAddress` from the raw bigint public key (`state.dust.publicKey` → `state.publicKey.publicKey`), bypassing the mismatched v3.1.0 `DustAddress` from the wallet state.

**Commit:** `1d1aed7` on `main` branch in `/Workspace/apecsdev/midnight-counter-reference` (not pushed to GitHub — local only).

**If this issue appears in other Midnight projects:** Apply the same pattern — import the address class from the hoisted `@midnight-ntwrk/wallet-sdk-address-format` and construct a new instance from the raw public key, rather than using the wallet state's address object directly.

## VERIFIED COUNTER REFERENCE OUTPUT (2025-07-29 05:16-05:21)

### Wallet Summary
```
Wallet Overview Network: undeployed

Shielded (ZSwap)
  └─ Address: mn_shield-addr_undeployed1r020sfa7jllsz0z2wqhykz8npmphsu5223nsea7vjt9ekxs5almtvtnrpgpszud4uyd0yjrlqyp7v5xvwqljsng2g79j5w4al9c4kuqy0xtw4

Unshielded
  ├─ Address: mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s
  └─ Balance: 250,000,000,000,000 tNight

Dust
  └─ Address: mn_dust_undeployed1w0l54txthpu8q05j9j9ttk3j5dyu5766dc9zkz2s435vdglzwdr35dw790y

Dust tokens already available (1,250,000,000,000,000,000,000,000 DUST)
```

### Contract Deployment
```
Deployed contract at address: 0caec20dbd0dea08f64803087add6eb41eea8ace31ac5882e33012f1824d416c
```

### Contract Interaction
- Display before increment: `Current counter value: 0`
- Increment: Transaction `000ca32fd348dbc0d558e2ae471ab212d72a4a04d5fd9dcd27b6411001ba5a5fe0` added in block 53
- Display after increment: `Current counter value: 1`

### Increment Timing
- Start: 05:21:09.886
- Complete: 05:21:40.918
- Duration: ~31 seconds
- Explanation: ZK proof generation by the proof server (~25 seconds) + block inclusion (~6 seconds per block). This is expected for Midnight's privacy-preserving architecture.

## NEXT SESSION — HELLO WORLD

### Step 1: Find the hello world project
```bash
ls -la /Workspace/apecsdev/midnight-hello-official/ 2>/dev/null || ls -la /Workspace/apecsdev/midnight-hello-world/ 2>/dev/null || echo "Neither directory found — check /Workspace/apecsdev/ for the correct name"
```

### Step 2: Ensure environment is ready
```bash
mullvad lan set allow
node --version  # should be v22.23.1
```

### Step 3: Check for the same dual-package Symbol issue
If the hello world project uses `MidnightBech32m.encode` with wallet state address objects, it will hit the same Symbol mismatch. Check:
```bash
grep -rn 'MidnightBech32m.encode.*state\.' /Workspace/apecsdev/midnight-hello-official/src/ 2>/dev/null
```
If found, apply the same fix pattern (import the address class from the hoisted package and construct from raw public key).

### Step 4: Run the hello world project
Follow the project's README or package.json scripts. The standalone network setup should be similar to the counter reference.

## EPHEMERAL PATCHES (in counter-reference root node_modules — LOST on npm install)
These patches add verbose error logging. They are NOT required but help debugging.
1. `node_modules/@midnight-ntwrk/wallet-sdk-indexer-client/dist/effect/WsSubscriptionClient.js`: inspect-based error logging.
2. `node_modules/@midnight-ntwrk/wallet-sdk-unshielded-wallet/dist/v1/Sync.js` (and shielded + dust equivalents): inspect-based error logging.
3. `counter-cli/src/cli.ts`: `import * as util from 'util'` and `util.inspect(e, { depth: null })` in error handler.

## PACKAGE VERSIONS (Counter Reference)
- @midnight-ntwrk/wallet-sdk-address-format: 3.1.2 (hoisted), 3.1.0 (nested in dust/shielded/unshielded wallets)
- @midnight-ntwrk/wallet-sdk-dust-wallet: 3.0.0
- @midnight-ntwrk/wallet-sdk-facade: 3.0.0
- @midnight-ntwrk/wallet-sdk-hd: 3.0.2
- @midnight-ntwrk/wallet-sdk-shielded: 2.1.0
- @midnight-ntwrk/wallet-sdk-unshielded-wallet: 2.1.0
- indexer-standalone image: 4.0.0
- Node.js: v22.23.1
