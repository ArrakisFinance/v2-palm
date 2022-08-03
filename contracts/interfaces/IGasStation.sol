// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Rebalance, Range} from "./IVaultV2.sol";
import {IManagerProxy} from "./IManagerProxy.sol";

interface IGasStation is IManagerProxy {
    struct VaultInfo {
        uint256 balance;
        uint256 lastRebalance;
        bool initialized;
    }

    event AddVault(address vault);

    event RemoveVault(address vault);

    event SetVaultData(address indexed vault, bytes data);

    event AddOperatorsToVault(address vault, address[] operators);

    event RemoveOperatorsToVault(address vault, address[] operators);

    event UpdateVaultBalance(address vault, uint256 newBalance);

    event WithdrawVaultBalance(
        address vault,
        uint256 amount,
        address to,
        uint256 newBalance
    );

    event RebalanceVault(address vault, uint256 newBalance);

    // ======== GELATOFIED FUNCTIONS ========
    function rebalance(
        address vault_,
        Rebalance calldata rebalanceParams_,
        uint256 feeAmount_
    ) external;

    function addRangeAndRebalance(
        address vault_,
        Range[] calldata ranges_,
        Rebalance calldata rebalanceParams_,
        uint256 feeAmount_
    ) external;

    // ======= PERMISSIONED OWNER FUNCTIONS =====
    function withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address to_
    ) external;

    function withdrawAndRemove(address vault_, address to_) external;

    function addVault(address vault_) external;

    function removeVault(address vault_) external;

    function setVaultData(address vault_, bytes calldata data_) external;

    function addOperatorsToVault(address vault_, address[] calldata operators_)
        external;

    function removeOperatorsToVault(
        address vault_,
        address[] calldata operators_
    ) external;

    function pause() external;

    function unpause() external;

    // ======= PUBLIC FUNCTIONS =====

    function fundVaultBalance(address vault_) external payable;
}
