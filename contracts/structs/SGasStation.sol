// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

struct VaultInfo {
    uint256 balance; // prepaid credit for rebalance
    uint256 lastRebalance; // timestamp of the last rebalance
    address[] operators; // list of address that can rebalance that vault
    bytes datas; // custom bytes that can used to store data needed for rebalance.
    bytes32 strat; // strat type
    uint256 endOfMM; // expiry of the Market Making terms.
}
