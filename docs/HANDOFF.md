# 🤝 HANDOFF DOCUMENT

## 🚀 Project Status
**Status:** Active Development — Level 1 deployment in progress
**Selected Idea:** Opalite — Private Dating on Midnight Network (Category: Other)
**Idea Submission:** Submitted, PENDING REVIEW
**Reference Repo:** /Workspace/apecsdev/Midnight-Privacy-Preserving-DID-System

---

## 📋 Current Blocker & Fix
**Blocker:** `TypeError: Cannot set property provableCircuits of #<Contract> which has only a getter`
**Root Cause:** `patchContract()` in `dist/deploy.js` adds a getter-only `provableCircuits` to the prototype. The compiled contract constructor (line 193) tries to SET `this.provableCircuits`, which fails.
**Fix (NOT YET APPLIED):**
```bash
cd /Workspace/apecsdev/Midnight-Privacy-Preserving-DID-System
sed -i 's/patchContract(mod.Contract);//' dist/deploy.js
npm run deploy
```

---

## 🔧 Environment Configuration
- `MIDNIGHT_NETWORK=preview` (only `preview` and `preprod` supported in environment.js)
- `DEBUG_LEVEL=debug`
- `WALLET_SEED` set in `.env` (64-char hex)
- `PROOF_SERVER_URL=http://127.0.0.1:6300`
- Proof server: `midnightntwrk/proof-server:8.1.0` running on port 6300 (DO NOT use `midnightnetwork/proof-server:latest` — it breaks sync)
- `compact-runtime@0.15.0` installed; contract files patched from `0.16.0` to `0.15.0`

---

## ✅ What Works
- Contracts compile (7 circuits across did-registry, schema-registry, credential-issuer, proof-verifier)
- Wallet sync completes on Preview network
- Proof server (8.1.0) is healthy
- Clean `npm install` required (rm -rf node_modules && npm install) for sync to work

---

## 📂 Key Paths
- Main project: `/Workspace/apecsdev/opalite-love`
- DID system (deployment source): `/Workspace/apecsdev/Midnight-Privacy-Preserving-DID-System`
- Compiled contracts: `contracts/managed/{did-registry,schema-registry,credential-issuer,proof-verifier}/contract/index.js`
- Deploy script: `dist/deploy.js` (compiled from `src/deploy.ts`)
- Network config: `dist/utils/environment.js`

---

## 🎯 Next Steps
1. Apply the `provableCircuits` fix (remove `patchContract` call)
2. Run `npm run deploy` — should deploy all 4 contracts to Preview
3. If successful, submit Level 1 — New Moon on the hackathon dashboard
4. Level 2: Wire contracts to ReactNative frontend, connect Lace wallet
5. Level 3: Polish dApp, add tests, CI/CD
