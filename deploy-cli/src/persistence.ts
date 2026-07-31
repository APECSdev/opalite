import * as fs from 'node:fs';
import * as path from 'node:path';
import { WalletEntrySchema, mergeWalletEntries } from '@midnight-ntwrk/wallet-sdk-facade';
import type { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-abstractions';

export interface SavedWalletState {
  version: 1;
  savedAt: string;
  shielded: string;
  unshielded: string;
  dust: string;
}

const STATE_FILE = path.resolve(process.cwd(), 'wallet-state.json');
const STATE_TMP = STATE_FILE + '.tmp';

/** Load saved wallet state. Set WALLET_FRESH=1 to ignore it and start from genesis. */
export const loadSavedWalletState = (): SavedWalletState | null => {
  try {
    if (process.env.WALLET_FRESH === '1') {
      console.log('[persistence] WALLET_FRESH=1 - ignoring saved state');
      return null;
    }
    if (!fs.existsSync(STATE_FILE)) {
      console.log('[persistence] No saved state - fresh sync from genesis');
      return null;
    }
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SavedWalletState>;
    if (parsed.shielded && parsed.unshielded && parsed.dust) {
      console.log(
        `[persistence] RESTORING wallet state saved at ${parsed.savedAt} (${raw.length} bytes)`,
      );
      return parsed as SavedWalletState;
    }
    console.log('[persistence] wallet-state.json incomplete - starting fresh');
    return null;
  } catch (err) {
    console.log('[persistence] Failed to load wallet-state.json - starting fresh', err);
    return null;
  }
};

export const saveWalletState = async (wallet: WalletFacade): Promise<number> => {
  const [shielded, unshielded, dust] = await Promise.all([
    wallet.shielded.serializeState(),
    wallet.unshielded.serializeState(),
    wallet.dust.serializeState(),
  ]);
  const payload: SavedWalletState = {
    version: 1,
    savedAt: new Date().toISOString(),
    shielded,
    unshielded,
    dust,
  };
  fs.writeFileSync(STATE_TMP, JSON.stringify(payload));
  fs.renameSync(STATE_TMP, STATE_FILE);
  return fs.statSync(STATE_FILE).size;
};

/** Checkpoint every intervalMs. Crash loses at most one interval of sync. */
export const startCheckpointTimer = (
  wallet: WalletFacade,
  intervalMs = 60_000,
): (() => void) => {
  let saving = false;
  const timer = setInterval(() => {
    if (saving) return;
    saving = true;
    void saveWalletState(wallet)
      .then((bytes) => console.log(`[persistence] checkpoint saved (${bytes} bytes)`))
      .catch((err) => console.log('[persistence] checkpoint FAILED', err))
      .finally(() => {
        saving = false;
      });
  }, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  return () => clearInterval(timer);
};

/**
 * txHistoryStorage factory. The exact construction API of
 * InMemoryTransactionHistoryStorage (static create vs constructor) is adapted
 * at runtime. If it fails we continue without it - sub-wallet serialize/restore
 * does not depend on it.
 */
export const makeTxHistoryStorage = (): unknown => {
  const S = InMemoryTransactionHistoryStorage as any;
  try {
    if (typeof S.create === 'function') {
      console.log('[persistence] txHistoryStorage via .create()');
      return S.create(WalletEntrySchema, mergeWalletEntries);
    }
    console.log('[persistence] txHistoryStorage via constructor');
    return new S(WalletEntrySchema, mergeWalletEntries);
  } catch (err) {
    console.log('[persistence] txHistoryStorage creation failed - skipping', err);
    return undefined;
  }
};
