// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IArrakisV2Factory} from "../interfaces/IArrakisV2Factory.sol";
import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {PALMTermsStorage} from "../abstracts/PALMTermsStorage.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    SetupPayload,
    IncreaseBalance,
    DecreaseBalance
} from "../structs/SPALMTerms.sol";

// solhint-disable

contract PALMTermsMock is PALMTermsStorage {
    using EnumerableSet for EnumerableSet.AddressSet;

    // solhint-disable-next-line no-empty-blocks
    constructor(IArrakisV2Factory v2factory_) PALMTermsStorage(v2factory_) {}

    // #region mock functions.

    function addVault(address vault_) external {
        _vaults[msg.sender].add(vault_);
    }

    // #endregion mock functions.

    function openTerm(SetupPayload calldata setup_)
        external
        payable
        override
        returns (address vault)
    {
        vault = address(0);
    }

    function increaseLiquidity(IncreaseBalance calldata increaseBalance_)
        external
        override
    {}

    function renewTerm(IArrakisV2 vault_) external override {}

    function decreaseLiquidity(DecreaseBalance calldata decreaseBalance_)
        external
        override
    {}

    function closeTerm(
        IArrakisV2 vault_,
        address to_,
        address newOwner_,
        address newManager_
    ) external {}

    receive() external payable {}
}
