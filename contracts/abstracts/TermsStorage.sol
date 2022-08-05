// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ITerms} from "../interfaces/ITerms.sol";
import {IVaultV2Factory} from "../interfaces/IVaultV2Factory.sol";
import {OwnableUninitialized} from "./OwnableUninitialized.sol";
import {
    ReentrancyGuardUpgradeable
} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

// solhint-disable-next-line max-states-count
abstract contract TermsStorage is
    ITerms,
    OwnableUninitialized,
    ReentrancyGuardUpgradeable
{
    IVaultV2Factory public immutable v2factory;
    mapping(address => address[]) public vaults;
    address public termTreasury;
    address public manager;
    uint16 public emolument;

    // #region events.

    event SetEmolument(uint16 oldEmolument, uint16 newEmolment);
    event SetTermTreasury(address oldTermTreasury, address newTermTreasury);
    event SetManager(address oldManager, address newManager);

    event AddVault(address creator, address vault);
    event RemoveVault(address creator, address vault);

    event SetupVault(address creator, address vault, uint256 emolument);

    // #endregion events.

    constructor(IVaultV2Factory v2factory_) {
        v2factory = v2factory_;
    }

    function initialize(
        address owner_,
        address termTreasury_,
        address manager_,
        uint16 emolument_
    ) external {
        require(emolument < 10000, "Terms: emolument >= 100%.");
        require(manager_ != address(0), "Terms: manager address zero.");
        _owner = owner_;
        termTreasury = termTreasury_;
        manager = manager_;
        emolument = emolument_;
    }

    // #region setter.

    function setEmolument(uint16 emolument_) external onlyOwner {
        require(
            emolument_ < emolument,
            "Terms: new emolument >= old emolument"
        );
        emit SetEmolument(emolument, emolument_);
        emolument = emolument_;
    }

    function setTermTreasury(address termTreasury_) external onlyOwner {
        emit SetTermTreasury(termTreasury, termTreasury_);
        termTreasury = termTreasury_;
    }

    function setManager(address manager_) external onlyOwner {
        emit SetManager(manager, manager_);
        manager = manager_;
    }

    // #endregion setter.

    // #region internals setter.

    function _addVault(address creator_, address vault_) internal {
        address[] storage vaultsOfCreator = vaults[creator_];

        for (uint256 i = 0; i < vaultsOfCreator.length; i++) {
            require(vaultsOfCreator[i] != vault_, "Terms: vault exist");
        }

        vaultsOfCreator.push(vault_);
        emit AddVault(creator_, vault_);
    }

    function _removeVault(address creator_, address vault_) internal {
        address[] storage vaultsOfCreator = vaults[creator_];

        for (uint256 i = 0; i < vaultsOfCreator.length; i++) {
            if (vaultsOfCreator[i] == vault_) {
                delete vaultsOfCreator[i];
                emit RemoveVault(creator_, vault_);
                return;
            }
        }

        revert("Terms: vault don't exist");
    }

    // #endregion internals setter.
}
