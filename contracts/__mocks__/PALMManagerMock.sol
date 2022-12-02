// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {PALMManagerStorage} from "../abstracts/PALMManagerStorage.sol";
import {Range, Rebalance} from "../interfaces/IArrakisV2.sol";
import {VaultInfo} from "../structs/SPALMManager.sol";

contract PALMManagerMock is PALMManagerStorage {
    constructor(address terms_, uint256 termDuration_)
        PALMManagerStorage(terms_, termDuration_)
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
        Range[] calldata ranges_,
        Rebalance calldata rebalanceParams_,
        Range[] calldata rangesToRemove_,
        uint256 feeAmount_
    ) external {} // solhint-disable-line no-empty-blocks
}
