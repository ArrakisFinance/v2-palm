// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract VaultV2Mock {
    address public immutable owner;

    constructor(address owner_) {
        owner = owner_;
    }

    // solhint-disable-next-line no-unused-vars
    function mint(uint256 mintAmount_, address receiver_)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        return (1, 1);
    }

    // solhint-disable-next-line no-empty-blocks
    function toggleRestrictMint() external {}
}
