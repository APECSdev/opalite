# AGENTS — Midnight Builder Challenge

## CRITICAL RULE
**ON EVERY NEW SESSION, READ `docs/HANDOFF.md` FIRST.**
**DO NOT ASK WHAT WE WERE DOING. DO NOT RE-DIAGNOSE SOLVED PROBLEMS.**

## Project
- **Repo:** /Workspace/apecsdev/midnight-counter-reference (official counter template, commit d7dd408)
- **Goal:** Deploy the counter contract on a local standalone network and interact with it.
- **Status:** BLOCKED — TypeError in printWalletSummary after successful wallet sync.

## Session History
- **Sessions 1-2 (previous agent):** Wasted 2 days on ECONNRESET. Never found root cause. Patched node_modules with inspect logging. Left no useful handoff.
- **Session 3:** Found and fixed Mullvad VPN kill switch blocking Docker bridge traffic. Identified remaining TypeError crash in printWalletSummary. Verified node/indexer/proof-server are all healthy.

## Current Blocker (ONE remaining issue)
TypeError in `printWalletSummary` (api.ts line 400) — `MidnightBech32m.encode` receives an address object where `item[Bech32mSymbol]` is undefined. A fresh genesis wallet on an undeployed network has no shielded/dust state, so the address object is incomplete. The crash is DOWNSTREAM of a successful sync.

## Key Files
- `counter-cli/src/cli.ts` — entry point, run() function, docker lifecycle (dockerEnv.up()/down())
- `counter-cli/src/api.ts` — wallet building, sync, printWalletSummary (line 400), buildWalletAndWaitForFunds (line 440)
- `counter-cli/src/standalone.ts` — testcontainers compose environment starter (NO dockerEnv.down() here — that is in cli.ts run() finally block)
- `counter-cli/src/config.ts` — StandaloneConfig with hardcoded localhost:8088/9944/6300 (overwritten at runtime by mapContainerPort to testcontainers mapped ports)
- `counter-cli/standalone.yml` — docker compose for node/indexer/proof-server with fixed container_name values and ephemeral port mapping (0:8088, 0:9944, 0:6300)

## Environment Requirements
- **Mullvad VPN: LAN sharing MUST be enabled** (`mullvad lan set allow`). Without this, host-to-Docker-bridge TCP is rejected by Mullvad's nftables kill switch, causing ECONNRESET on all published ports.
- Node.js v22.23.1
- Docker: standard bridge networking
- npm workspaces: root `node_modules/` holds all `@midnight-ntwrk/*` packages (hoisted from workspaces: counter-cli, contract)
- Versions: wallet-sdk-facade@3.0.0, wallet-sdk-indexer-client@1.2.0, indexer-standalone:4.0.0
