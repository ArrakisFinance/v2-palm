// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "./IArrakisV2Factory.sol";
import {IArrakisV2Resolver} from "./IArrakisV2Resolver.sol";
import {IArrakisV2} from "./IArrakisV2.sol";
import {IGasStation} from "./IGasStation.sol";
import {
    SetupPayload,
    IncreaseBalance,
    ExtendingTermData,
    DecreaseBalance
} from "../structs/STerms.sol";

interface ITerms {
    // #region events.
    event SetEmolument(uint16 oldEmolument, uint16 newEmolment);
    event SetTermTreasury(address oldTermTreasury, address newTermTreasury);
    event SetManager(address oldManager, address newManager);
    event SetResolver(
        IArrakisV2Resolver oldResolver,
        IArrakisV2Resolver newResolver
    );

    event AddVault(address creator, address vault);
    event RemoveVault(address creator, address vault);

    event SetupVault(address creator, address vault, uint256 emolument);
    event IncreaseLiquidity(address creator, address vault, uint256 emolument);
    event ExtendingTerm(address creator, address vault, uint256 emolument);
    event DecreaseLiquidity(address creator, address vault);
    event CloseTerm(
        address creator,
        address vault,
        uint256 amount0,
        uint256 amount1,
        address to
    );

    // #endregion events.

    function openTerm(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        returns (address vault);

    function increaseLiquidity(
        IncreaseBalance calldata increaseBalance_,
        uint256 mintAmount_
    ) external;

    function extendingTerm(
        ExtendingTermData calldata extensionData_,
        uint256 mintAmount_
    ) external;

    function decreaseLiquidity(
        DecreaseBalance calldata decreaseBalance_,
        uint256 mintAmount_
    ) external;

    function closeTerm(
        IArrakisV2 vault_,
        address to_,
        address newOwner_,
        address newManager_
    ) external;

    // #region Vault configuration functions.

    function addPools(IArrakisV2 vault_, uint24[] calldata feeTiers_) external;

    function removePools(IArrakisV2 vault_, address[] calldata pools_) external;

    function setMaxTwapDeviation(IArrakisV2 vault_, int24 maxTwapDeviation_)
        external;

    function setTwapDuration(IArrakisV2 vault_, uint24 twapDuration_) external;

    function setMaxSlippage(IArrakisV2 vault_, uint24 maxSlippage_) external;

    // #endregion Vault configuration functions.

    // #region GasStation configuration functions.

    function setVaultData(address vault_, bytes calldata data_) external;

    function setVaultStratByName(address vault_, string calldata strat_)
        external;

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
