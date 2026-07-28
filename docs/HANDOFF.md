# 🤝 HANDOFF DOCUMENT

## 🚨 CRITICAL FINDING: Official Midnight Examples Are Broken

The official `midnightntwrk/midnight-hello-world` template does NOT work out of the box. Neither does the counter example in standalone mode without GHCR authentication.

---

## 🔴 ROOT CAUSE: Private GHCR Images

The Midnight wallet SDKs (`@midnight-ntwrk/wallet-sdk-*`) are compiled against Docker images in a **private** GitHub Container Registry (`ghcr.io/midnight-ntwrk/midnight-node:0.22.0`). The public Docker Hub images (`midnightntwrk/midnight-node:0.22.3`, `1.0.0`, etc.) are **different builds** and cause WebSocket `Abnormal Closure` errors during wallet sync.

The `testkit-js` library's `LocalTestEnvironmentBuilder` / `runTestEnvironment` has GHCR authentication baked in internally. External `docker compose` cannot pull these images (unauthorized).

---

## 🟢 WHAT THE COUNTER EXAMPLE ACTUALLY DOES

The counter example provides a `standalone.yml` compose file that uses `testcontainers` with internal GHCR auth — it does NOT pull images directly. The README says `npm run standalone` which calls `npm run standalone-ps` in `counter-cli/package.json`, which runs a CLI script that uses `LocalTestEnvironmentBuilder` from `@midnight-ntwrk/testkit-js`.

---

## 📂 Key Directories

| Path | Purpose |
|---|---|
| `/Workspace/apecsdev/midnight-hello-official` | Our testbed (official hello-world template) |
| `/Workspace/apecsdev/midnight-counter-official` | Counter reference (not installed, template only) |
| `/Workspace/apecsdev/opalite-love` | Main project repo |

---

## 📦 Current Dependencies Installed

From `package.json` (individual wallet packages, NOT monolithic):
- `@midnight-ntwrk/compact-runtime`: `0.16.0`
- `@midnight-ntwrk/ledger-v8`: `8.0.3` (resolutions forced)
- `@midnight-ntwrk/midnight-js-*`: `4.0.4`
- `@midnight-ntwrk/testkit-js`: `4.0.4`
- `@midnight-ntwrk/wallet-sdk-facade`: `3.0.0`
- `@midnight-ntwrk/wallet-sdk-dust-wallet`: `3.0.0`
- `@midnight-ntwrk/wallet-sdk-shielded`: `2.0.0`
- `@midnight-ntwrk/wallet-sdk-unshielded-wallet`: `2.0.0`

---

## 🔧 CURRENT BLOCKER: Wallet Sync WebSocket Abnormal Closure

### Symptom
```
API-WS: disconnected from ws://127.0.0.1:9944/: 1006:: Abnormal Closure
Wallet.Sync: [object Object]
```
Happens repeatedly. Wallet never syncs.

### What We've Tried
| Attempt | Result |
|---|---|
| Node `1.0.0` (Docker Hub, original) | FAIL — Abnormal Closure |
| Node `0.22.3` (Docker Hub) | FAIL — Abnormal Closure |
| Node `0.22.5` (Docker Hub) | FAIL — Abnormal Closure |
| Node `0.22.2` (Docker Hub) | FAIL — Abnormal Closure |
| Monolithic `wallet-sdk@1.2.0` | FAIL — Abnormal Closure |
| Individual wallet packages | FAIL — Abnormal Closure |
| Node `ghcr.io/midnight-ntwrk/midnight-node:0.22.0` | FAIL — GHCR unauthorized on docker pull |

### What The Wallet SDK Actually Expects
Found in `node_modules/@midnight-ntwrk/wallet-sdk-utilities/dist/testing/test-containers.js`:
```js
const container = new GenericContainer('ghcr.io/midnight-ntwrk/midnight-node:0.22.0')
```

---

## 🎯 PATH FORWARD: Use LocalTestEnvironmentBuilder

The counter example's `standalone.yml` references `LocalTestEnvironmentBuilder` which handles GHCR auth internally. We need to:

1. Rewrite `src/test/hw.test.ts` to use `LocalTestEnvironmentBuilder` from `@midnight-ntwrk/testkit-js` instead of the external compose.yml
2. Stop using `yarn env:up` / `yarn env:down` — let testcontainers manage everything
3. The test should spin up its own Docker containers with the correct GHCR images

---

## 📋 State to Preserve

- `contracts/hello-world.compact` — compiled successfully
- `contracts/managed/hello-world/` — compiled output
- `src/wallet.ts` — wallet provider using individual wallet packages
- `src/providers.ts` — provider builder
- `src/config.ts` — network configs
- `contracts/index.ts` — contract wrapper
- `compose.yml` — currently has Docker Hub images (won't be needed after migration)
- `package.json` — current dependencies with individual wallet packages
- `yarn.lock` — resolved lockfile

---

## 🎯 EXIT CRITERIA
- `yarn test:local` passes both tests (Deploys contract + Stores message)
- No WebSocket Abnormal Closure errors
- Tests use LocalTestEnvironmentBuilder internally (no external compose dependency)
