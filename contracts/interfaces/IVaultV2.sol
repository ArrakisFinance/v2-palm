// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {
    IUniswapV3Factory
} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// structs copied from v2-core/contracts/structs/SVaultV2.sol
struct PositionLiquidity {
    uint128 liquidity;
    Range range;
}

struct SwapPayload {
    bytes payload;
    address pool;
    address router;
    uint256 amountIn;
    uint256 expectedMinReturn;
    bool zeroForOne;
}

struct Range {
    int24 lowerTick;
    int24 upperTick;
    uint24 feeTier;
}

struct Rebalance {
    PositionLiquidity[] removes;
    PositionLiquidity[] deposits;
    SwapPayload swap;
}

struct InitializePayload {
    uint24[] feeTiers;
    address token0;
    address token1;
    address owner;
    uint256 init0;
    uint256 init1;
    address manager;
    int24 maxTwapDeviation;
    uint24 twapDuration;
    uint24 maxSlippage;
}

interface IVaultV2 {
    function mint(uint256 mintAmount_, address receiver_)
        external
        returns (uint256 amount0, uint256 amount1);

    function rebalance(Rebalance calldata rebalanceParams_) external;

    function addRangeAndRebalance(
        Range[] calldata ranges_,
        Rebalance calldata rebalanceParams_
    ) external;

    function transferOwnership(address newOwner) external;

    function addOperators(address[] calldata operators_) external;

    function rangeExist(Range calldata range_)
        external
        view
        returns (bool ok, uint256 index);

    function rangesArray() external view returns (Range[] memory);

    function owner() external view returns (address);
}
