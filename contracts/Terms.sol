// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "./interfaces/IArrakisV2Factory.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IArrakisV2, BurnLiquidity} from "./interfaces/IArrakisV2.sol";
import {IGasStation} from "./interfaces/IGasStation.sol";
import {TermsStorage} from "./abstracts/TermsStorage.sol";
import {
    SetupPayload,
    IncreaseBalance,
    DecreaseBalance
} from "./structs/STerms.sol";
import {InitializePayload} from "./interfaces/IArrakisV2.sol";

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
        require(
            setup_.projectTknIsTknZero
                ? setup_.amount0 > 0
                : setup_.amount1 > 0,
            "Terms: no project token allocation."
        );
        require(
            address(setup_.token0) < address(setup_.token1),
            "Terms: tokens order inverted."
        );

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

        _addVault(setup_.owner, vault); // TODO add term
        // Mint vaultV2 token.

        // Call the manager to make it manage the new vault.
        IGasStation(manager).addVault(
            vault,
            setup_.operators,
            setup_.datas_,
            setup_.strat_
        );

        // Transfer to termTreasury the project token emolment.
        setup_.token0.safeTransferFrom(msg.sender, me, setup_.amount0);
        setup_.token1.safeTransferFrom(msg.sender, me, setup_.amount1);

        uint256 emolumentAmt = _getEmolument(
            setup_.projectTknIsTknZero ? setup_.amount0 : setup_.amount1
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

        // TODO need to add a check how much Arrakis token has been mint.

        emit SetupVault(setup_.owner, vault, emolumentAmt);
    }

    // solhint-disable-next-line function-max-lines
    function increaseLiquidity(
        IncreaseBalance calldata increaseBalance_, // memory instead of calldata to set values
        uint256 mintAmount_
    )
        external
        override
        noLeftOver(increaseBalance_.token0, increaseBalance_.token1)
    {
        _requireTokenMatch(
            increaseBalance_.vault,
            increaseBalance_.token0,
            increaseBalance_.token1
        );
        require(
            address(increaseBalance_.token0) < address(increaseBalance_.token1),
            "Terms: tokens order inverted."
        );
        _requireIsOwner(msg.sender, address(increaseBalance_.vault));

        (uint256 amount0, uint256 amount1) = _burn(increaseBalance_.vault);

        // Transfer to termTreasury the project token emolment.
        increaseBalance_.token0.safeTransferFrom(
            msg.sender,
            address(this),
            increaseBalance_.amount0
        );
        increaseBalance_.token1.safeTransferFrom(
            msg.sender,
            address(this),
            increaseBalance_.amount1
        );

        uint256 emolumentAmt;
        uint256 init0;
        uint256 init1;
        if (increaseBalance_.projectTknIsTknZero) {
            emolumentAmt = _getEmolument(increaseBalance_.amount0);

            increaseBalance_.token0.approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount0 - emolumentAmt + amount0
            );

            increaseBalance_.token0.safeTransfer(termTreasury, emolumentAmt);

            increaseBalance_.token1.approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount1
            );

            (init0, init1) = _getInits(
                address(increaseBalance_.token0),
                increaseBalance_.amount0 - emolumentAmt + amount0,
                increaseBalance_.amount1
            );
        } else {
            emolumentAmt = _getEmolument(increaseBalance_.amount1);

            increaseBalance_.token0.approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount0
            );
            increaseBalance_.token1.safeTransfer(termTreasury, emolumentAmt);

            increaseBalance_.token1.approve(
                address(increaseBalance_.vault),
                increaseBalance_.amount1 - emolumentAmt + amount1
            );

            (init0, init1) = _getInits(
                address(increaseBalance_.token0),
                increaseBalance_.amount0,
                increaseBalance_.amount1 - emolumentAmt + amount1
            );
        }

        increaseBalance_.vault.setInits(init0, init1);

        increaseBalance_.vault.mint(mintAmount_, address(this));

        // TODO: rebalance?

        IGasStation(manager).expandMMTermDuration(
            address(increaseBalance_.vault)
        );

        emit IncreaseLiquidity(
            msg.sender,
            address(increaseBalance_.vault),
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
        noLeftOver(decreaseBalance_.token0, decreaseBalance_.token1)
    {
        _requireTokenMatch(
            decreaseBalance_.vault,
            decreaseBalance_.token0,
            decreaseBalance_.token1
        );
        _requireIsOwner(msg.sender, address(decreaseBalance_.vault));
        address me = address(this);
        (uint256 amount0, uint256 amount1) = _burn(decreaseBalance_.vault);
        require(
            decreaseBalance_.amount0 < amount0,
            "Terms: send back amount0 > amount0"
        );
        require(
            decreaseBalance_.amount1 < amount1,
            "Terms: send back amount1 > amount1"
        );
        decreaseBalance_.token0.safeTransfer(
            decreaseBalance_.to,
            decreaseBalance_.amount0
        );
        decreaseBalance_.token1.safeTransfer(
            decreaseBalance_.to,
            decreaseBalance_.amount1
        );
        decreaseBalance_.token0.approve(
            address(decreaseBalance_.vault),
            amount0 - decreaseBalance_.amount0
        );
        decreaseBalance_.token1.approve(
            address(decreaseBalance_.vault),
            amount1 - decreaseBalance_.amount1
        );
        (uint256 init0, uint256 init1) = _getInits(
            address(decreaseBalance_.token0),
            amount0 - decreaseBalance_.amount0,
            amount1 - decreaseBalance_.amount1
        );
        decreaseBalance_.vault.setInits(init0, init1);
        decreaseBalance_.vault.mint(mintAmount_, me);

        // TODO: rebalance?

        emit DecreaseLiquidity(msg.sender, address(decreaseBalance_.vault));
    }

    function closeTerm(IArrakisV2 vault_, address to_) external override {
        uint256 index = _requireIsOwner(msg.sender, address(vault_));
        address vaultAddr = address(vault_);

        (uint256 amount0, uint256 amount1) = _burn(vault_);

        if (amount0 > 0) vault_.token0().safeTransfer(to_, amount0);
        if (amount1 > 0) vault_.token1().safeTransfer(to_, amount1);

        delete vaults[msg.sender][index];

        IGasStation(manager).removeVault(address(vault_), payable(to_));

        emit CloseTerm(msg.sender, vaultAddr, amount0, amount1, to_);
    }

    // #region internal functions.

    function _burn(IArrakisV2 vault_)
        internal
        returns (uint256 amount0, uint256 amount1)
    {
        address me = address(this);
        uint256 balanceOfArrakisTkn = IERC20(address(vault_)).balanceOf(me);
        BurnLiquidity[] memory burnPayload = resolver.standardBurnParams(
            balanceOfArrakisTkn,
            vault_
        );

        (amount0, amount1) = vault_.burn(burnPayload, balanceOfArrakisTkn, me);
    }

    function _requireTokenMatch(
        IArrakisV2 vault_,
        IERC20 token0_,
        IERC20 token1_
    ) internal {
        require(
            address(token0_) == address(vault_.token0()),
            "Terms: wrong token0."
        );
        require(
            address(token1_) == address(vault_.token1()),
            "Terms: wrong token1."
        );
    }

    function _requireIsOwner(address onwer_, address vault_)
        internal
        view
        returns (uint256 index)
    {
        bool isOwner;
        (isOwner, index) = _isOwnerOfVault(onwer_, address(vault_));
        require(isOwner, "Terms: not owner");
    }

    function _isOwnerOfVault(address onwer_, address vault_)
        internal
        view
        returns (bool, uint256 index)
    {
        for (index = 0; index < vaults[onwer_].length; index++) {
            if (vaults[onwer_][index] == vault_) return (true, index);
        }
        return (false, 0);
    }

    function _getEmolument(uint256 projectTokenAllocation_)
        internal
        view
        returns (uint256)
    {
        return (projectTokenAllocation_ * emolument) / 10000;
    }

    // #endregion internal functions.
}
