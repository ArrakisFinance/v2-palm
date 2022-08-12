// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "./IArrakisV2Factory.sol";
import {IArrakisV2} from "./IArrakisV2.sol";
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

    function v2factory() external view returns (IArrakisV2Factory);

    function termTreasury() external view returns (address);

    function manager() external view returns (address);

    function emolument() external view returns (uint16);
}
