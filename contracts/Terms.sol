// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IVaultV2Factory} from "./interfaces/IVaultV2Factory.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IVaultV2} from "./interfaces/IVaultV2.sol";
import {IGasStation} from "./interfaces/IGasStation.sol";
import {TermsStorage} from "./abstracts/TermsStorage.sol";
import {SetupPayload} from "./structs/STerms.sol";
import {InitializePayload} from "./interfaces/IVaultV2.sol";

// solhint-disable-next-line no-empty-blocks
contract Terms is TermsStorage {
    using SafeERC20 for IERC20;

    // solhint-disable-next-line no-empty-blocks
    constructor(IVaultV2Factory v2factory_) TermsStorage(v2factory_) {}

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

        IVaultV2 vaultV2 = IVaultV2(vault);

        vaultV2.toggleRestrictMint();

        _addVault(setup_.owner, vault);
        // Mint vaultV2 token.

        // Call the manager to make it manage the new vault.
        IGasStation(manager).addVault(vault);

        // Transfer to termTreasury the project token emolment.
        projectTokenERC20.safeTransferFrom(
            msg.sender,
            me,
            setup_.projectTokenAllocation
        );

        uint256 emolumentAmt = (setup_.projectTokenAllocation * emolument) /
            10000;

        projectTokenERC20.safeTransfer(
            vault,
            setup_.projectTokenAllocation - emolumentAmt
        );
        vaultV2.mint(mintAmount_, me);
        // TODO need to add a check how much Arrakis token has been mint.

        projectTokenERC20.safeTransfer(termTreasury, emolumentAmt);

        emit SetupVault(setup_.owner, vault, emolumentAmt);
    }
}
