// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Rebalance, Range} from "./IArrakisV2.sol";
import {IManagerProxy} from "./IManagerProxy.sol";
import {VaultInfo} from "../structs/SGasStation.sol";

interface IGasStation is IManagerProxy {
    event AddVault(address indexed vault, bytes datas, string strat);

    event RemoveVault(address indexed vault, uint256 sendBack);

    event SetVaultData(address indexed vault, bytes data);

    event SetVaultStrat(address indexed vault, bytes32 strat);

    event WhitelistStrat(address indexed gasStation, string strat);

    event AddOperators(address indexed gasStation, address[] operators);

    event RemoveOperators(address indexed gasStation, address[] operators);

    event UpdateVaultBalance(address indexed vault, uint256 newBalance);

    event ExpandTermDuration(
        address indexed vault,
        uint256 oldMmTermDuration,
        uint256 newMmTermDuration
    );

    event WithdrawVaultBalance(
        address indexed vault,
        uint256 amount,
        address to,
        uint256 newBalance
    );

    event RebalanceVault(address indexed vault, uint256 newBalance);

    // ======== GELATOFIED FUNCTIONS ========
    function rebalance(
        address vault_,
        Range[] calldata ranges_,
        Rebalance calldata rebalanceParams_,
        Range[] calldata rangesToRemove_,
        uint256 feeAmount_
    ) external;

    // ======= PERMISSIONED OWNER FUNCTIONS =====
    function withdrawVaultBalance(
        address vault_,
        uint256 amount_,
        address payable to_
    ) external;

    function addVault(
        address vault_,
        bytes calldata datas_,
        string calldata strat_
    ) external payable;

    function removeVault(address vault_, address payable to_) external;

    function setVaultData(address vault_, bytes calldata data_) external;

    function setVaultStraByName(address vault_, string calldata strat_)
        external;

    function addOperators(address[] calldata operators_) external;

    function removeOperators(address[] calldata operators_) external;

    function pause() external;

    function unpause() external;

    // ======= PUBLIC FUNCTIONS =====

    function fundVaultBalance(address vault_) external payable;

    function expandMMTermDuration(address vault_) external;

    function getVaultInfo(address vault_)
        external
        view
        returns (VaultInfo memory);

    function managerFeeBPS() external view returns (uint16);
}
