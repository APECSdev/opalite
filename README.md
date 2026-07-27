# 🌙 Opalite — Private Dating on Midnight Network

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

- **Clients:** ReactNative (iOS & Android)
- **Protocol:** Midnight Network
- **Contracts:** Compact (DID Registry, Credential Issuer, Proof Verifier, Schema Registry)
- **Identity:** Decentralized Identifiers with zero-knowledge proofs

## Project Structure

- `contracts/` — Midnight Compact smart contracts
- `src/` — TypeScript application logic using the Midnight SDK
- `docs/` — Handoff documents and Idea Submission

---

Built for the [Rise In — New Moon to Full](https://www.risein.com/) hackathon.

Real connections. True privacy.
