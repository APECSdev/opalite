# 🌙 Opalite — Idea Submission

## Category: Other

---

We're building Opalite: a dating experience that feels like Tinder, but where your privacy is the default — not an afterthought.

Swipe. Match. Chat. But here's the difference: your profile never touches a public database, your matches are sealed until mutual interest is confirmed, and only you decide what to reveal.

## How it works

- **Create a DID.** You register a Decentralized Identifier on the Midnight ledger — your digital presence, cryptographically yours, with zero personal data exposed on-chain. (Source: README — "Register DIDs: Create and manage decentralized identifiers on the Midnight ledger")
- **Your profile stays off-chain.** Your photos, bio, and preferences are stored as a private commitment. Only a cryptographic hash ever hits the public network. No plaintext profiles. No data leaks. (Source: README — "DIDs and credentials are represented as commitments on the public ledger, keeping sensitive identity data off-chain while maintaining verifiable integrity")
- **Mutual match unlocks the connection.** When two people swipe right on each other, a zero-knowledge proof verifies the match — confirming mutual interest without broadcasting who liked whom to the entire network. Profiles unlock, and a private chat is assigned. (Source: README — "Privacy-Preserving Verification: Holders can prove specific claims... using zero-knowledge witnesses without disclosing their actual... private data")
- **Chat freely.** End-to-end encrypted conversations tied to your DID. No server-side message storage. No ad network tracking.

## Why Midnight

Midnight's Compact smart contracts and selective disclosure let us build what traditional dating apps can't: a platform where real connections happen without turning your love life into a data commodity. Prove you're a real person without surrendering your identity. Prove you're compatible without exposing your life story.

Built with ReactNative for iOS and Android. Powered by Midnight's privacy-first infrastructure. Real connections. True privacy.
