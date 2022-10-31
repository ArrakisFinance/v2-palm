// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BurnLiquidity} from "../interfaces/IArrakisV2.sol";

struct SetupPayload {
    // Initialized Payload properties
    uint24[] feeTiers;
    IERC20 token0;
    IERC20 token1;
    bool projectTknIsTknZero;
    address owner;
    uint256 amount0;
    uint256 amount1;
    bytes datas;
    string strat;
    bool isBeacon;
    address delegate;
    address[] routers;
}

struct IncreaseBalance {
    IArrakisV2 vault;
    bool projectTknIsTknZero;
    uint256 amount0;
    uint256 amount1;
}

struct DecreaseBalance {
    // address of ArrakisV2 vault
    IArrakisV2 vault;
    // array of BurnLiquidity
    BurnLiquidity[] burns;
    // amount of LP tokens to burn
    uint256 burnAmount;
    // minimum amount of token0 to receive
    uint256 amount0Min;
    // minimum amount of token1 to receive
    uint256 amount1Min;
    // address to receive underlying tokens
    address payable receiver;
}

struct Inits {
    uint256 init0;
    uint256 init1;
}
