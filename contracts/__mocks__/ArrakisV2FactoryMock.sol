// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ArrakisV2Mock} from "./ArrakisV2Mock.sol";
import {InitializePayload} from "../interfaces/IArrakisV2.sol";

contract ArrakisV2FactoryMock {
    function deployVault(InitializePayload calldata params_)
        external
        returns (address)
    {
        return address(new ArrakisV2Mock(params_.owner));
    }
}
