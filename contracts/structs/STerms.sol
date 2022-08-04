// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

struct SetupPayload {
    // Initialized Payload properties
    uint24[] feeTiers;
    address baseToken;
    address projectToken;
    address owner;
    address[] operators;
    uint256 init0;
    uint256 init1;
    address manager;
    int24 maxTwapDeviation;
    uint24 twapDuration;
    uint24 maxSlippage;
    uint256 projectTokenAllocation;
    uint256 baseTokenAllocation;
}
