# HANDOFF — Session 14

## STATUS: Deployment COMPLETE. Submission IN PROGRESS.

## What Was Accomplished (Session 13)
- Dust wallet sync completed (full ~1.36M chain)
- Age verification contract DEPLOYED to preprod
- Two verifyAge() calls confirmed on-chain
- README + cli.ts rebranded (Opalite Love -> Opalite)
- AGENTS.md updated with deployment results (issue 51)

## Deployment Results
- **Contract address:** 7842c12a360192c4505a002cf54a26904d7791589244a8161fb22d34c40a4199
- **Verify tx 1:** 003b2f9fd149154f3e555607df20c0482c7ecf4140d29ea0ad3951749218c7e231 (block 1917094)
- **Verify tx 2:** 00806c785a67a6ff79251a9f48c655d99c513ebebe1154a8bde5266d2ac2e6c763 (block 1917099)
- **Verified count:** 2

## Remaining Tasks for Level 1 Submission
1. **Screenshots** — Take fresh screenshots after rebrand, save to `docs/screenshots/`:
   - `compile.png` — compact compile output
   - `test.png` — pnpm test output (3 tests passing + rebranded BANNER)
   - `deploy.png` — CLI output with contract address + verified count
2. **Repo public** — Ensure github.com/APECSdev/opalite is public
3. **Codecov** — Add Codecov integration (badge already in README)
4. **Final commit** — Commit screenshots + any remaining changes
5. **Submit** — Submit to Rise In hackathon platform

## Key Commands
```bash
# Run tests (shows rebranded BANNER)
cd /Workspace/apecsdev/opalite/packages/contracts && pnpm test

# Compile contract (for screenshot)
cd /Workspace/apecsdev/opalite/packages/contracts && compact compile src/age_verification.compact src/managed/age_verification

# Start deploy CLI (to show deployed contract)
cd /Workspace/apecsdev/opalite/deploy-cli && npx tsx src/preprod.ts
# Choose <a href="https://blog.bookbaby.com/how-to-write/writing-tips/submissions" target="_blank" rel="noopener noreferrer" data-web-search-citation="true" data-web-search-result-index="1" aria-label="Source 2: What NOT to do when waiting for a response to your literary submission">[2]</a> Restore wallet from seed
# Paste seed: c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
# After sync: <a href="https://blog.bookbaby.com/how-to-write/writing-tips/submissions" target="_blank" rel="noopener noreferrer" data-web-search-citation="true" data-web-search-result-index="1" aria-label="Source 2: What NOT to do when waiting for a response to your literary submission">[2]</a> Join existing contract
# Paste address: 7842c12a360192c4505a002cf54a26904d7791589244a8161fb22d34c40a4199
# <a href="https://blog.bookbaby.com/how-to-write/writing-tips/submissions" target="_blank" rel="noopener noreferrer" data-web-search-citation="true" data-web-search-result-index="1" aria-label="Source 2: What NOT to do when waiting for a response to your literary submission">[2]</a> Display current verified count
```

## DO NOT
- DO NOT re-sync the wallet — sync is COMPLETE
- DO NOT deploy a new contract — use the existing one (address above)
- DO NOT change midnightDbName in config.ts — would orphan private state
- DO NOT re-diagnose solved issues (see AGENTS.md issues 1-51)

## Preprod Seed
c99dc572d08a9797d83069d87e4eaa88234f4b70a7c20ba51f40d4bb91576d21
