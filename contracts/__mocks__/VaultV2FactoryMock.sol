// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {VaultV2Mock} from "./VaultV2Mock.sol";
import {InitializePayload} from "../interfaces/IVaultV2.sol";

contract VaultV2FactoryMock {
    function deployVault(InitializePayload calldata params_)
        external
        returns (address)
    {
        return address(new VaultV2Mock(params_.owner));
    }
}
