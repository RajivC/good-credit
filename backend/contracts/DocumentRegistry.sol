// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DocumentRegistry {
    uint256 public nextId;
    mapping(uint256 => Metadata) public docs;

    struct Metadata {
        address owner;
        string  ipfsCID;
        uint256 timestamp;
    }

    event DocumentRegistered(
        uint256 indexed id,
        address indexed owner,
        string ipfsCID
    );

    /// @dev call this after uploading to IPFS
    function registerDocument(string calldata cid) external {
        uint256 id = nextId++;
        docs[id] = Metadata({
            owner: msg.sender,
            ipfsCID: cid,
            timestamp: block.timestamp
        });
        emit DocumentRegistered(id, msg.sender, cid);
    }
}