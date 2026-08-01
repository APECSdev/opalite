# HANDOFF — Session 15

## STATUS: Submission BLOCKED by Rise In platform. Contacting team.

## What Was Accomplished (Session 14)
- README + cli.ts fully rebranded (Opalite Love -> Opalite, social network)
- Deployment screenshots added to README (compile-and-tests, deploy)
- LICENSE changed to MIT (Copyright 2026 APECS Dev)
- CODECOV_TOKEN added to GitHub secrets (4da82909...)
- GitHub topics cleaned (removed "dating", added zero-knowledge, midnight-network)
- Fork created at nyusternie/opalite as submission workaround
- Rise In blocked: "Program is complete — cannot make changes"

## The Submission Problem
- Rise In OAuth app only requests "Access public information (read-only)" — no read:org scope
- APECSdev org had "Access restricted" policy — removed, still didn't help
- Revoked + re-authorized Rise In OAuth — still no org repos in dropdown
- Forked to nyusternie/opalite — same "Program is complete" error
- **Resolution:** Contact Rise In team directly for org repo submission guidance

## Contract Details (for Rise In submission)
- **Contract address:** 7842c12a360192c4505a002cf54a26904d7791589244a8161fb22d34c40a4199
- **Verify tx 1:** 003b2f9fd149154f3e555607df20c0482c7ecf4140d29ea0ad3951749218c7e231 (block 1917094)
- **Verify tx 2:** 00806c785a67a6ff79251a9f48c655d99c513ebebe1154a8bde5266d2ac2e6c763 (block 1917099)
- **Verified count:** 2
- **Repo:** https://github.com/APECSdev/opalite
- **Seed:** c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21

## Next Steps
1. Contact Rise In (Discord/support) — ask how to submit from a GitHub org
2. Provide contract address + repo link + screenshots
3. Once submitted, update AGENTS.md + HANDOFF.md with final status

## DO NOT
- DO NOT re-deploy the contract (existing one is verified)
- DO NOT re-sync the wallet (state is persisted)
- DO NOT change midnightDbName in config.ts
- DO NOT transfer the repo to a personal account (canonical repo is org)

## Preprod Seed
c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
