// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2, BurnLiquidity} from "../interfaces/IArrakisV2.sol";
import {IArrakisV2Resolver} from "../interfaces/IArrakisV2Resolver.sol";
import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FullMath} from "../utils/FullMath.sol";

function _burn(
    IArrakisV2 vault_,
    address me,
    IArrakisV2Resolver resolver
) returns (uint256 amount0, uint256 amount1) {
    uint256 balanceOfArrakisTkn = IERC20(address(vault_)).balanceOf(me);
    BurnLiquidity[] memory burnPayload = resolver.standardBurnParams(
        balanceOfArrakisTkn,
        vault_
    );

    (amount0, amount1) = vault_.burn(burnPayload, balanceOfArrakisTkn, me);
}

function _getInits(
    address token0_,
    uint256 amount0_,
    uint256 amount1_
) view returns (uint256 init0, uint256 init1) {
    uint8 token0Decimals = ERC20(token0_).decimals();

    init0 = 10**token0Decimals;
    init1 = FullMath.mulDiv(amount1_, amount0_, 10**token0Decimals);
}

function _requireTokenMatch(
    IArrakisV2 vault_,
    IERC20 token0_,
    IERC20 token1_
) view {
    require(
        address(token0_) == address(vault_.token0()),
        "Terms: wrong token0."
    );
    require(
        address(token1_) == address(vault_.token1()),
        "Terms: wrong token1."
    );
}

function _requireIsOwner(address[] memory vaults_, address vault_)
    pure
    returns (uint256 index)
{
    bool isOwner;
    (isOwner, index) = _isOwnerOfVault(vaults_, address(vault_));
    require(isOwner, "Terms: not owner");
}

function _isOwnerOfVault(address[] memory vaults_, address vault_)
    pure
    returns (bool, uint256 index)
{
    for (index = 0; index < vaults_.length; index++) {
        if (vaults_[index] == vault_) return (true, index);
    }
    return (false, 0);
}

function _getEmolument(uint256 projectTokenAllocation_, uint16 emolument_)
    pure
    returns (uint256)
{
    return (projectTokenAllocation_ * emolument_) / 10000;
}

function _requireProjectAllocationGtZero(
    bool projectTknIsTknZero_,
    uint256 amount0_,
    uint256 amount1_
) pure {
    require(
        projectTknIsTknZero_ ? amount0_ > 0 : amount1_ > 0,
        "Terms: no project token allocation."
    );
}

function _requireTknOrder(address token0_, address token1_) pure {
    require(token0_ < token1_, "Terms: tokens order inverted.");
}
