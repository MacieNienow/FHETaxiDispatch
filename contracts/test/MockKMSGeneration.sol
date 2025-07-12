// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockKMSGeneration
 * @dev Mock contract for testing KMS Generation integration
 */
contract MockKMSGeneration {

    event KMSCalled(address indexed caller, bytes data);

    /**
     * @dev Fallback function to handle any call
     */
    fallback() external payable {
        emit KMSCalled(msg.sender, msg.data);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        emit KMSCalled(msg.sender, "");
    }

    /**
     * @dev Mock function that returns success
     */
    function generateKeys(bytes memory _data) external pure returns (bytes memory) {
        return _data;
    }
}
