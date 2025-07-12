// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockDecryption
 * @dev Mock contract for testing decryption integration
 */
contract MockDecryption {

    event DecryptionProcessed(uint256 indexed requestId, bytes ciphertext, address indexed requester);

    mapping(uint256 => bool) public processedRequests;

    /**
     * @dev Process decryption request
     */
    function processDecryption(
        uint256 _requestId,
        bytes memory _ciphertext,
        address _requester
    ) external returns (bool) {
        require(!processedRequests[_requestId], "MockDecryption: request already processed");

        processedRequests[_requestId] = true;
        emit DecryptionProcessed(_requestId, _ciphertext, _requester);

        return true;
    }

    /**
     * @dev Check if request was processed
     */
    function isRequestProcessed(uint256 _requestId) external view returns (bool) {
        return processedRequests[_requestId];
    }
}
