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
    DecreaseBalance,
    Inits
} from "./structs/STerms.sol";
import {InitializePayload} from "./interfaces/IArrakisV2.sol";
import {
    _requireAddressNotZero,
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
        payable
        override
        noLeftOver(setup_.token0, setup_.token1)
        returns (address vault)
    {
        _requireAddressNotZero(mintAmount_);
        _requireProjectAllocationGtZero(
            setup_.projectTknIsTknZero,
            setup_.amount0,
            setup_.amount1
        );
        _requireTknOrder(address(setup_.token0), address(setup_.token1));

        {
            Inits memory inits;
            (inits.init0, inits.init1) = _getInits(
                mintAmount_,
                setup_.amount0,
                setup_.amount1
            );

            // Create vaultV2.
            vault = v2factory.deployVault(
                InitializePayload({
                    feeTiers: setup_.feeTiers,
                    token0: address(setup_.token0),
                    token1: address(setup_.token1),
                    owner: address(this),
                    init0: inits.init0,
                    init1: inits.init1,
                    manager: manager,
                    maxTwapDeviation: setup_.maxTwapDeviation,
                    twapDuration: setup_.twapDuration,
                    maxSlippage: setup_.maxSlippage
                }),
                setup_.isBeacon
            );
        }

        IArrakisV2 vaultV2 = IArrakisV2(vault);

        _addVault(setup_.owner, vault);
        // Mint vaultV2 token.

        // Call the manager to make it manage the new vault.
        IGasStation(manager).addVault{value: msg.value}(
            vault,
            setup_.datas,
            setup_.strat
        );

        // Transfer to termTreasury the project token emolment.
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

        setup_.token0.approve(vault, setup_.amount0);
        setup_.token1.approve(vault, setup_.amount1);

        vaultV2.mint(mintAmount_, address(this));

        IGasStation(manager).toggleRestrictMint(vault);

        emit SetupVault(setup_.owner, vault);
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
        _requireAddressNotZero(mintAmount_);
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

        increaseBalance_.vault.token0().approve(
            address(increaseBalance_.vault),
            increaseBalance_.amount0 + amount0
        );

        increaseBalance_.vault.token1().approve(
            address(increaseBalance_.vault),
            increaseBalance_.amount1 + amount1
        );

        {
            Inits memory inits;
            (inits.init0, inits.init1) = _getInits(
                mintAmount_,
                increaseBalance_.amount0 + amount0,
                increaseBalance_.amount1 + amount1
            );

            increaseBalance_.vault.setInits(inits.init0, inits.init1);
        }

        IGasStation(manager).toggleRestrictMint(
            address(increaseBalance_.vault)
        );

        increaseBalance_.vault.mint(mintAmount_, address(this));

        IGasStation(manager).toggleRestrictMint(
            address(increaseBalance_.vault)
        );

        emit IncreaseLiquidity(msg.sender, address(increaseBalance_.vault));
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
        _requireAddressNotZero(mintAmount_);
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

        uint256 emolumentAmt0 = _getEmolument(amount0, emolument);
        uint256 emolumentAmt1 = _getEmolument(amount1, emolument);
        extensionData_.vault.token0().approve(
            address(extensionData_.vault),
            extensionData_.amount0 + amount0 - emolumentAmt0
        );
        extensionData_.vault.token1().approve(
            address(extensionData_.vault),
            extensionData_.amount1 + amount1 - emolumentAmt1
        );
        if (emolumentAmt0 > 0)
            extensionData_.vault.token0().safeTransfer(
                termTreasury,
                emolumentAmt0
            );
        if (emolumentAmt1 > 0)
            extensionData_.vault.token1().safeTransfer(
                termTreasury,
                emolumentAmt1
            );
        {
            Inits memory inits;
            (inits.init0, inits.init1) = _getInits(
                mintAmount_,
                extensionData_.amount0 + amount0 - emolumentAmt0,
                extensionData_.amount1 + amount1 - emolumentAmt1
            );

            extensionData_.vault.setInits(inits.init0, inits.init1);
        }

        IGasStation(manager).toggleRestrictMint(address(extensionData_.vault));

        extensionData_.vault.mint(mintAmount_, address(this));

        IGasStation(manager).toggleRestrictMint(address(extensionData_.vault));

        IGasStation(manager).expandMMTermDuration(
            address(extensionData_.vault)
        );

        emit ExtendingTerm(
            msg.sender,
            address(extensionData_.vault),
            emolumentAmt0,
            emolumentAmt1
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
        _requireAddressNotZero(mintAmount_);
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

        uint256 emolumentAmt0 = _getEmolument(
            decreaseBalance_.amount0,
            emolument
        );
        uint256 emolumentAmt1 = _getEmolument(
            decreaseBalance_.amount1,
            emolument
        );

        {
            IERC20 token0 = decreaseBalance_.vault.token0();
            IERC20 token1 = decreaseBalance_.vault.token1();

            if (emolumentAmt0 > 0)
                token0.safeTransfer(termTreasury, emolumentAmt0);
            if (emolumentAmt1 > 0)
                token1.safeTransfer(termTreasury, emolumentAmt1);

            token0.safeTransfer(
                decreaseBalance_.to,
                decreaseBalance_.amount0 - emolumentAmt0
            );
            token1.safeTransfer(
                decreaseBalance_.to,
                decreaseBalance_.amount1 - emolumentAmt1
            );
            token0.approve(
                address(decreaseBalance_.vault),
                amount0 - decreaseBalance_.amount0
            );
            token1.approve(
                address(decreaseBalance_.vault),
                amount1 - decreaseBalance_.amount1
            );
        }
        {
            (uint256 init0, uint256 init1) = _getInits(
                mintAmount_,
                amount0 - decreaseBalance_.amount0,
                amount1 - decreaseBalance_.amount1
            );
            decreaseBalance_.vault.setInits(init0, init1);
        }

        IGasStation(manager).toggleRestrictMint(
            address(decreaseBalance_.vault)
        );

        decreaseBalance_.vault.mint(mintAmount_, me);

        IGasStation(manager).toggleRestrictMint(
            address(decreaseBalance_.vault)
        );

        emit DecreaseLiquidity(
            msg.sender,
            address(decreaseBalance_.vault),
            emolumentAmt0,
            emolumentAmt1
        );
    }

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
    {
        uint256 index = _requireIsOwner(vaults[msg.sender], address(vault_));
        address vaultAddr = address(vault_);

        delete vaults[msg.sender][index];

        for (uint256 i = index; i < vaults[msg.sender].length - 1; i++) {
            vaults[msg.sender][i] = vaults[msg.sender][i + 1];
        }
        vaults[msg.sender].pop();

        (uint256 amount0, uint256 amount1) = _burn(
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

        IGasStation(manager).removeVault(address(vault_), payable(to_));
        vault_.setManager(IGasStation(newManager_));
        vault_.transferOwnership(newOwner_);

        emit CloseTerm(
            msg.sender,
            vaultAddr,
            amount0,
            amount1,
            to_,
            emolumentAmt0,
            emolumentAmt1
        );
    }
}
