# Opalite Love — Age Verification Contract

## Product Idea

Opalite Love is a privacy-first dating app built on Midnight Network where zero-knowledge proofs protect user identity, hide individual swipe decisions, and verify trust attributes. Users prove they are 18+ without revealing birthdates, prove account uniqueness without exposing identity, and match with others via a dual-commitment ZK circuit that only reveals mutual interest — never one-sided likes. This contract is the first component: an on-chain age verification registry that tracks verified users via a public counter.

## Public State vs Private Witness

| Concept | In This Contract |
|---------|-----------------|
| **Public Ledger State** | `verifiedCount: Counter` — a public counter tracking the number of age-verified users, visible on-chain |
| **Private Witness** | The user's actual birthdate — would be passed as a private input to the ZK circuit; never stored on-chain or disclosed |
| **What's Proven** | That the user is 18 or older (a boolean result) |
| **What's Hidden** | The actual birthdate, government ID, and full identity |

The Compact contract uses `export ledger` to declare public state that all validators can see. In a full implementation, the `verifyAge` circuit would accept the birthdate as a private witness, compute `currentDate - birthdate >= 6570` inside the ZK circuit, and use `disclose()` to publish only the boolean result — never the raw birthdate. Midnight's validators verify the proof without ever seeing the underlying data.

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Compile the Compact contract
npm run compact

# 3. Run tests
npm test
```

## Tech Stack

- **Language:** Compact (Midnight's smart contract language)
- **Compiler:** compactc v0.31.1 (language version 0.23.0)
- **Runtime:** @midnight-ntwrk/compact-runtime
- **Testing:** Vitest with on-chain simulator
- **Target:** Midnight Preview/Preprod network
