// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "./interfaces/IArrakisV2Factory.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IArrakisV2} from "./interfaces/IArrakisV2.sol";
import {IGasStation} from "./interfaces/IGasStation.sol";
import {TermsStorage} from "./abstracts/TermsStorage.sol";
import {
    SetupPayload,
    IncreaseBalance,
    ExtendingTermData,
    DecreaseBalance
} from "./structs/STerms.sol";
import {InitializePayload} from "./interfaces/IArrakisV2.sol";
import {
    _getInits,
    _requireTokenMatch,
    _requireIsOwner,
    _getEmolument,
    _requireProjectAllocationGtZero,
    _requireTknOrder,
    _burn
} from "./functions/FTerms.sol";

// solhint-disable-next-line no-empty-blocks
contract Terms is TermsStorage {
    using SafeERC20 for IERC20;

    // solhint-disable-next-line no-empty-blocks
    constructor(IArrakisV2Factory v2factory_) TermsStorage(v2factory_) {}

    /// @notice do all neccesary step to initialize market making.
    // solhint-disable-next-line function-max-lines
    function openTerm(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        override
        noLeftOver(setup_.token0, setup_.token1)
        returns (address vault)
    {
        _requireProjectAllocationGtZero(
            setup_.projectTknIsTknZero,
            setup_.amount0,
            setup_.amount1
        );
        _requireTknOrder(address(setup_.token0), address(setup_.token1));

        address me = address(this);

        {
            (uint256 init0, uint256 init1) = _getInits(
                address(setup_.token0),
                setup_.amount0,
                setup_.amount1
            );
            // Create vaultV2.
            vault = v2factory.deployVault(
                InitializePayload({
                    feeTiers: setup_.feeTiers,
                    token0: address(setup_.token0),
                    token1: address(setup_.token1),
                    owner: me,
                    init0: init0,
                    init1: init1,
                    manager: manager,
                    maxTwapDeviation: setup_.maxTwapDeviation,
                    twapDuration: setup_.twapDuration,
                    maxSlippage: setup_.maxSlippage
                })
            );
        }

        IArrakisV2 vaultV2 = IArrakisV2(vault);

        vaultV2.toggleRestrictMint();

        _addVault(setup_.owner, vault);
        // Mint vaultV2 token.

        // Call the manager to make it manage the new vault.
        IGasStation(manager).addVault(vault, setup_.datas_, setup_.strat_);

        // Transfer to termTreasury the project token emolment.
        setup_.token0.safeTransferFrom(msg.sender, me, setup_.amount0);
        setup_.token1.safeTransferFrom(msg.sender, me, setup_.amount1);

        uint256 emolumentAmt = _getEmolument(
            setup_.projectTknIsTknZero ? setup_.amount0 : setup_.amount1,
            emolument
        );

        setup_.token0.approve(
            vault,
            setup_.projectTknIsTknZero
                ? setup_.amount0 - emolumentAmt
                : setup_.amount0
        );
        setup_.projectTknIsTknZero
            ? setup_.token0.safeTransfer(termTreasury, emolumentAmt)
            : setup_.token1.safeTransfer(termTreasury, emolumentAmt);

        setup_.token1.approve(
            vault,
            setup_.projectTknIsTknZero
                ? setup_.amount1
                : setup_.amount1 - emolumentAmt
        );
        vaultV2.mint(mintAmount_, me);

        emit SetupVault(setup_.owner, vault, emolumentAmt);
    }

    // solhint-disable-next-line function-max-lines
    function increaseLiquidity(
        IncreaseBalance calldata increaseBalance_, // memory instead of calldata to set values
        uint256 mintAmount_
    )
        external
        override
        noLeftOver(
            increaseBalance_.vault.token0(),
            increaseBalance_.vault.token1()
        )
    {
        _requireProjectAllocationGtZero(
            increaseBalance_.projectTknIsTknZero,
            increaseBalance_.amount0,
            increaseBalance_.amount1
        );
        _requireIsOwner(vaults[msg.sender], address(increaseBalance_.vault));

        (uint256 amount0, uint256 amount1) = _burn(
            increaseBalance_.vault,
            address(this),
            resolver
        );

        // Transfer to termTreasury the project token emolment.
        increaseBalance_.vault.token0().safeTransferFrom(
            msg.sender,
            address(this),
            increaseBalance_.amount0
        );
        increaseBalance_.vault.token1().safeTransferFrom(
            msg.sender,
            address(this),
            increaseBalance_.amount1
        );

        uint256 emolumentAmt;
        uint256 init0;
        uint256 init1;
        if (increaseBalance_.projectTknIsTknZero) {
            emolumentAmt = _getEmolument(increaseBalance_.amount0, emolument);

            increaseBalance_.vault.token0().approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount0 - emolumentAmt + amount0
            );

            increaseBalance_.vault.token0().safeTransfer(
                termTreasury,
                emolumentAmt
            );

            increaseBalance_.vault.token1().approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount1 + amount1
            );

            (init0, init1) = _getInits(
                address(increaseBalance_.vault.token0()),
                increaseBalance_.amount0 - emolumentAmt + amount0,
                increaseBalance_.amount1 + amount1
            );
        } else {
            emolumentAmt = _getEmolument(increaseBalance_.amount1, emolument);

            increaseBalance_.vault.token0().approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount0 + amount0
            );
            increaseBalance_.vault.token1().safeTransfer(
                termTreasury,
                emolumentAmt
            );

            increaseBalance_.vault.token1().approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount1 - emolumentAmt + amount1
            );

            (init0, init1) = _getInits(
                address(increaseBalance_.vault.token0()),
                increaseBalance_.amount0 + amount0,
                increaseBalance_.amount1 - emolumentAmt + amount1
            );
        }

        increaseBalance_.vault.setInits(init0, init1);

        increaseBalance_.vault.mint(mintAmount_, address(this));

        emit IncreaseLiquidity(
            msg.sender,
            address(increaseBalance_.vault),
            emolumentAmt
        );
    }

    // solhint-disable-next-line function-max-lines
    function extendingTerm(
        ExtendingTermData calldata extensionData_,
        uint256 mintAmount_
    )
        external
        override
        noLeftOver(extensionData_.vault.token0(), extensionData_.vault.token1())
    {
        _requireProjectAllocationGtZero(
            extensionData_.projectTknIsTknZero,
            extensionData_.amount0,
            extensionData_.amount1
        );
        _requireIsOwner(vaults[msg.sender], address(extensionData_.vault));
        require(
            IGasStation(manager)
                .getVaultInfo(address(extensionData_.vault))
                .endOfMM < block.timestamp, // solhint-disable-line not-rely-on-time
            "Terms: terms is active."
        );

        (uint256 amount0, uint256 amount1) = _burn(
            extensionData_.vault,
            address(this),
            resolver
        );

        // Transfer to termTreasury the project token emolment.
        extensionData_.vault.token0().safeTransferFrom(
            msg.sender,
            address(this),
            extensionData_.amount0
        );
        extensionData_.vault.token1().safeTransferFrom(
            msg.sender,
            address(this),
            extensionData_.amount1
        );

        uint256 emolumentAmt;
        uint256 init0;
        uint256 init1;
        if (extensionData_.projectTknIsTknZero) {
            emolumentAmt = _getEmolument(
                extensionData_.amount0 + amount0,
                emolument
            );

            extensionData_.vault.token0().approve(
                address(extensionData_.vault),
                extensionData_.amount0 - emolumentAmt + amount0
            );

            extensionData_.vault.token0().safeTransfer(
                termTreasury,
                emolumentAmt
            );

            extensionData_.vault.token1().approve(
                address(extensionData_.vault),
                extensionData_.amount1 + amount1
            );

            (init0, init1) = _getInits(
                address(extensionData_.vault.token0()),
                extensionData_.amount0 - emolumentAmt + amount0,
                extensionData_.amount1 + amount1
            );
        } else {
            emolumentAmt = _getEmolument(
                extensionData_.amount1 + amount1,
                emolument
            );

            extensionData_.vault.token0().approve(
                address(extensionData_.vault),
                extensionData_.amount0 + amount0
            );
            extensionData_.vault.token1().safeTransfer(
                termTreasury,
                emolumentAmt
            );

            extensionData_.vault.token1().approve(
                address(extensionData_.vault),
                extensionData_.amount1 - emolumentAmt + amount1
            );

            (init0, init1) = _getInits(
                address(extensionData_.vault.token0()),
                extensionData_.amount0 + amount0,
                extensionData_.amount1 - emolumentAmt + amount1
            );
        }

        extensionData_.vault.setInits(init0, init1);

        extensionData_.vault.mint(mintAmount_, address(this));

        IGasStation(manager).expandMMTermDuration(
            address(extensionData_.vault)
        );

        emit ExtendingTerm(
            msg.sender,
            address(extensionData_.vault),
            emolumentAmt
        );
    }

    // solhint-disable-next-line function-max-lines
    function decreaseLiquidity(
        DecreaseBalance calldata decreaseBalance_,
        uint256 mintAmount_
    )
        external
        override
        noLeftOver(
            decreaseBalance_.vault.token0(),
            decreaseBalance_.vault.token1()
        )
    {
        IERC20 token0 = decreaseBalance_.vault.token0();
        IERC20 token1 = decreaseBalance_.vault.token1();
        _requireIsOwner(vaults[msg.sender], address(decreaseBalance_.vault));
        address me = address(this);
        (uint256 amount0, uint256 amount1) = _burn(
            decreaseBalance_.vault,
            me,
            resolver
        );
        require(
            decreaseBalance_.amount0 < amount0,
            "Terms: send back amount0 > amount0"
        );
        require(
            decreaseBalance_.amount1 < amount1,
            "Terms: send back amount1 > amount1"
        );
        token0.safeTransfer(decreaseBalance_.to, decreaseBalance_.amount0);
        token1.safeTransfer(decreaseBalance_.to, decreaseBalance_.amount1);
        token0.approve(
            address(decreaseBalance_.vault),
            amount0 - decreaseBalance_.amount0
        );
        token1.approve(
            address(decreaseBalance_.vault),
            amount1 - decreaseBalance_.amount1
        );
        (uint256 init0, uint256 init1) = _getInits(
            address(token0),
            amount0 - decreaseBalance_.amount0,
            amount1 - decreaseBalance_.amount1
        );
        decreaseBalance_.vault.setInits(init0, init1);
        decreaseBalance_.vault.mint(mintAmount_, me);

        emit DecreaseLiquidity(msg.sender, address(decreaseBalance_.vault));
    }

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
    {
        uint256 index = _requireIsOwner(vaults[msg.sender], address(vault_));
        address vaultAddr = address(vault_);

        delete vaults[msg.sender][index];

        (uint256 amount0, uint256 amount1) = _burn(
            vault_,
            address(this),
            resolver
        );

        if (amount0 > 0) vault_.token0().safeTransfer(to_, amount0);
        if (amount1 > 0) vault_.token1().safeTransfer(to_, amount1);

        IGasStation(manager).removeVault(address(vault_), payable(to_));
        _setManager(newManager_);
        vault_.transferOwnership(newOwner_);

        emit CloseTerm(msg.sender, vaultAddr, amount0, amount1, to_);
    }

    // #region vault config as admin.

    function addPools(IArrakisV2 vault_, uint24[] calldata feeTiers_)
        external
        override
        requireAddressNotZero(address(vault_))
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        vault_.addPools(feeTiers_);
    }

    function removePools(IArrakisV2 vault_, address[] calldata pools_)
        external
        override
        requireAddressNotZero(address(vault_))
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        vault_.removePools(pools_);
    }

    function setMaxTwapDeviation(IArrakisV2 vault_, int24 maxTwapDeviation_)
        external
        override
        requireAddressNotZero(address(vault_))
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        vault_.setMaxTwapDeviation(maxTwapDeviation_);
    }

    function setTwapDuration(IArrakisV2 vault_, uint24 twapDuration_)
        external
        override
        requireAddressNotZero(address(vault_))
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        vault_.setTwapDuration(twapDuration_);
    }

    function setMaxSlippage(IArrakisV2 vault_, uint24 maxSlippage_)
        external
        override
        requireAddressNotZero(address(vault_))
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        vault_.setMaxSlippage(maxSlippage_);
    }

    // #endregion vault config as admin.

    // #region gasStation config as vault owner.

    function setVaultData(address vault_, bytes calldata data_)
        external
        override
        requireAddressNotZero(vault_)
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        IGasStation(manager).setVaultData(vault_, data_);
    }

    function setVaultStratByName(address vault_, string calldata strat_)
        external
        override
        requireAddressNotZero(vault_)
    {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        IGasStation(manager).setVaultStraByName(vault_, strat_);
    }

    function withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address payable to_
    ) external override requireAddressNotZero(vault_) {
        _requireIsOwner(vaults[msg.sender], address(vault_));
        IGasStation(manager).withdrawVaultBalance(vault_, amount_, to_);
    }

    // #endregion gasStation config as vault owner.
}
