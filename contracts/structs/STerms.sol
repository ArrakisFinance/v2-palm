// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct SetupPayload {
    // Initialized Payload properties
    uint24[] feeTiers;
    IERC20 token0;
    IERC20 token1;
    bool projectTknIsTknZero;
    address owner;
    address[] operators;
    // uint256 init0;
    // uint256 init1;
    int24 maxTwapDeviation;
    uint24 twapDuration;
    uint24 maxSlippage;
    uint256 amount0;
    uint256 amount1;
    bytes datas_;
    string strat_;
}

struct IncreaseBalance {
    IArrakisV2 vault;
    IERC20 token0;
    IERC20 token1;
    bool projectTknIsTknZero;
    // uint256 init0;
    // uint256 init1;
    uint256 amount0;
    uint256 amount1;
}

struct DecreaseBalance {
    IArrakisV2 vault;
    IERC20 token0;
    IERC20 token1;
    bool projectTknIsTknZero;
    // uint256 init0;
    // uint256 init1;
    uint256 amount0;
    uint256 amount1;
    address to;
}
