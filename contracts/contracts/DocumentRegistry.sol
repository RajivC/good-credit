// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DocumentRegistry {
    mapping(address => string[]) private userCIDs;
    event DocumentRegistered(address indexed user, string cid, uint256 timestamp);

    function registerUsername(string calldata cid) external {
        userCIDs[msg.sender].push(cid);
        emit DocumentRegistered(msg.sender, cid, block.timestamp);
    }

    function getUsername() external view returns (string[] memory) {
        return userCIDs[msg.sender];
    }
}