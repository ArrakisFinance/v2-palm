// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ITerms} from "../interfaces/ITerms.sol";
import {IArrakisV2Factory} from "../interfaces/IArrakisV2Factory.sol";
import {IArrakisV2Resolver} from "../interfaces/IArrakisV2Resolver.sol";
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
    IArrakisV2Factory public immutable v2factory;
    mapping(address => address[]) public vaults;
    address public termTreasury;
    address public manager;
    uint16 public emolument;
    IArrakisV2Resolver public resolver;

    // #region events.

    event SetEmolument(uint16 oldEmolument, uint16 newEmolment);
    event SetTermTreasury(address oldTermTreasury, address newTermTreasury);
    event SetManager(address oldManager, address newManager);
    event SetResolver(
        IArrakisV2Resolver oldResolver,
        IArrakisV2Resolver newResolver
    );

    event AddVault(address creator, address vault);
    event RemoveVault(address creator, address vault);

    event SetupVault(address creator, address vault, uint256 emolument);
    event CloseTerm(
        address creator,
        address vault,
        uint256 amount0,
        uint256 amount1,
        address to
    );

    // #endregion events.

    constructor(IArrakisV2Factory v2factory_) {
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
        emit SetEmolument(emolument, emolument = emolument_);
    }

    function setTermTreasury(address termTreasury_) external onlyOwner {
        emit SetTermTreasury(termTreasury, termTreasury = termTreasury_);
    }

    function setManager(address manager_) external onlyOwner {
        emit SetManager(manager, manager = manager_);
    }

    function setResolver(IArrakisV2Resolver resolver_) external onlyOwner {
        emit SetResolver(resolver, resolver = resolver_);
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
