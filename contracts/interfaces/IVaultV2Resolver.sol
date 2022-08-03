// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IVaultV2, Rebalance, Range} from "./IVaultV2.sol";

// structs copied from v2-core/contracts/structs/SVaultV2.sol
struct RangeWeight {
    Range range;
    uint256 weight; // should be between 0 and 100%
}

interface IVaultV2Resolver {
    function standardRebalance(
        RangeWeight[] memory rangeWeights_,
        IVaultV2 vaultV2_
    ) external view returns (Rebalance memory rebalanceParams);
}
