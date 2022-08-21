// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "../interfaces/IArrakisV2Factory.sol";
import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {TermsStorage} from "../abstracts/TermsStorage.sol";
import {
    SetupPayload,
    IncreaseBalance,
    ExtendingTermData,
    DecreaseBalance
} from "../structs/STerms.sol";

// solhint-disable

contract TermsMock is TermsStorage {
    // solhint-disable-next-line no-empty-blocks
    constructor(IArrakisV2Factory v2factory_) TermsStorage(v2factory_) {}

    // #region mock functions.

    function addVault(address vault_) external {
        vaults[msg.sender].push(vault_);
    }

    // #endregion mock functions.

    function openTerm(SetupPayload calldata setup_, uint256 mintAmount_)
        external
        override
        returns (address vault)
    {
        vault = address(0);
    }

    function increaseLiquidity(
        IncreaseBalance calldata increaseBalance_,
        uint256 mintAmount_
    ) external override {}

    function extendingTerm(
        ExtendingTermData calldata extensionData_,
        uint256 mintAmount_
    ) external override {}

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
