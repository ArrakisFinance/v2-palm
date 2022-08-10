// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Rebalance, Range} from "./IArrakisV2.sol";
import {IManagerProxy} from "./IManagerProxy.sol";

interface IGasStation is IManagerProxy {
    event AddVault(
        address indexed vault,
        address[] operators,
        bytes datas,
        string strat
    );

    event RemoveVault(address indexed vault, uint256 sendBack);

    event SetVaultData(address indexed vault, bytes data);

    event SetVaultStrat(address indexed vault, bytes32 strat);

    event WhitelistStrat(address indexed gasStation, string strat);

    event AddOperatorsToVault(address indexed vault, address[] operators);

    event RemoveOperatorsToVault(address indexed vault, address[] operators);

    event UpdateVaultBalance(address indexed vault, uint256 newBalance);

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
        address[] calldata operators_,
        bytes calldata datas_,
        string calldata strat_
    ) external;

    function addAndFundVault(
        address vault_,
        address[] calldata operators_,
        bytes calldata datas_,
        string calldata strat_
    ) external payable;

    function removeVault(address vault_, address payable to_) external;

    function setVaultData(address vault_, bytes calldata data_) external;

    function setVaultStraByName(address vault_, string calldata strat_)
        external;

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

    function managerFeeBPS() external view returns (uint16);
}
