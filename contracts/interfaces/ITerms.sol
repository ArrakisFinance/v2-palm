// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IVaultV2Factory} from "./IVaultV2Factory.sol";
import {SetupPayload} from "../structs/STerms.sol";

interface ITerms {
    function setupVault(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        returns (address vault);

    function v2factory() external view returns (IVaultV2Factory);

    function termTreasury() external view returns (address);

    function manager() external view returns (address);

    function emolument() external view returns (uint16);
}
