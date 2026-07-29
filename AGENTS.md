# AGENTS — Midnight Builder Challenge

## CRITICAL RULE
**ON EVERY NEW SESSION, READ `docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project Status (2025-07-29)
- **Counter Reference:** WORKING — contract deployed and interacted successfully on local standalone network.
- **Next Target:** `midnight-hello-official` or `midnight-hello-world` (one of these is the next project to get working for the hackathon entry).
- **Repo paths:**
  - Counter: `/Workspace/apecsdev/midnight-counter-reference` (official counter template, commit d7dd408 + 1 fix commit)
  - Hello: `/Workspace/apecsdev/midnight-hello-official` (NOT YET STARTED — check this directory first)
  - Notes: `/Workspace/apecsdev/opalite-love` (this repo — AGENTS.md and docs/HANDOFF.md live here)

## Session History
- **Sessions 1-2 (previous agent):** Wasted 2 days on ECONNRESET. Never found root cause. Patched node_modules with inspect logging. Left no useful handoff.
- **Session 3:** Found and fixed Mullvad VPN kill switch blocking Docker bridge traffic. Identified remaining TypeError crash in printWalletSummary. Verified node/indexer/proof-server are all healthy.
- **Session 4:** Diagnosed TypeError as npm dual-package Symbol identity mismatch (wallet-sdk-address-format v3.1.0 nested in dust-wallet vs v3.1.2 hoisted). Fixed by importing DustAddress from hoisted v3.1.2 and using DustAddress.encodePublicKey. Counter contract deployed and interacted successfully.

## Solved Issues (DO NOT RE-DIAGNOSE)
1. **ECONNRESET / socket hang up** — Mullvad VPN nftables kill switch blocks host-to-Docker-bridge TCP. Fix: `mullvad lan set allow`.
2. **TypeError: Cannot read properties of undefined (reading 'encode')** — npm hoisting created two instances of wallet-sdk-address-format (v3.1.0 nested, v3.1.2 hoisted). Symbol('MidnightBech32m') is unique per instance. Fix: Use DustAddress.encodePublicKey from the hoisted version.

## Key Files (Counter Reference — for reference only, this project is DONE)
- `counter-cli/src/api.ts` — wallet building, sync, printWalletSummary (line 400), buildWalletAndWaitForFunds (line 441)
- `counter-cli/src/cli.ts` — entry point, run() function, docker lifecycle
- `counter-cli/src/standalone.ts` — testcontainers compose environment starter
- `counter-cli/src/config.ts` — StandaloneConfig with hardcoded localhost ports
- `counter-cli/standalone.yml` — docker compose for node/indexer/proof-server

## Environment Requirements (APPLY TO ALL MIDNIGHT PROJECTS)
- **Mullvad VPN: LAN sharing MUST be enabled** (`mullvad lan set allow`). Without this, host-to-Docker-bridge TCP is rejected by Mullvad's nftables kill switch, causing ECONNRESET on all published ports.
- Node.js v22.23.1
- Docker: standard bridge networking
- npm workspaces: root `node_modules/` holds all `@midnight-ntwrk/*` packages (hoisted)

## Known Midnight SDK Version Issue
`wallet-sdk-address-format` has a dual-package hazard due to npm hoisting:
- Hoisted version: 3.1.2
- Nested in wallet-sdk-dust-wallet, wallet-sdk-shielded, wallet-sdk-unshielded-wallet: 3.1.0
- Symbol('MidnightBech32m') is unique per package instance, causing mismatch when wallet state objects (from nested v3.1.0) are passed to MidnightBech32m.encode (from hoisted v3.1.2).
- If this issue appears in other Midnight projects, the fix pattern is: import the address class (DustAddress, ShieldedAddress, etc.) from the hoisted package and construct a new instance from the raw public key, rather than using the wallet state's address object directly.

## Midnight Transaction Timing
- Contract interactions take ~25-35 seconds due to ZK proof generation by the proof server.
- Block production: ~6 seconds per block.
- This is expected behavior, not a performance bug.
