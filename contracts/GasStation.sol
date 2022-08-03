// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IVaultV2, Rebalance, Range} from "./interfaces/IVaultV2.sol";
import {IGasStation} from "./interfaces/IGasStation.sol";
import {OwnableUninitialized} from "./vendor/common/OwnableUninitialized.sol";
import {
    IUniswapV3Pool
} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {
    PausableUpgradeable
} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract GasStation is IGasStation, OwnableUninitialized, PausableUpgradeable {
    using SafeERC20 for IERC20;

    address payable public immutable gelato;

    // XXXXXXXX DO NOT  MODIFY ORDERING XXXXXXXX
    mapping(address => VaultInfo) public vaults;
    // APPPEND ADDITIONAL STATE VARS BELOW:
    // XXXXXXXX DO NOT MODIFY ORDERING XXXXXXXX

    // #region operators.

    mapping(address => address[]) public operatorsByVault;
    mapping(address => bytes) public vaultDatas;

    // #endregion operators.

    modifier onlyManagedVaults(address vault) {
        require(
            vaults[vault].initialized == true,
            "ManagerProxyV1: Vault not found"
        );
        _;
    }

    modifier onlyVaultOwner(address vault) {
        require(
            IVaultV2(vault).owner() == msg.sender,
            "ManagerProxyV1: only vault owner"
        );
        _;
    }

    modifier onlyGelatoOrOwner(uint256 amount) {
        if (msg.sender == gelato) {
            _;
            (bool success, ) = gelato.call{value: amount}("");
            require(success, "ManagerProxyV1: ETH transfer failed");
        } else {
            require(msg.sender == _owner, "ManagerProxyV1: onlyGelatoOrOwner");
            _;
        }
    }

    constructor(address gelato_) {
        gelato = payable(gelato_);
    }

    function initialize(address owner_) external initializer {
        _owner = owner_;
        __Pausable_init();
    }

    function rebalance(
        address vault_,
        Rebalance calldata rebalanceParams_,
        uint256 feeAmount_
    )
        external
        override
        whenNotPaused
        onlyManagedVaults(vault_)
        onlyGelatoOrOwner(feeAmount_)
    {
        uint256 balance = _preExec(vault_, feeAmount_);
        IVaultV2(vault_).rebalance(rebalanceParams_);
        emit RebalanceVault(vault_, balance);
    }

    function addRangeAndRebalance(
        address vault_,
        Range[] calldata ranges_,
        Rebalance calldata rebalanceParams_,
        uint256 feeAmount_
    )
        external
        override
        whenNotPaused
        onlyManagedVaults(vault_)
        onlyGelatoOrOwner(feeAmount_)
    {
        uint256 balance = _preExec(vault_, feeAmount_);
        IVaultV2(vault_).addRangeAndRebalance(ranges_, rebalanceParams_);
        emit RebalanceVault(vault_, balance);
    }

    // ====== PERMISSIONED OWNER FUNCTIONS ========
    function pause() external override onlyOwner {
        _pause();
    }

    function unpause() external override onlyOwner {
        _unpause();
    }

    function addVault(address vault_) external override onlyVaultOwner(vault_) {
        require(
            vaults[vault_].initialized == false,
            "ManagerProxyV1: Vault already added"
        );
        vaults[vault_] = VaultInfo({
            balance: 0,
            lastRebalance: 0,
            initialized: true
        });
        emit AddVault(vault_);
    }

    function removeVault(address vault_)
        external
        override
        onlyVaultOwner(vault_)
    {
        if (keccak256(vaultDatas[vault_]) != keccak256(""))
            _setVaultData(vault_, "");
        if (operatorsByVault[vault_].length > 0)
            _removeOperatorsToVault(vault_, operatorsByVault[vault_]);
        _removeVault(vault_);
    }

    function setVaultData(address vault_, bytes calldata data_)
        external
        override
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
    {
        _setVaultData(vault_, data_);
    }

    function addOperatorsToVault(address vault_, address[] calldata operators_)
        external
        override
        onlyVaultOwner(vault_)
        onlyManagedVaults(vault_)
    {
        for (uint256 i = 0; i < operators_.length; i++) {
            (bool isAssociated, ) = _isOperatorAssociatedtoVault(
                vault_,
                operators_[i]
            );
            require(!isAssociated, "ManagerProxyV1: operator");
            operatorsByVault[vault_].push(operators_[i]);
        }

        emit AddOperatorsToVault(vault_, operators_);
    }

    function removeOperatorsToVault(
        address vault_,
        address[] calldata operators_
    ) external override onlyVaultOwner(vault_) onlyManagedVaults(vault_) {
        _removeOperatorsToVault(vault_, operators_);
    }

    function withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address to_
    ) external override onlyVaultOwner(vault_) {
        require(
            vaults[vault_].balance >= amount_,
            "ManagerProxyV1: amount exceeds available balance"
        );
        vaults[vault_].balance -= amount_;
        Address.sendValue(payable(to_), amount_);
    }

    function withdrawAndRemove(address vault_, address to_)
        external
        override
        onlyVaultOwner(vault_)
    {
        require(vaults[vault_].balance > 0, "ManagerProxyV1: balance 0");

        emit WithdrawVaultBalance(vault_, vaults[vault_].balance, to_, 0);
        Address.sendValue(payable(to_), vaults[vault_].balance = 0);

        if (keccak256(vaultDatas[vault_]) != keccak256(""))
            _setVaultData(vault_, "");

        if (operatorsByVault[vault_].length > 0)
            _removeOperatorsToVault(vault_, operatorsByVault[vault_]);

        _removeVault(vault_);
    }

    // ====== EXTERNAL FUNCTIONS ========
    function fundVaultBalance(address vault_)
        external
        payable
        override
        onlyManagedVaults(vault_)
    {
        vaults[vault_].balance += msg.value;
        emit UpdateVaultBalance(vault_, vaults[vault_].balance);
    }

    // #region ====== INTERNAL FUNCTIONS ========

    function _preExec(address vault_, uint256 feeAmount_)
        internal
        returns (uint256 balance)
    {
        VaultInfo memory vaultInfo = vaults[vault_];
        require(
            vaultInfo.balance > feeAmount_,
            "ManagerProxyV1: Not enough balance to pay fee"
        );
        balance = vaultInfo.balance - feeAmount_;

        // update lastRebalance time
        // solhint-disable-next-line not-rely-on-time
        vaults[vault_].lastRebalance = block.timestamp;
        vaults[vault_].balance = balance;
    }

    function _removeVault(address vault_) internal {
        require(
            vaults[vault_].initialized == true,
            "ManagerProxyV1: Vault not found"
        );
        require(
            vaults[vault_].balance == 0,
            "ManagerProxyV1: Vault still has balance"
        );
        delete vaults[vault_];
        emit RemoveVault(vault_);
    }

    function _setVaultData(address vault_, bytes memory data_) internal {
        require(
            keccak256(vaultDatas[vault_]) != keccak256(data_),
            "ManagerProxyV1: data"
        );

        vaultDatas[vault_] = data_;

        emit SetVaultData(vault_, data_);
    }

    function _removeOperatorsToVault(
        address vault_,
        address[] memory operators_
    ) internal {
        for (uint256 i = 0; i < operators_.length; i++) {
            (bool isAssociated, uint256 index) = _isOperatorAssociatedtoVault(
                vault_,
                operators_[i]
            );
            require(isAssociated, "ManagerProxyV1: no operator");

            delete operatorsByVault[vault_][index];
        }

        emit RemoveOperatorsToVault(vault_, operators_);
    }

    function _isOperatorAssociatedtoVault(address vault_, address operator_)
        internal
        view
        returns (bool isAssociated, uint256 index)
    {
        for (uint256 i = 0; i < operatorsByVault[vault_].length; i++) {
            isAssociated = operatorsByVault[vault_][i] == operator_;
            if (isAssociated) return (isAssociated, i);
        }
    }

    // #endregion ====== INTERNAL FUNCTIONS ========
}
