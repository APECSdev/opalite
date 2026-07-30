// This file is part of midnightntwrk/example-counter.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AgeVerificationSimulator } from "./age-verification-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId("undeployed");

describe("AgeVerification smart contract", () => {
  it("generates initial ledger state deterministically", () => {
    const simulator0 = new AgeVerificationSimulator();
    const simulator1 = new AgeVerificationSimulator();
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  it("properly initializes ledger state and private state", () => {
    const simulator = new AgeVerificationSimulator();
    const initialLedgerState = simulator.getLedger();
    expect(initialLedgerState.verifiedCount).toEqual(0n);
    const initialPrivateState = simulator.getPrivateState();
    expect(initialPrivateState).toEqual({ privateCounter: 0 });
  });

  it("increments the verified count correctly", () => {
    const simulator = new AgeVerificationSimulator();
    const nextLedgerState = simulator.verifyAge();
    expect(nextLedgerState.verifiedCount).toEqual(1n);
    const nextPrivateState = simulator.getPrivateState();
    expect(nextPrivateState).toEqual({ privateCounter: 0 });
  });
});
