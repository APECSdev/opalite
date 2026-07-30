import * as AgeVerification from '../../packages/contracts/src/managed/age_verification/contract/index.js';
import { type AgeVerificationPrivateState } from '../../packages/contracts/src/witnesses';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js/types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js/contracts';
import type { ProvableCircuitId } from '@midnight-ntwrk/compact-js';

export type AgeVerificationCircuits = ProvableCircuitId<AgeVerification.Contract<AgeVerificationPrivateState>>;

export const AgeVerificationPrivateStateId = 'ageVerificationPrivateState';

export type AgeVerificationProviders = MidnightProviders<AgeVerificationCircuits, typeof AgeVerificationPrivateStateId, AgeVerificationPrivateState>;

export type AgeVerificationContract = AgeVerification.Contract<AgeVerificationPrivateState>;

export type DeployedAgeVerificationContract = DeployedContract<AgeVerificationContract> | FoundContract<AgeVerificationContract>;
