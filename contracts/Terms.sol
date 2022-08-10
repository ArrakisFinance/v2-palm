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
import {SetupPayload} from "./structs/STerms.sol";
import {InitializePayload} from "./interfaces/IArrakisV2.sol";

// solhint-disable-next-line no-empty-blocks
contract Terms is TermsStorage {
    using SafeERC20 for IERC20;

    // solhint-disable-next-line no-empty-blocks
    constructor(IArrakisV2Factory v2factory_) TermsStorage(v2factory_) {}

    /// @notice do all neccesary step to initialize market making.
    // solhint-disable-next-line function-max-lines
    function setupVault(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        override
        returns (address vault)
    {
        require(
            setup_.projectTokenAllocation > 0,
            "Terms: no project token allocation."
        );
        // Check that user send some project token.
        IERC20 baseTokenERC20 = IERC20(setup_.baseToken);
        IERC20 projectTokenERC20 = IERC20(setup_.projectToken);
        address me = address(this);

        require(
            projectTokenERC20.allowance(msg.sender, me) >=
                setup_.projectTokenAllocation,
            "Terms: project token allowance insufficient."
        );
        require(
            baseTokenERC20.allowance(msg.sender, me) >=
                setup_.baseTokenAllocation,
            "Terms: base token allowance insufficient."
        );

        (address token0, address token1) = setup_.baseToken >
            setup_.projectToken
            ? (setup_.projectToken, setup_.baseToken)
            : (setup_.baseToken, setup_.projectToken);

        // Create vaultV2.
        vault = v2factory.deployVault(
            InitializePayload({
                feeTiers: setup_.feeTiers,
                token0: token0,
                token1: token1,
                owner: me,
                init0: setup_.init0,
                init1: setup_.init1,
                manager: manager,
                maxTwapDeviation: setup_.maxTwapDeviation,
                twapDuration: setup_.twapDuration,
                maxSlippage: setup_.maxSlippage
            })
        );

        IArrakisV2 vaultV2 = IArrakisV2(vault);

        vaultV2.toggleRestrictMint();

        _addVault(setup_.owner, vault);
        // Mint vaultV2 token.

        // Call the manager to make it manage the new vault.
        IGasStation(manager).addVault(
            vault,
            setup_.operators_,
            setup_.datas_,
            setup_.strat_
        );

        // Transfer to termTreasury the project token emolment.
        projectTokenERC20.safeTransferFrom(
            msg.sender,
            me,
            setup_.projectTokenAllocation
        );
        baseTokenERC20.safeTransferFrom(
            msg.sender,
            me,
            setup_.baseTokenAllocation
        );

        uint256 emolumentAmt = (setup_.projectTokenAllocation * emolument) /
            10000;

        projectTokenERC20.approve(
            vault,
            setup_.projectTokenAllocation - emolumentAmt
        );
        baseTokenERC20.approve(vault, setup_.baseTokenAllocation);
        vaultV2.mint(mintAmount_, me);
        // TODO need to add a check how much Arrakis token has been mint.

        projectTokenERC20.safeTransfer(termTreasury, emolumentAmt);

        emit SetupVault(setup_.owner, vault, emolumentAmt);
    }

    // solhint-disable-next-line function-max-lines
    function changeSetup(
        IArrakisV2 vault_,
        SetupPayload memory setup_,
        uint256 mintAmount_
    ) external override {
        (bool isOwner, ) = _isOwnerOfVault(msg.sender, address(vault_));
        require(isOwner, "Terms: not owner");
        (address token0, address token1) = setup_.baseToken >
            setup_.projectToken
            ? (setup_.projectToken, setup_.baseToken)
            : (setup_.baseToken, setup_.projectToken);
        require(token0 == address(vault_.token0()), "Terms: wrong token0.");
        require(token1 == address(vault_.token0()), "Terms: wrong token0.");

        IERC20 baseTokenERC20 = IERC20(setup_.baseToken);
        IERC20 projectTokenERC20 = IERC20(setup_.projectToken);
        address me = address(this);

        uint256 balanceOfArrakisTkn = IERC20(address(vault_)).balanceOf(me);

        BurnLiquidity[] memory burnPayload = resolver.standardBurnParams(
            balanceOfArrakisTkn,
            vault_
        );

        (uint256 amount0, uint256 amount1) = vault_.burn(
            burnPayload,
            balanceOfArrakisTkn,
            me
        );

        // Transfer to termTreasury the project token emolment.
        projectTokenERC20.safeTransferFrom(
            msg.sender,
            me,
            setup_.projectTokenAllocation
        );
        baseTokenERC20.safeTransferFrom(
            msg.sender,
            me,
            setup_.baseTokenAllocation
        );

        uint256 emolumentAmt = (setup_.projectTokenAllocation * emolument) /
            10000;

        setup_.projectTokenAllocation =
            setup_.projectTokenAllocation -
            emolumentAmt +
            (setup_.baseToken > setup_.projectToken ? amount0 : amount1);

        setup_.baseTokenAllocation =
            setup_.baseTokenAllocation +
            (setup_.baseToken > setup_.projectToken ? amount1 : amount0);

        IERC20(setup_.projectToken).approve(
            address(vault_),
            setup_.projectTokenAllocation
        );
        IERC20(setup_.baseToken).approve(
            address(vault_),
            setup_.baseTokenAllocation
        );
        vault_.mint(mintAmount_, me);

        projectTokenERC20.safeTransfer(termTreasury, emolumentAmt);

        emit SetupVault(setup_.owner, address(vault_), emolumentAmt);
    }

    function closeTerm(IArrakisV2 vault_, address to_) external override {
        (bool isOwner, uint256 index) = _isOwnerOfVault(
            msg.sender,
            address(vault_)
        );
        require(isOwner, "Terms: not owner");
        address me = address(this);
        address vaultAddr = address(vault_);

        uint256 balanceOfArrakisTkn = IERC20(vaultAddr).balanceOf(me);

        BurnLiquidity[] memory burnPayload = resolver.standardBurnParams(
            balanceOfArrakisTkn,
            vault_
        );

        (uint256 amount0, uint256 amount1) = vault_.burn(
            burnPayload,
            balanceOfArrakisTkn,
            me
        );

        if (amount0 > 0) vault_.token0().safeTransfer(to_, amount0);
        if (amount1 > 0) vault_.token1().safeTransfer(to_, amount1);

        delete vaults[vaultAddr][index];

        emit CloseTerm(msg.sender, vaultAddr, amount0, amount1, to_);
    }

    // #region internal functions.

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

    // #endregion internal functions.
}
