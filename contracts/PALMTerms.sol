// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "./interfaces/IArrakisV2Factory.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {BurnLiquidity, IArrakisV2} from "./interfaces/IArrakisV2.sol";
import {IPALMManager} from "./interfaces/IPALMManager.sol";
import {PALMTermsStorage} from "./abstracts/PALMTermsStorage.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    SetupPayload,
    IncreaseBalance,
    DecreaseBalance,
    Inits
} from "./structs/SPALMTerms.sol";
import {
    InitializePayload
} from "@arrakisfi/v2-core/contracts/structs/SArrakisV2.sol";
import {
    _getInits,
    _getEmolument,
    _requireTokensAllocationsGtZero,
    _requireTknOrder,
    _burn
} from "./functions/FPALMTerms.sol";

/// @title Portfolio automated liquidity management
/// @notice Smart contract creating market making terms btw client and Arrakis Finance
// solhint-disable-next-line no-empty-blocks
contract PALMTerms is PALMTermsStorage {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    // solhint-disable-next-line no-empty-blocks
    constructor(IArrakisV2Factory v2factory_) PALMTermsStorage(v2factory_) {}

    /// @notice do all neccesary step to initialize market making.
    /// @param setup_ contain all data to create Arrakis V2 vault,
    /// to create a term btw client and PALM and to manage it.
    /// @return vault created Arrakis V2 vault address
    // solhint-disable-next-line function-max-lines
    function openTerm(SetupPayload calldata setup_)
        external
        payable
        override
        collectLeftOver(setup_.token0, setup_.token1)
        returns (address vault)
    {
        _requireTokensAllocationsGtZero(setup_.amount0, setup_.amount1);
        _requireTknOrder(address(setup_.token0), address(setup_.token1));

        uint256 mintAmount = 1e18;
        {
            Inits memory inits;
            (inits.init0, inits.init1) = _getInits(
                mintAmount,
                setup_.amount0,
                setup_.amount1
            );

            vault = v2factory.deployVault(
                InitializePayload({
                    feeTiers: setup_.feeTiers,
                    token0: address(setup_.token0),
                    token1: address(setup_.token1),
                    owner: address(this),
                    init0: inits.init0,
                    init1: inits.init1,
                    manager: manager,
                    routers: setup_.routers
                }),
                setup_.isBeacon
            );
        }

        IArrakisV2 vaultV2 = IArrakisV2(vault);

        _addVault(setup_.owner, vault);

        if (setup_.delegate != address(0)) _setDelegate(vault, setup_.delegate);

        vaultV2.setRestrictedMint(address(this));

        IPALMManager(manager).addVault{value: msg.value}(
            vault,
            setup_.datas,
            setup_.strat
        );

        setup_.token0.safeTransferFrom(
            msg.sender,
            address(this),
            setup_.amount0
        );
        setup_.token1.safeTransferFrom(
            msg.sender,
            address(this),
            setup_.amount1
        );

        setup_.token0.safeApprove(vault, 0);
        setup_.token1.safeApprove(vault, 0);

        setup_.token0.safeApprove(vault, setup_.amount0);
        setup_.token1.safeApprove(vault, setup_.amount1);

        vaultV2.mint(mintAmount, address(this));

        emit SetupVault(setup_.owner, vault);
    }

    /// @notice to increase tokens allocation on client Arrakis V2 vault.
    /// @param increaseBalance_ contain all data to increase Arrakis V2 vault
    /// allocations
    /// @dev only vault owner can call it.
    // solhint-disable-next-line function-max-lines
    function increaseLiquidity(IncreaseBalance calldata increaseBalance_)
        external
        override
        requireIsOwner(address(increaseBalance_.vault))
    {
        _requireTokensAllocationsGtZero(
            increaseBalance_.amount0,
            increaseBalance_.amount1
        );

        increaseBalance_.vault.token0().safeTransferFrom(
            msg.sender,
            address(increaseBalance_.vault),
            increaseBalance_.amount0
        );
        increaseBalance_.vault.token1().safeTransferFrom(
            msg.sender,
            address(increaseBalance_.vault),
            increaseBalance_.amount1
        );

        emit IncreaseLiquidity(msg.sender, address(increaseBalance_.vault));
    }

    /// @notice to renew term btw PALM and client on Arrakis V2 vault
    /// @param vault_ Arrakis V2 vault
    /// @dev only vault owner can call it.
    // solhint-disable-next-line function-max-lines
    function renewTerm(IArrakisV2 vault_)
        external
        override
        requireIsOwner(address(vault_))
    {
        IPALMManager manager_ = IPALMManager(manager);
        require( // solhint-disable-next-line not-rely-on-time
            manager_.getVaultInfo(address(vault_)).termEnd < block.timestamp,
            "PALMTerms: term not ended."
        );
        manager_.renewTerm(address(vault_));

        uint256 balance = IERC20(address(vault_)).balanceOf(address(this));

        uint256 emolumentShares = _getEmolument(balance, emolument);

        BurnLiquidity[] memory burnPayload = resolver.standardBurnParams(
            emolumentShares,
            vault_
        );

        (uint256 emolumentAmt0, uint256 emolumentAmt1) = vault_.burn(
            burnPayload,
            emolumentShares,
            termTreasury
        );

        emit RenewTerm(address(vault_), emolumentAmt0, emolumentAmt1);
    }

    /// @notice to decrease tokens allocation on client Arrakis V2 vault.
    /// automated management.
    /// @param decreaseBalance_ contain all data to decrease Arrakis V2 vault
    /// allocations
    /// @dev only vault owner can call it. And client will pay emoluments.
    // solhint-disable-next-line function-max-lines
    function decreaseLiquidity(DecreaseBalance calldata decreaseBalance_)
        external
        override
        collectLeftOver(
            decreaseBalance_.vault.token0(),
            decreaseBalance_.vault.token1()
        )
        requireIsOwner(address(decreaseBalance_.vault))
    {
        BurnLiquidity[] memory burnPayload = resolver.standardBurnParams(
            decreaseBalance_.burnAmount,
            decreaseBalance_.vault
        );

        require(
            IERC20(address(decreaseBalance_.vault)).balanceOf(address(this)) >
                decreaseBalance_.burnAmount,
            "PALMTerms: burn all vault tokens no allowed."
        );

        (uint256 amount0, uint256 amount1) = decreaseBalance_.vault.burn(
            burnPayload,
            decreaseBalance_.burnAmount,
            address(this)
        );

        require(
            amount0 >= decreaseBalance_.amount0Min &&
                amount1 >= decreaseBalance_.amount1Min,
            "PALMTerms: received below minimum"
        );

        uint256 emolumentAmt0;
        uint256 emolumentAmt1;

        if (amount0 > 0) {
            IERC20 token0 = decreaseBalance_.vault.token0();

            emolumentAmt0 = _getEmolument(amount0, emolument);
            token0.safeTransfer(termTreasury, emolumentAmt0);
            token0.safeTransfer(
                decreaseBalance_.receiver,
                amount0 - emolumentAmt0
            );
        }

        if (amount1 > 0) {
            IERC20 token1 = decreaseBalance_.vault.token1();

            emolumentAmt1 = _getEmolument(amount1, emolument);
            token1.safeTransfer(termTreasury, emolumentAmt1);
            token1.safeTransfer(
                decreaseBalance_.receiver,
                amount1 - emolumentAmt1
            );
        }

        emit DecreaseLiquidity(
            msg.sender,
            address(decreaseBalance_.vault),
            amount0,
            amount1,
            emolumentAmt0,
            emolumentAmt1
        );
    }

    /// @notice to close term btw PALM and client.
    /// automated management.
    /// @param vault_  Arrakis V2 vault
    /// @param to_  address that will receive fund.
    /// @param newOwner_  new owner of the Arrakis V2 vault.
    /// @param newManager_  new manager of the Arrakis V2 vault.
    /// @dev only vault owner can call it. And client will pay emoluments.
    // solhint-disable-next-line function-max-lines, code-complexity
    function closeTerm(
        IArrakisV2 vault_,
        address to_,
        address newOwner_,
        address newManager_
    )
        external
        override
        requireAddressNotZero(newOwner_)
        requireAddressNotZero(to_)
        requireIsOwner(address(vault_))
    {
        _vaults[msg.sender].remove(address(vault_));

        (uint256 amount0, uint256 amount1, ) = _burn(
            vault_,
            address(this),
            resolver
        );

        uint256 emolumentAmt0 = _getEmolument(amount0, emolument);
        uint256 emolumentAmt1 = _getEmolument(amount1, emolument);

        if (emolumentAmt0 > 0)
            vault_.token0().safeTransfer(termTreasury, emolumentAmt0);
        if (emolumentAmt1 > 0)
            vault_.token1().safeTransfer(termTreasury, emolumentAmt1);

        if (amount0 > 0)
            vault_.token0().safeTransfer(to_, amount0 - emolumentAmt0);
        if (amount1 > 0)
            vault_.token1().safeTransfer(to_, amount1 - emolumentAmt1);

        IPALMManager(manager).removeVault(address(vault_), payable(to_));
        vault_.setManager(IPALMManager(newManager_));
        vault_.setRestrictedMint(address(0));
        vault_.transferOwnership(newOwner_);

        emit CloseTerm(
            msg.sender,
            address(vault_),
            amount0,
            amount1,
            to_,
            emolumentAmt0,
            emolumentAmt1
        );
    }
}
