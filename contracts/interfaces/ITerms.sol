// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "./IArrakisV2Factory.sol";
import {IArrakisV2} from "./IArrakisV2.sol";
import {IGasStation} from "./IGasStation.sol";
import {
    SetupPayload,
    IncreaseBalance,
    DecreaseBalance
} from "../structs/STerms.sol";

interface ITerms {
    function openTerm(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        returns (address vault);

    function increaseLiquidity(
        IncreaseBalance calldata increaseBalance_,
        uint256 mintAmount_
    ) external;

    function decreaseLiquidity(
        DecreaseBalance calldata decreaseBalance_,
        uint256 mintAmount_
    ) external;

    function closeTerm(IArrakisV2 vault_, address to_) external;

    // #region Vault configuration functions.

    function addPools(IArrakisV2 vault_, uint24[] calldata feeTiers_) external;

    function removePools(IArrakisV2 vault_, address[] calldata pools_) external;

    function setManager(IArrakisV2 vault_, IGasStation manager_) external;

    function setMaxTwapDeviation(IArrakisV2 vault_, int24 maxTwapDeviation_)
        external;

    function setTwapDuration(IArrakisV2 vault_, uint24 twapDuration_) external;

    function setMaxSlippage(IArrakisV2 vault_, uint24 maxSlippage_) external;

    // #endregion Vault configuration functions.

    // #region GasStation configuration functions.

    function setVaultData(address vault_, bytes calldata data_) external;

    function setVaultStratByName(address vault_, string calldata strat_)
        external;

    function addOperatorsToVault(address vault_, address[] calldata operators_)
        external;

    function removeOperatorsToVault(
        address vault_,
        address[] calldata operators_
    ) external;

    function withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address payable to_
    ) external;

    // #endregion GasStation configuration functions.

    function v2factory() external view returns (IArrakisV2Factory);

    function termTreasury() external view returns (address);

    function manager() external view returns (address);

    function emolument() external view returns (uint16);
}
