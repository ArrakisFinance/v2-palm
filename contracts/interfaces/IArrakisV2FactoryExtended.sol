// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {
    IArrakisV2Beacon
} from "@arrakisfi/v2-core/contracts/interfaces/IArrakisV2Beacon.sol";
import {
    IArrakisV2Factory
} from "@arrakisfi/v2-core/contracts/interfaces/IArrakisV2Factory.sol";
import {
    InitializePayload
} from "@arrakisfi/v2-core/contracts/structs/SArrakisV2.sol";

interface IArrakisV2FactoryExtended is IArrakisV2Factory {
    // #region view functions

    function version() external view returns (string memory);

    function arrakisV2Beacon() external view returns (IArrakisV2Beacon);

    function numVaults() external view returns (uint256);

    function vaults() external view returns (address[] memory);

    function getProxyAdmin(address proxy) external view returns (address);

    function getProxyImplementation(address proxy)
        external
        view
        returns (address);

    // #endregion view functions
}
