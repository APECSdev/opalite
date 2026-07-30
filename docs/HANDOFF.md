# HANDOFF — Opalite Love (Session 6)

## STATUS: WEB WHITEPAPER COMPLETE. READY TO SUBMIT HACKATHON REVISION.

The dynamic PDF whitepaper system is fully operational and live. The landing page has been refactored to use shared layouts, and all branding/SEO assets are wired in. 

### IMMEDIATE NEXT STEP: Submit the Hackathon Revision

The team provided feedback that the original submission was "too generic" and didn't explain the architecture or ZK usage. We drafted a comprehensive, plain-text revision that addresses all feedback points (ZK age verification, uniqueness, hidden matching, Filecoin/Nostr architecture).

**Please submit the following text to the hackathon platform:**

```text
Opalite Love — Privacy-Preserving Dating on Midnight Network

Project: https://opalite.love
Tagline: Swipe right, reveal later — powered by Zero-Knowledge proofs.

OVERVIEW

Opalite Love is a privacy-first dating app where zero-knowledge proofs protect user identity, hide individual swipe decisions, and verify trust attributes — all without exposing underlying personal data. Unlike conventional dating apps that store plaintext profiles and swipe histories on centralized servers, Opalite Love uses Midnight Network's ZK-native smart contracts to ensure that personal data never appears on-chain, individual likes remain hidden unless both users match, and trust/safety checks (age, uniqueness, reputation) are proven cryptographically rather than self-attested.

HOW MIDNIGHT & ZK ARE USED

1. ZK-Based Age Verification

What stays private: The user's actual birthdate, government ID, and full identity.
What is proven: A boolean — "this user is 18 or older."

A user completes identity verification with a trusted attestation provider (e.g., a government ID check via a third-party KYC service). The provider issues a signed attestation containing the user's verified birthdate. The user's device generates a ZK proof locally that takes the attested birthdate as a private witness and the current date as a public input, outputting only is_over_18: true or false. This proof is submitted to a Midnight smart contract. The contract validates the ZK proof and the attestation signature — but the birthdate itself never appears on-chain, never leaves the device, and is never visible to other users or the platform.

2. Proof of Uniqueness (One Person, One Account)

What stays private: The user's underlying identity.
What is proven: "This user has not already registered an account."

On registration, the user derives an identity commitment from their attested identity (using a Pedersen hash or similar). This commitment is submitted to a Midnight smart contract as a nullifier. The ZK proof verifies that:
- The commitment was derived from a valid, attested identity (private input)
- The commitment has not been seen before on-chain (checked against contract state)

This prevents duplicate/bot accounts without revealing who the user is. The on-chain record is an opaque hash — no name, no photo, no demographic data.

3. Privacy-Preserving Location Range

What stays private: The user's exact GPS coordinates.
What is proven: "This user is within X km of that user."

Each user submits their approximate location as a geohash or grid cell ID (not raw coordinates). A ZK circuit takes both users' grid cells as private inputs and outputs only within_range: true or false. Users see potential matches as "within 25 km" — never the exact distance or location. This prevents doxxing and stalking while still enabling proximity-based matching.

4. Mutual Matching with Hidden Likes (Core ZK Feature)

What stays private: Individual swipe decisions. No user can see who liked them unless there is a mutual match.
What is proven: "Both users swiped right on each other."

This is the heart of Opalite Love's privacy model:

Step 1 — Swipe commitment: When User A swipes right on User B, A's device generates a ZK proof that commits to "A likes B" using a nullifier derived from both user IDs. This commitment is submitted to a Midnight smart contract. The on-chain record reveals nothing — it's an opaque hash. User B cannot tell they were liked.

Step 2 — Match verification: When User B swipes right on User A, B's device generates a matching commitment. The Midnight smart contract's ZK circuit checks whether both commitments correspond to the same pair (A, B) and both are "like" commitments. If both conditions are true, the contract emits a Match event containing only a shared match ID — not who matched with whom.

Step 3 — Match notification: Only at this point are both users notified via push notification. The match proof unlocks a shared encryption key (derived from the match circuit) that both users can use to decrypt each other's profiles and initiate encrypted chat.

Result: The blockchain records only "a match occurred between two anonymous commitments." Individual likes, rejections, and swipe patterns are never publicly visible. You cannot be rejected publicly. You cannot be stalked by someone who knows you liked them.

5. Private Reporting & Reputation

What stays private: The reporter's identity and the specific evidence.
What is proven: "This report is from a verified, unique user and meets the threshold for review."

When a user reports another user (e.g., for harassment or catfishing), they submit a ZK proof to a reputation smart contract. The proof verifies:
- The reporter is a registered, unique user (using the same identity nullifier from registration)
- The reporter has not already filed a duplicate report against the same user (nullifier prevents spam reports)
- The report category matches a valid policy violation type

The contract accumulates reputation signals privately. If a user accumulates enough verified reports, their reputation score drops below a threshold, and they are flagged for review or automatically hidden from matching. No one can see who reported whom, how many reports exist, or the specific evidence — only the aggregate outcome (flagged or not flagged).

TRUST & SAFETY FEATURES

Feature: Age verification
ZK Mechanism: ZK proof over attested date of birth
What's Hidden: Actual birthdate, ID document
What's Proven: "18+ verified"

Feature: Proof of uniqueness
ZK Mechanism: Identity nullifier commitment
What's Hidden: Full identity
What's Proven: "One account per person"

Feature: Location range
ZK Mechanism: ZK circuit over geohash pairs
What's Hidden: Exact GPS coordinates
What's Proven: "Within X km"

Feature: Mutual matching
ZK Mechanism: Dual-commitment ZK match circuit
What's Hidden: Individual swipe decisions
What's Proven: "Both swiped right"

Feature: Private reporting
ZK Mechanism: Nullifier-based report proof
What's Hidden: Reporter identity and evidence
What's Proven: "Verified report from unique user"

Feature: Reputation scoring
ZK Mechanism: Aggregate private state
What's Hidden: Individual report details
What's Proven: "Trust score above/below threshold"

ARCHITECTURE: WHERE DATA LIVES

ON-CHAIN (Midnight Network)
- Identity commitments (nullifier hashes — no PII)
- Age verification proof results (boolean only)
- Swipe commitments (opaque hashes)
- Match events (shared match ID only — no participant identities)
- Reputation contract state (aggregate scores — no report details)
- Content hash references to encrypted profile blobs (IPFS CIDs)

All on-chain data is either a ZK proof output, a hash/commitment, or a boolean flag. No plaintext personal data, photos, bios, names, or locations appear on-chain.

OFF-CHAIN (Encrypted Storage)

Encrypted profile data (photos, bio, demographics):
Stored on IPFS with Filecoin as a pinning/storage option for persistence guarantees. Only the CID is referenced on-chain. The profile blob is encrypted with a key derived from the user's identity. Upon mutual match, the match circuit derives a shared key that unlocks the counterparty's profile for decryption. Filecoin ensures long-term storage availability without relying on a single centralized pinning provider.

Encrypted chat messages:
Chat uses Nostr (Notes and Other Stuff Transmitted by Relays) for decentralized, censorship-resistant messaging. Messages are end-to-end encrypted using NIP-04 or NIP-17 encrypted direct message standards, with encryption keys derived from the match proof (both users derive the same shared secret from the ZK match circuit). Messages are stored on Nostr relays as ciphertext — neither the relays, the platform, nor Midnight validators can read chat content. Users can run their own relays for additional privacy, or rely on public Nostr relays for convenience.

Identity attestation cache:
The user's verified identity attestation (from KYC provider) is stored locally on-device only. It never leaves the user's phone except as a ZK proof input (which is not revealed on-chain).

MOBILE APP (Client-Side)
- ZK proof generation runs on-device (using WASM-compiled circuits) — private witnesses never leave the phone
- Wallet integration via Midnight wallet SDK
- Local key management for profile/chat encryption
- Nostr keypair management for encrypted direct messages
- Push notifications for match alerts (notification payload contains only "You have a new match" — no identity info)

WHY THIS IS MIDNIGHT-NATIVE (NOT JUST "TINDER + ENCRYPTION")

1. ZK proofs are first-class, not bolted on. Age verification, uniqueness, location range, and mutual matching all use ZK circuits as the core mechanism — not as an afterthought. The proofs are validated by Midnight smart contracts, not by a trusted server.

2. Likes are hidden by default, not by policy. Conventional dating apps store likes in a database and promise not to show them. Opalite Love hides likes cryptographically — the blockchain records only opaque commitments. No server admin, no data breach, no subpoena can reveal who liked whom unless there is a mutual match.

3. Trust is proven, not self-attested. Age, uniqueness, and reputation are all ZK-verified on-chain. A user cannot lie about their age or create multiple accounts without breaking the ZK proof. This is fundamentally different from "I checked a box saying I'm 18."

4. Decentralized attestation, not platform trust. Identity verification comes from independent KYC providers, and the proof is verified by Midnight's consensus — not by Opalite Love's servers. The platform cannot manipulate who passes verification.

5. Censorship-resistant matching. Match events are recorded on Midnight's blockchain. The platform cannot silently suppress matches, shadowban users, or manipulate the matching algorithm without it being visible on-chain.

TECHNICAL STACK

- Blockchain: Midnight Network (Compact smart contracts, ZK proof system)
- Smart Contracts: Compact language — identity registry, swipe commitment, match verification, reputation
- ZK Circuits: Proof of age, proof of uniqueness, proof of location range, dual-commitment match proof, report nullifier proof
- Off-chain profile storage: IPFS with Filecoin for persistent pinning (encrypted profile blobs)
- Chat/messaging: Nostr (NIP-04/NIP-17 encrypted direct messages over decentralized relays)
- Mobile app: React Native (Android first, iOS to follow), on-device ZK proof generation via WASM
- Wallet: Midnight wallet SDK (FluentWalletBuilder for testnet, mobile wallet integration for production)
- Identity attestation: Third-party KYC provider (e.g., Persona, Onfido) → signed attestation → ZK proof input

CURRENT STATUS & MILESTONES

- Landing page: Live at https://opalite.love
- Testnet: Local Midnight standalone network (dockerized node, indexer, proof-server) — contract deployment and interaction validated
- iOS: TestFlight waitlist open

Primary Milestone (In Development):
- Android APK: The mobile app is currently in active development. The core ZK circuits for age verification and mutual matching are being implemented and tested against the Midnight standalone network. The Android APK will be the first release target, followed by iOS TestFlight.

Next milestone: Deploy ZK circuits for age verification and mutual matching on Midnight testnet, then integrate with the mobile app for end-to-end testing of the swipe → match → chat flow.
```

---

### Recent Technical Work Completed (Session 6)

1. **Hackathon Feedback Addressed:** Drafted the comprehensive plain-text revision included above. It details ZK usage, architecture (Filecoin/Nostr), and trust/safety features.
2. **Dynamic PDF Whitepaper:** Implemented `whitepaper.pdf.ts` using `jspdf`. It reads from `src/data/whitepaper/content.ts` and renders a multi-page PDF with cover, TOC, and figures.
3. **Custom Fonts:** Wired `OpaliteTitle.ttf` (Poppins Bold) and `OpaliteBody.ttf` (Lato) into the PDF generator.
4. **Layout Refactor:** Created `Base.astro`, `Nav.astro`, `Footer.astro`. Refactored `index.astro` to use them. Cleaned up refactoring artifacts.
5. **Branding/SEO:** Generated and wired in OpenGraph banner (`og-image.png`) and favicons (`favicon.ico/png/svg`). Updated `Nav.astro` to use the larger, title-case "Opalite Love" logo.
