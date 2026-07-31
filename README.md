<div align="center">

<img src="packages/web/public/favicon.png" width="64" alt="Opalite Love" />

# 🌙 Opalite — Private Dating on Midnight Network

[![codecov](https://codecov.io/gh/APECSdev/opalite-love/branch/master/graph/badge.svg)](https://codecov.io/gh/APECSdev/opalite-love)
![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.7.0-F69220?logo=pnpm&logoColor=white)
![Midnight](https://img.shields.io/badge/Midnight-preprod-6B4FBA)
![License](https://img.shields.io/github/license/APECSdev/opalite-love)
![GitHub last commit](https://img.shields.io/github/last-commit/APECSdev/opalite-love)

**Swipe right, reveal later.**

Real connections. True privacy.

</div>

---

We're building Opalite: a dating experience that feels like Tinder, but where your privacy is the default — not an afterthought.

Swipe. Match. Chat. But here's the difference: your profile never touches a public database, your matches are sealed until mutual interest is confirmed, and only you decide what to reveal.

---

## How it Works

- **Create a DID.** You register a Decentralized Identifier on the Midnight ledger — your digital presence, cryptographically yours, with zero personal data exposed on-chain.
- **Your profile stays off-chain.** Your photos, bio, and preferences are stored as a private commitment. Only a cryptographic hash ever hits the public network. No plaintext profiles. No data leaks.
- **Mutual match unlocks the connection.** When two people swipe right on each other, a zero-knowledge proof verifies the match — confirming mutual interest without broadcasting who liked whom to the entire network. Profiles unlock, and a private chat is assigned.
- **Chat freely.** End-to-end encrypted conversations tied to your DID. No server-side message storage. No ad network tracking.

## Why Midnight

Midnight's Compact smart contracts and selective disclosure let us build what traditional dating apps can't: a platform where real connections happen without turning your love life into a data commodity. Prove you're a real person without surrendering your identity. Prove you're compatible without exposing your life story.

## Tech Stack

- **Clients:** React Native (iOS & Android)
- **Protocol:** Midnight Network
- **Contracts:** Compact (DID Registry, Credential Issuer, Proof Verifier, Schema Registry)
- **Identity:** Decentralized Identifiers with zero-knowledge proofs
- **Web:** Astro + Tailwind CSS
- **Runtime:** Node.js 24 LTS, pnpm 10.7.0

## Project Structure

| Directory | Description |
|---|---|
| `packages/contracts/` | Midnight Compact smart contracts (age verification) |
| `packages/web/` | Astro + Tailwind website and whitepaper |
| `deploy-cli/` | Custom deployment CLI for Midnight preprod |
| `docs/` | Handoff documents and session notes |

## Age Verification Contract

Our first contract implements privacy-preserving age verification on Midnight:

- **Ledger state:** `verifiedCount` (Counter) — tracks total verifications
- **Circuit:** `verifyAge()` — increments the counter via a zero-knowledge proof
- **Private state:** Shielded — the count is visible but individual verifications are not

```bash
# Compile the contract
compact compile src/age_verification.compact src/managed/age_verification

# Run tests
pnpm test
```

## Getting Started

```bash
# Clone and install
git clone https://github.com/APECSdev/opalite-love.git
cd opalite-love
nvm use 24
pnpm install

# Start the proof server (required for deployment)
docker compose -f deploy-cli/proof-server.yml up -d

# Run the deploy CLI
cd deploy-cli
npx tsx src/preprod.ts
```

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built for the [Rise In — New Moon to Full](https://www.risein.com/) hackathon.

<div align="center">

Real connections. True privacy.

</div>
