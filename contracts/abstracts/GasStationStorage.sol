// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IGasStation} from "../interfaces/IGasStation.sol";
import {IArrakisV2} from "../interfaces/IArrakisV2.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {
    PausableUpgradeable
} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {VaultInfo} from "../structs/SGasStation.sol";

/// @dev owner should be the Terms smart contract.
abstract contract GasStationStorage is
    IGasStation,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;
    using Address for address payable;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // #region gelato bots.

    address payable public immutable gelato;

    // #endregion gelato bots.

    // #region manager fees.

    uint16 public immutable managerFeeBPS;

    // #endregion manager fees.

    // #region Terms.

    address public immutable terms;

    // #endregion Terms.

    // #region Terms Market Making Duration.

    uint256 public immutable mmTermDuration;

    // #endregion Terms Market Making Duration.

    // #region whitelisted strategies.

    EnumerableSet.Bytes32Set internal _whitelistedStrat;

    // #endregion whitelisted strategies.

    // #region vaults related data.

    mapping(address => VaultInfo) public vaults;

    // #endregion vaults related data.

    // #region operators.

    address[] public operators;

    // #endregion operators.

    // #region modifiers.

    modifier onlyTerms() {
        require(msg.sender == terms, "GasStation: only Terms");
        _;
    }

    modifier onlyTermsVaults(address vault) {
        require(
            IArrakisV2(vault).owner() == terms,
            "GasStation: owner no Terms"
        );
        _;
    }

    modifier onlyManagedVaults(address vault) {
        require(
            // solhint-disable-next-line not-rely-on-time
            vaults[vault].endOfMM >= block.timestamp &&
                vaults[vault].endOfMM != 0,
            "GasStation: Vault not managed"
        );
        _;
    }

    modifier onlyVaultOwner(address vault) {
        require(
            IArrakisV2(vault).owner() == msg.sender,
            "GasStation: only vault owner"
        );
        _;
    }

    modifier onlyOperators() {
        (bool isOperator, ) = _isOperator(msg.sender);
        require(isOperator, "GasStation: no operator");
        _;
    }

    modifier requireAddressNotZero(address addr) {
        require(addr != address(0), "GasStation: address Zero");
        _;
    }

    // #endregion modifiers.

    // #region constructor.

    constructor(
        address gelato_,
        uint16 managerFeeBPS_,
        address terms_,
        uint256 mmTermDuration_
    ) {
        gelato = payable(gelato_);
        managerFeeBPS = managerFeeBPS_;
        terms = terms_;
        mmTermDuration = mmTermDuration_;
    }

    // #endregion constructor.

    // #region initialize function.

    function initialize(address owner_) external initializer {
        _transferOwnership(owner_);
        __Pausable_init();
    }

    // #endregion initialize function.

    // #region permissioned owner functions.

    function pause() external override onlyOwner {
        _pause();
    }

    function unpause() external override onlyOwner {
        _unpause();
    }

    // #endregion permissioned owner functions.

    function addVault(
        address vault_,
        bytes calldata datas_,
        string calldata strat_
    )
        external
        payable
        override
        whenNotPaused
        requireAddressNotZero(vault_)
        onlyTermsVaults(vault_)
    {
        _addVault(vault_, datas_, strat_);
        if (msg.value > 0) _fundVaultBalance(vault_);
    }

    function removeVault(address vault_, address payable to_)
        external
        override
        whenNotPaused
        requireAddressNotZero(vault_)
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
    {
        _removeVault(vault_, to_);
    }

    function setVaultData(address vault_, bytes calldata data_)
        external
        override
        whenNotPaused
        requireAddressNotZero(vault_)
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
    {
        _setVaultData(vault_, data_);
    }

    function setVaultStraByName(address vault_, string calldata strat_)
        external
        override
        whenNotPaused
        requireAddressNotZero(vault_)
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
    {
        _setVaultStrat(vault_, keccak256(abi.encodePacked(strat_)));
    }

    function addOperators(address[] calldata operators_)
        external
        override
        whenNotPaused
        onlyOwner
    {
        for (uint256 i = 0; i < operators_.length; i++) {
            (bool isOperator, ) = _isOperator(operators_[i]);
            require(!isOperator, "GasStation: operator");
            operators.push(operators_[i]);
        }

        emit AddOperators(address(this), operators_);
    }

    function removeOperators(address[] calldata operators_)
        external
        override
        whenNotPaused
        onlyOwner
    {
        _removeOperators(operators_);
    }

    function withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address payable to_
    )
        external
        override
        whenNotPaused
        requireAddressNotZero(vault_)
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
        requireAddressNotZero(address(to_))
    {
        _withdrawVaultBalance(vault_, amount_, to_);
    }

    function fundVaultBalance(address vault_)
        external
        payable
        override
        whenNotPaused
        onlyManagedVaults(vault_)
    {
        _fundVaultBalance(vault_);
    }

    function expandMMTermDuration(address vault_)
        external
        override
        whenNotPaused
        onlyTerms
        requireAddressNotZero(vault_)
        onlyManagedVaults(vault_)
    {
        emit ExpandTermDuration(
            vault_,
            vaults[vault_].endOfMM,
            // solhint-disable-next-line not-rely-on-time
            vaults[vault_].endOfMM = block.timestamp + mmTermDuration
        );
    }

    function toggleRestrictMint(address vault_)
        external
        override
        whenNotPaused
        requireAddressNotZero(vault_)
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
    {
        IArrakisV2(vault_).toggleRestrictMint();
        emit ToggleRestrictMint(vault_);
    }

    function whitelistStrat(string calldata strat_)
        external
        whenNotPaused
        onlyOwner
    {
        bytes32 stratB32 = keccak256(abi.encodePacked(strat_));
        require(
            stratB32 != keccak256(abi.encodePacked("")),
            "GasStation: empty string"
        );
        require(
            !_whitelistedStrat.contains(stratB32),
            "GasStation: strat whitelisted."
        );
        _whitelistedStrat.add(stratB32);

        emit WhitelistStrat(address(this), strat_);
    }

    function getWhitelistedStrat()
        external
        view
        override
        returns (bytes32[] memory)
    {
        return _whitelistedStrat.values();
    }

    function getVaultInfo(address vault_)
        external
        view
        override
        requireAddressNotZero(vault_)
        returns (VaultInfo memory)
    {
        return vaults[vault_];
    }

    // #region internal functions.

    function _addVault(
        address vault_,
        bytes calldata datas_,
        string calldata strat_
    ) internal {
        bytes32 stratEncoded = keccak256(abi.encodePacked(strat_));
        require(
            _whitelistedStrat.contains(stratEncoded),
            "GasStation: Not whitelisted"
        );
        require(vaults[vault_].endOfMM == 0, "GasStation: Vault already added");
        vaults[vault_].datas = datas_;
        vaults[vault_].strat = stratEncoded;

        // solhint-disable-next-line not-rely-on-time
        vaults[vault_].endOfMM = block.timestamp + mmTermDuration;

        emit AddVault(vault_, datas_, strat_);
    }

    function _fundVaultBalance(address vault_) internal {
        vaults[vault_].balance += msg.value;
        emit UpdateVaultBalance(vault_, vaults[vault_].balance);
    }

    function _removeVault(address vault_, address payable to_) internal {
        uint256 balance = vaults[vault_].balance;
        vaults[vault_].balance = 0;

        delete vaults[vault_];

        if (balance > 0) to_.sendValue(balance);

        emit RemoveVault(vault_, balance);
    }

    function _setVaultData(address vault_, bytes memory data_) internal {
        require(
            keccak256(vaults[vault_].datas) != keccak256(data_),
            "GasStation: data"
        );

        vaults[vault_].datas = data_;

        emit SetVaultData(vault_, data_);
    }

    function _setVaultStrat(address vault_, bytes32 strat_) internal {
        require(vaults[vault_].strat != strat_, "GasStation: strat");

        require(
            _whitelistedStrat.contains(strat_),
            "GasStation: strat not whitelisted."
        );

        vaults[vault_].strat = strat_;

        emit SetVaultStrat(vault_, strat_);
    }

    function _removeOperators(address[] memory operators_) internal {
        for (uint256 i = 0; i < operators_.length; i++) {
            (bool isOperator, uint256 index) = _isOperator(operators_[i]);
            require(isOperator, "GasStation: no operator");

            delete operators[index];
        }

        emit RemoveOperators(address(this), operators_);
    }

    function _withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address payable to_
    ) internal {
        require(
            vaults[vault_].balance >= amount_,
            "GasStation: amount exceeds available balance"
        );
        vaults[vault_].balance -= amount_;
        to_.sendValue(amount_);

        emit WithdrawVaultBalance(vault_, amount_, to_, vaults[vault_].balance);
    }

    function _isOperator(address operator_)
        internal
        view
        requireAddressNotZero(operator_)
        returns (bool, uint256)
    {
        for (uint256 index = 0; index < operators.length; index++) {
            if (operators[index] == operator_) return (true, index);
        }
        return (false, 0);
    }

    // #endregion internal functions.
}
