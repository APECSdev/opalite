# 🤝 HANDOFF DOCUMENT

## 🚀 Project Status
**Status:** Active Development — Switching to Official Standalone Local Devnet
**Selected Idea:** Opalite — Private Dating on Midnight Network (Category: Other, PENDING REVIEW)

---

## 🔄 PIVOT: Starting Fresh with Official Midnight Examples

We abandoned the broken DID System repo (by Kanasjnr) and are now starting from the **official** midnightntwrk examples to establish a working baseline, then we'll migrate our DID contracts to it.

---

## 📂 Key Directories

| Path | Purpose |
|---|---|
| `/Workspace/apecsdev/opalite-love` | Our project repo (pushed to GitHub) |
| `/Workspace/apecsdev/midnight-hello-official` | **OFFICIAL** hello-world example — OUR NEW BASELINE |
| `/Workspace/apecsdev/midnight-counter-official` | Official counter example (reference only) |
| `/Workspace/apecsdev/Midnight-Privacy-Preserving-DID-System` | BROKEN DID system — ABANDONED |
| `/Workspace/apecsdev/midnight-hello-world` | Old broken hello-world — ABANDONED |

---

## 🟢 WHAT WORKS (hello-official)

- **Docker environment** (`yarn env:up`) — all 3 services healthy:
  - `midnight-node:1.0.0` on port 9944
  - `indexer-standalone:4.3.3` on port 8088
  - `proof-server:8.1.0` on port 6300
- **Contract compiled:** `hello-world.compact` → `contracts/managed/hello-world/`
  - 1 circuit: `storeMessage` (k=6, rows=26)
- **Dependencies installed:** `yarn install` completed

---

## 🔴 CURRENT BLOCKER: Node 1.0.0 WebSocket Incompatibility

### Symptom
`yarn test:local` fails. Wallet sync gets `Abnormal Closure` on `ws://127.0.0.1:9944/` repeatedly.

### Diagnosis
- Node IS healthy (producing blocks, health endpoint returns OK)
- `{"peers":0,"isSyncing":false,"shouldHavePeers":false}`
- The wallet SDK (`@midnight-ntwrk/wallet-sdk@1.2.0`) can't maintain a WebSocket connection to `midnight-node:1.0.0`
- The official counter example uses **older** images: `midnight-node:0.22.3` + `indexer-standalone:4.0.0`

### Version Comparison

| Component | Official Counter (working) | Hello Official (BROKEN) |
|---|---|---|
| Node | `0.22.3` | `1.0.0` |
| Indexer | `4.0.0` | `4.3.3` |
| Proof Server | `8.0.3` | `8.1.0` |
| Wallet SDK | — | `1.2.0` |

### Likely Fix
Change `compose.yml` to use the older images that match what the SDKs expect:
```yaml
node:
  image: 'midnightntwrk/midnight-node:0.22.3'
  # ...
indexer:
  image: 'midnightntwrk/indexer-standalone:4.0.0'
  # ...
proof-server:
  image: 'midnightntwrk/proof-server:8.0.3'
```

---

## 📋 Full Setup Commands (for fresh session)

```bash
# 1. Verify prerequisites
docker --version # 28.1.1
node --version # v24.14.0
compact --version       # 0.5.1

# 2. Go to official example
cd /Workspace/apecsdev/midnight-hello-official

# 3. Ensure contract exists
cat > contracts/hello-world.compact << 'EOC'
pragma language_version 0.23;

export ledger message: Opaque<"string">;

export circuit storeMessage(newMessage: Opaque<"string">): [] {
  message = disclose(newMessage);
}
EOC

# 4. Compile
yarn compile

# 5. Edit compose.yml — change node image from 1.0.0 to 0.22.3,
#    indexer from 4.3.3 to 4.0.0, proof-server from 8.1.0 to 8.0.3

# 6. Start Docker environment
yarn env:up

# 7. Run test
yarn test:local
```

---

## 🎯 EXIT CRITERIA
- `yarn test:local` passes both tests (Deploys contract + Stores Hello World!)
- Local devnet fully functional
- THEN: Migrate our DID contracts (did-registry, schema-registry, credential-issuer, proof-verifier) to this working baseline

---

## 📝 Notes
- The hello-world repo uses **local pre-funded wallets** (seed: `0000...0001`...`0003`)
- No faucet needed on local network
- `yarn env:up` / `yarn env:down` manage Docker
- Container names: `midnight-hello-official-node-1`, `midnight-hello-official-proof-server-1`, `midnight-hello-official-indexer-1`
- Port conflicts cleaned up: old `midnight-proof-server` and `midnight-hello-world-node` containers removed
