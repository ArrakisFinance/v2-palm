// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2, Rebalance, Range, BurnLiquidity} from "./IArrakisV2.sol";

// structs copied from v2-core/contracts/structs/SVaultV2.sol
struct RangeWeight {
    Range range;
    uint256 weight; // should be between 0 and 100%
}

interface IArrakisV2Resolver {
    function standardRebalance(
        RangeWeight[] memory rangeWeights_,
        IArrakisV2 vaultV2_
    ) external view returns (Rebalance memory rebalanceParams);

    function standardBurnParams(uint256 amountToBurn_, IArrakisV2 vaultV2_)
        external
        view
        returns (BurnLiquidity[] memory burns);
}
