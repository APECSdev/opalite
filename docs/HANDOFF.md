# HANDOFF — Opalite Love (Session 7)

## STATUS: LEVEL 1 NEW MOON — ALMOST COMPLETE. ONLY DEPLOYMENT REMAINING.

The Compact contract is written, compiled, tested, documented, and committed. The ONLY remaining task for Level 1 is deploying to Preview/Preprod and taking a screenshot of the contract address.

### Level 1 Submission Checklist

| Requirement | Status |
|---|---|
| Toolchain installed | DONE — compact CLI v0.5.1, Node 22, Docker |
| Contract compiles via compact compile | DONE |
| Passing test suite | DONE — 3 tests pass |
| managed/ directory present (circuits + keys) | DONE |
| 5 meaningful commits | DONE — 6 commits total |
| Product idea in README | DONE |
| Setup instructions in README | DONE |
| Public state vs private witness in README | DONE |
| Compile screenshot | DONE — screenshots/compile-and-tests.png |
| Contract deployed to Preview/Preprod | **NEXT — NOT DONE** |
| Deploy screenshot with address | **NEXT — NOT DONE** |

### What Was Accomplished (Session 7)

1. Toolchain Setup: Verified Node 22, Docker, compact CLI v0.5.1 (language v0.23.0, compiler v0.31.1)
2. Compact Contract Written: packages/contracts/src/age_verification.compact — uses export ledger verifiedCount: Counter and export circuit verifyAge(): []
3. Contract Compiled: compact compile src/age_verification.compact src/managed/age_verification — generates ZK circuits, proving/verification keys, TypeScript definitions
4. Test Suite Created: Adapted from midnight-counter-official reference project. Uses AgeVerificationSimulator class with @midnight-ntwrk/compact-runtime. 3 tests: deterministic initial state, proper initialization, correct increment.
5. Dependencies Installed: @midnight-ntwrk/compact-runtime@0.16.0, @midnight-ntwrk/midnight-js-network-id@4.1.1, vitest@^4.1.0, typescript@^6.0.2
6. README Created: Product idea, public vs private witness table, setup instructions, tech stack
7. Screenshots Captured: Compile + test output screenshot saved to screenshots/compile-and-tests.png
8. 6 Git Commits Made: contract, managed artifacts, tests, project config, README, screenshot

### IMMEDIATE NEXT STEP: Deploy to Preview/Preprod

The reference project at /Workspace/apecsdev/midnight-counter-reference/ has a counter-cli/ directory with deployment code for Preprod.

### PICKUP INSTRUCTIONS FOR NEXT-YOU

Step 1: Examine the reference deployment files:
  cat /Workspace/apecsdev/midnight-counter-reference/counter-cli/src/config.ts
  cat /Workspace/apecsdev/midnight-counter-reference/counter-cli/src/api.ts
  cat /Workspace/apecsdev/midnight-counter-reference/counter-cli/src/preprod-local.ts
  cat /Workspace/apecsdev/midnight-counter-reference/counter-cli/proof-server-preprod.yml
  cat /Workspace/apecsdev/midnight-counter-reference/counter-cli/package.json

Step 2: Create a simplified deployment script in packages/contracts/scripts/deploy.ts
  - Adapt from the reference counter-cli deployment code
  - Use @midnight-ntwrk/midnight-js and wallet SDK packages
  - Connect to Preprod network
  - Deploy the age verification contract
  - Print the contract address

Step 3: Install additional deployment dependencies if needed:
  cd packages/contracts
  npm install @midnight-ntwrk/midnight-js@4.1.1 @midnight-ntwrk/wallet-sdk-facade@3.0.0

Step 4: Start proof server via Docker:
  docker run -d --name midnight-proof-server -p 6300:6300 midnightnetwork/proof-server:latest

Step 5: Run deployment:
  npx tsx scripts/deploy.ts

Step 6: Take screenshot of contract address output -> screenshots/deploy.png

Step 7: Add deployment address to README

Step 8: Commit and push:
  git add scripts/ screenshots/deploy.png README.md package.json package-lock.json
  git commit -m 'feat(contracts): deploy age verification contract to Preprod'
  git push origin master

Step 9: Submit on the hackathon platform — connect GitHub repo and submit for Level 1

### Key Discoveries (Session 7)

1. Compact has no contract block — everything is top-level with export ledger and export circuit
2. let is reserved but not implemented in Compact 0.23.0 — inline expressions directly
3. Unknown parameter types — could not get any type name to work for circuit parameters (Z, Bool, number, Natural, Bit, Int, boolean all fail). The Counter type from CompactStandardLibrary works for ledger state. Currently the contract has no parameters.
4. Compile target is a named subdirectory — compact compile src/file.compact src/managed/name (not just managed/)
5. Test simulator pattern — copy from reference project and use sed to replace names. Import from ../managed/<name>/contract/index.js, use impureCircuits.<circuitName>() to call circuits.
6. Reference projects available at /Workspace/apecsdev/midnight-counter-official/ and /Workspace/apecsdev/midnight-counter-reference/
7. The reference project uses wallet SDK packages: wallet-sdk-facade, wallet-sdk-shielded, wallet-sdk-unshielded-wallet, wallet-sdk-dust-wallet, wallet-sdk-hd, wallet-sdk-address-format
8. The agent.md in the reference project documents a signRecipe bug workaround in wallet-sdk-unshielded-wallet that may be needed for deployment

### Git Log (Session 7 Commits)

  f392e18 docs(contracts): add compile and test screenshots for Level 1 submission
  444a452 docs(contracts): add README with product idea, public vs private witness explanation
  1aca383 chore(contracts): configure project with TypeScript, vitest, and Midnight runtime deps
  145e9cc test(contracts): add age verification test suite with on-chain simulator (3 tests passing)
  dc074ef build(contracts): compile age_verification contract — ZK circuits and proving keys generated
  c4f0aff feat(contracts): add age verification Compact contract with public ledger state

### The Compact Contract (for reference)

  pragma language_version >= 0.20;
  import CompactStandardLibrary;
  export ledger verifiedCount: Counter;
  export circuit verifyAge(): [] {
      verifiedCount.increment(1);
  }
