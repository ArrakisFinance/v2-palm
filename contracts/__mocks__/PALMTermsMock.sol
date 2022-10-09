// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "../interfaces/IArrakisV2Factory.sol";
import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {PALMTermsStorage} from "../abstracts/PALMTermsStorage.sol";
import {
    SetupPayload,
    IncreaseBalance,
    DecreaseBalance
} from "../structs/SPALMTerms.sol";

// solhint-disable

contract PALMTermsMock is PALMTermsStorage {
    // solhint-disable-next-line no-empty-blocks
    constructor(IArrakisV2Factory v2factory_) PALMTermsStorage(v2factory_) {}

    // #region mock functions.

    function addVault(address vault_) external {
        vaults[msg.sender].push(vault_);
    }

    // #endregion mock functions.

    function openTerm(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        payable
        override
        returns (address vault)
    {
        vault = address(0);
    }

    function increaseLiquidity(
        IncreaseBalance calldata increaseBalance_,
        uint256 mintAmount_
    ) external override {}

    function renewTerm(IArrakisV2 vault_) external override {}

    function decreaseLiquidity(
        DecreaseBalance calldata decreaseBalance_,
        uint256 mintAmount_
    ) external override {}

    function closeTerm(
        IArrakisV2 vault_,
        address to_,
        address newOwner_,
        address newManager_
    ) external {}
}
