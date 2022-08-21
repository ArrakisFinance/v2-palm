// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {IArrakisV2Resolver} from "../interfaces/IArrakisV2Resolver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    _burn,
    _getInits,
    _requireTokenMatch,
    _requireIsOwner,
    _isOwnerOfVault,
    _getEmolument,
    _requireProjectAllocationGtZero,
    _requireTknOrder
} from "../functions/FTerms.sol";

// solhint-disable-next-line no-empty-blocks
contract TermsFunctionsMock {
    IArrakisV2Resolver public immutable resolver;

    constructor(IArrakisV2Resolver resolver_) {
        resolver = resolver_;
    }

    function mint(
        IArrakisV2 vault_,
        uint256 amount0_,
        uint256 amount1_,
        uint256 mintAmount_
    ) external {
        IERC20 token0 = vault_.token0();
        IERC20 token1 = vault_.token1();

        address me = address(this);
        address vaultAddr = address(vault_);

        token0.transferFrom(msg.sender, me, amount0_);
        token1.transferFrom(msg.sender, me, amount1_);

        token0.approve(vaultAddr, amount0_);
        token1.approve(vaultAddr, amount1_);
        vault_.mint(mintAmount_, me);
    }

    function burn(IArrakisV2 vault_)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        return _burn(vault_, address(this), resolver);
    }

    function requireTokenMatch(
        IArrakisV2 vault_,
        IERC20 token0_,
        IERC20 token1_
    ) external view {
        _requireTokenMatch(vault_, token0_, token1_);
    }

    function getInits(
        uint256 mintAmount_,
        uint256 amount0_,
        uint256 amount1_
    ) external pure returns (uint256 init0, uint256 init1) {
        return _getInits(mintAmount_, amount0_, amount1_);
    }

    function requireIsOwner(address[] memory vaults_, address vault_)
        external
        pure
        returns (uint256 index)
    {
        return _requireIsOwner(vaults_, vault_);
    }

    function isOwnerOfVault(address[] memory vaults_, address vault_)
        external
        pure
        returns (bool isAssociated, uint256 index)
    {
        return _isOwnerOfVault(vaults_, vault_);
    }

    function getEmolument(uint256 projectTokenAllocation_, uint16 emolument_)
        external
        pure
        returns (uint256)
    {
        return _getEmolument(projectTokenAllocation_, emolument_);
    }

    function requireProjectAllocationGtZero(
        bool projectTknIsTknZero_,
        uint256 amount0_,
        uint256 amount1_
    ) external pure {
        _requireProjectAllocationGtZero(
            projectTknIsTknZero_,
            amount0_,
            amount1_
        );
    }

    function requireTknOrder(address token0_, address token1_) external pure {
        _requireTknOrder(token0_, token1_);
    }
}
