import type { Figure } from '../types';

// Fuchsia Color Scheme
const FUCHSIA     = [217, 70, 239] as const;  // #D946EF
const FUCHSIA_D   = [192, 38, 211] as const;  // #C026D3
const MIDNIGHT    = [30, 41, 59] as const;    // Dark slate for blockchain
const OFFCHAIN    = [100, 116, 139] as const; // Slate gray for IPFS/Nostr
const INK         = [15, 15, 15] as const;
const LIGHT       = [240, 240, 245] as const;
const AXIS        = [102, 102, 115] as const;

export const architectureDiagram: Figure = {
  kind: 'figure',
  caption:
    'Figure: System architecture. The Mobile App (client) generates ZK proofs ' +
    'and submits them to Midnight Network. Profile data is stored encrypted on ' +
    'IPFS/Filecoin, and chats flow through Nostr relays.',
  height: 180,

  draw: ({ doc, x, y, width }) => {
    const dr = (c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);
    const fl = (c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const tx = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const ctext = (t: string, cx: number, ty: number) =>
      doc.text(t, cx - doc.getTextWidth(t) / 2, ty);

    // --- layout ---
    const padT = 10;
    const boxH = 70;
    const boxY = y + padT;
    const boxW = (width - 80) / 3;  // 3 boxes with gaps
    const gap = 40;
    const leftX = x;
    const midX = x + boxW + gap;
    const rightX = x + 2 * (boxW + gap);
    const cy = boxY + boxH / 2;

    // --- Mobile App box (left, fuchsia border) ---
    fl(LIGHT);
    dr(FUCHSIA);
    doc.setLineWidth(1.5);
    doc.roundedRect(leftX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    tx(FUCHSIA_D);
    ctext('Mobile App', leftX + boxW / 2, cy - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('On-device ZK proofs', leftX + boxW / 2, cy + 8);
    ctext('WASM circuits', leftX + boxW / 2, cy + 20);

    // --- Midnight Network box (center, dark border) ---
    fl(LIGHT);
    dr(MIDNIGHT);
    doc.setLineWidth(1.5);
    doc.roundedRect(midX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    tx(MIDNIGHT);
    ctext('Midnight Network', midX + boxW / 2, cy - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('ZK Smart Contracts', midX + boxW / 2, cy + 8);
    ctext('Compact language', midX + boxW / 2, cy + 20);

    // --- Off-Chain box (right, slate border) ---
    fl(LIGHT);
    dr(OFFCHAIN);
    doc.setLineWidth(1.5);
    doc.roundedRect(rightX, boxY, boxW, boxH, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    tx(OFFCHAIN);
    ctext('Off-Chain Storage', rightX + boxW / 2, cy - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    tx(AXIS);
    ctext('IPFS/Filecoin (Profiles)', rightX + boxW / 2, cy + 8);
    ctext('Nostr Relays (Chats)', rightX + boxW / 2, cy + 20);

    // --- arrow helper ---
    const arrow = (
      x1: number, x2: number, ay: number,
      color: readonly number[], label: string, dashed: boolean,
    ) => {
      dr(color);
      doc.setLineWidth(2);
      if (dashed) doc.setLineDashPattern([4, 3], 0);
      doc.line(x1, ay, x2, ay);
      doc.setLineDashPattern([], 0);
      const dir = x2 > x1 ? 1 : -1;
      fl(color);
      doc.triangle(x2, ay, x2 - dir * 7, ay - 4, x2 - dir * 7, ay + 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      tx(INK);
      ctext(label, (x1 + x2) / 2, ay - 8);
    };

    // --- ZK Proof submission arrow: App -> Midnight (top, fuchsia, solid) ---
    const yZk = cy - 16;
    arrow(leftX + boxW + 4, midX - 4, yZk, FUCHSIA_D, 'ZK Proofs / Commitments', false);

    // --- Storage arrow: Midnight <- Off-Chain (bottom, slate, solid) ---
    const yStore = cy + 16;
    arrow(rightX - 4, midX + boxW + 4, yStore, OFFCHAIN, 'CIDs / Encryption Keys', false);

    // --- Note below Midnight ---
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    tx(AXIS);
    ctext('On-chain state is opaque', midX + boxW / 2, boxY + boxH + 14);
  },
};
