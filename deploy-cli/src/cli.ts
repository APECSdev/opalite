import * as util from 'util';
import { type WalletContext } from './api.js';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface, type Interface } from 'node:readline/promises';
import { type Logger } from 'pino';
import { type AgeVerificationProviders, type DeployedAgeVerificationContract } from './common-types.js';
import { type Config } from './config.js';
import * as api from './api.js';

let logger: Logger;

const BANNER = `
======================================================================
              Opalite Love - Age Verification Contract
              Privacy-Preserving Dating on Midnight Network
======================================================================`;

const DIVIDER = '----------------------------------------------------------------------';

const WALLET_MENU = `
${DIVIDER}
  Wallet Setup
${DIVIDER}
  [1] Create a new wallet
  [2] Restore wallet from seed
  [3] Exit
${'─'.repeat(70)}
> `;

const contractMenu = (dustBalance: string) => `
${DIVIDER}
  Contract Actions${dustBalance ? `               DUST: ${dustBalance}` : ''}
${DIVIDER}
  [1] Deploy a new age verification contract
  [2] Join an existing age verification contract
  [3] Monitor DUST balance
  [4] Exit
${'─'.repeat(70)}
> `;

const ageMenu = (dustBalance: string) => `
${DIVIDER}
  Age Verification Actions${dustBalance ? `     DUST: ${dustBalance}` : ''}
${DIVIDER}
  [1] Verify age (increment counter)
  [2] Display current verified count
  [3] Exit
${'─'.repeat(70)}
> `;

const buildWalletFromSeed = async (config: Config, rli: Interface): Promise<WalletContext> => {
  const seed = await rli.question('Enter your wallet seed: ');
  return await api.buildWalletAndWaitForFunds(config, seed);
};

const buildWallet = async (config: Config, rli: Interface): Promise<WalletContext | null> => {
  while (true) {
    const choice = await rli.question(WALLET_MENU);
    switch (choice.trim()) {
      case '1':
        return await api.buildFreshWallet(config);
      case '2':
        return await buildWalletFromSeed(config, rli);
      case '3':
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const getDustLabel = async (wallet: WalletContext['wallet']): Promise<string> => {
  try {
    const dust = await api.getDustBalance(wallet);
    return dust.available.toLocaleString();
  } catch {
    return '';
  }
};

const deployOrJoin = async (
  providers: AgeVerificationProviders,
  walletCtx: WalletContext,
  rli: Interface,
): Promise<DeployedAgeVerificationContract | null> => {
  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(contractMenu(dustLabel));
    switch (choice.trim()) {
      case '1':
        try {
          const contract = await api.withStatus('Deploying age verification contract', () =>
            api.deploy(providers, { privateCounter: 0 }),
          );
          console.log(`\n  Contract deployed at: ${contract.deployTxData.public.contractAddress}\n`);
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`\n  Deploy failed: ${msg}`);
          if (e instanceof Error && e.cause) {
            let cause: unknown = e.cause;
            let depth = 0;
            while (cause && depth < 5) {
              const causeMsg = cause instanceof Error ? `${cause.message}` : String(cause);
              console.log(`    cause: ${causeMsg}`);
              cause = cause instanceof Error ? cause.cause : undefined;
              depth++;
            }
          }
          if (msg.toLowerCase().includes('dust') || msg.toLowerCase().includes('no dust')) {
            console.log('    Insufficient DUST for transaction fees. Use option [3] to monitor your balance.');
          }
          console.log('');
        }
        break;
      case '2':
        try {
          const contractAddress = await rli.question('Enter the contract address (hex): ');
          const contract = await api.joinContract(providers, contractAddress);
          console.log(`\n  Joined contract at address: ${contract.deployTxData.public.contractAddress}\n`);
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  Failed to join contract: ${msg}\n`);
        }
        break;
      case '3':
        await startDustMonitor(walletCtx.wallet, rli);
        break;
      case '4':
        return null;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

const startDustMonitor = async (wallet: WalletContext['wallet'], rli: Interface): Promise<void> => {
  console.log('');
  const stopPromise = rli.question('  Press Enter to return to menu...\n').then(() => {});
  await api.monitorDustBalance(wallet, stopPromise);
  console.log('');
};

const mainLoop = async (providers: AgeVerificationProviders, walletCtx: WalletContext, rli: Interface): Promise<void> => {
  const contract = await deployOrJoin(providers, walletCtx, rli);
  if (contract === null) return;

  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(ageMenu(dustLabel));
    switch (choice.trim()) {
      case '1':
        try {
          await api.withStatus('Verifying age...', () => api.verifyAge(contract));
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  Verify failed: ${msg}\n`);
        }
        break;
      case '2':
        await api.displayVerifiedCount(providers, contract);
        break;
      case '3':
        return;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, _logger: Logger): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);
  console.log(BANNER);
  const rli = createInterface({ input, output, terminal: true });
  try {
    const walletCtx = await buildWallet(config, rli);
    if (walletCtx === null) return;
    try {
      const providers = await api.withStatus('Configuring providers', () => api.configureProviders(walletCtx, config));
      console.log('');
      await mainLoop(providers, walletCtx, rli);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Error: ${util.inspect(e, { depth: null })}`);
      } else { throw e; }
    } finally {
      try { await walletCtx.wallet.stop(); } catch (e) { logger.error(`Error stopping wallet: ${e}`); }
    }
  } finally {
    rli.close();
    rli.removeAllListeners();
    logger.info('Goodbye.');
  }
};
