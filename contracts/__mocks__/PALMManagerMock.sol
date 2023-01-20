// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {PALMManagerStorage} from "../abstracts/PALMManagerStorage.sol";
import {Rebalance} from "@arrakisfi/v2-core/contracts/structs/SArrakisV2.sol";
import {VaultInfo} from "../structs/SPALMManager.sol";

contract PALMManagerMock is PALMManagerStorage {
    constructor(
        address terms_,
        uint256 termDuration_,
        uint16 _managerFeeBPS_
    )
        PALMManagerStorage(terms_, termDuration_, _managerFeeBPS_)
    // solhint-disable-next-line no-empty-blocks
    {

    }

    function addVaultMock(address vault_) external payable {
        vaults[vault_] = VaultInfo({
            balance: 1 ether,
            lastRebalance: 0,
            datas: "",
            strat: bytes32(0),
            termEnd: block.timestamp + 24 * 60 * 60 * 365 // solhint-disable-line not-rely-on-time
        });
    }

    function rebalance(
        address vault_,
        Rebalance calldata rebalanceParams_,
        uint256 feeAmount_
    ) external {} // solhint-disable-line no-empty-blocks
}
