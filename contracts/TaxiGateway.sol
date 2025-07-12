// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PauserSet.sol";

/**
 * @title TaxiGateway
 * @dev Gateway contract for managing FHE operations with pause functionality
 * @notice Integrates with KMS Generation contract and PauserSet for decentralized pause control
 */
contract TaxiGateway {

    // Custom errors
    error InvalidPauserSetAddress();
    error InvalidKMSGenerationAddress();
    error InvalidDecryptionContract();
    error CallerNotOwner();
    error CallerNotAuthorizedPauser();
    error ContractIsPaused();
    error ContractIsNotPaused();
    error DecryptionContractNotSet();
    error EmptyCiphertext();
    error EmptyData();
    error KMSGenerationCallFailed();
    error DecryptionRequestFailed();

    // Contract references
    PauserSet public immutable pauserSet;
    address public immutable kmsGenerationContract;

    // System state
    bool public paused;
    address public owner;

    // Decryption contract reference
    address public decryptionContract;

    // Events
    event Paused(address indexed pauser);
    event Unpaused(address indexed owner);
    event DecryptionRequested(uint256 indexed requestId, address indexed requester);
    event DecryptionCompleted(uint256 indexed requestId, bytes result);
    event KMSGenerationCalled(address indexed caller, bytes data);

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert CallerNotOwner();
        _;
    }

    modifier onlyPauser() {
        if (!pauserSet.isPauser(msg.sender)) revert CallerNotAuthorizedPauser();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }

    modifier whenPaused() {
        if (!paused) revert ContractIsNotPaused();
        _;
    }

    /**
     * @dev Constructor
     * @param _pauserSetAddress Address of the deployed PauserSet contract
     * @param _kmsGenerationContract Address of the KMS Generation contract
     */
    constructor(address _pauserSetAddress, address _kmsGenerationContract) {
        if (_pauserSetAddress == address(0)) revert InvalidPauserSetAddress();
        if (_kmsGenerationContract == address(0)) revert InvalidKMSGenerationAddress();

        pauserSet = PauserSet(_pauserSetAddress);
        kmsGenerationContract = _kmsGenerationContract;
        owner = msg.sender;
        paused = false;
    }

    /**
     * @dev Set the decryption contract address
     * @param _decryptionContract Address of the decryption contract
     */
    function setDecryptionContract(address _decryptionContract) external onlyOwner {
        if (_decryptionContract == address(0)) revert InvalidDecryptionContract();
        decryptionContract = _decryptionContract;
    }

    /**
     * @dev Pause the gateway - can be called by any authorized pauser
     */
    function pause() external onlyPauser whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpause the gateway - only owner can unpause
     */
    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev Check if public decryption is allowed
     * @param _requester Address requesting decryption
     * @return bool True if decryption is allowed
     */
    function isPublicDecryptAllowed(address _requester) external view returns (bool) {
        if (paused) return false;
        if (_requester == address(0)) return false;
        if (decryptionContract == address(0)) return false;
        return true;
    }

    /**
     * @dev Check if the gateway is operational
     * @return bool True if the gateway is not paused
     */
    function isOperational() external view returns (bool) {
        return !paused;
    }

    /**
     * @dev Check if an address is authorized to pause
     * @param _address Address to check
     * @return bool True if the address can pause the contract
     */
    function isPauseAuthorized(address _address) external view returns (bool) {
        return pauserSet.isPauser(_address);
    }

    /**
     * @dev Request decryption through the gateway
     * @param _ciphertext Encrypted data to decrypt
     * @return requestId Unique identifier for the decryption request
     */
    function requestDecryption(bytes memory _ciphertext) external whenNotPaused returns (uint256 requestId) {
        if (decryptionContract == address(0)) revert DecryptionContractNotSet();
        if (_ciphertext.length == 0) revert EmptyCiphertext();

        // Generate unique request ID
        requestId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _ciphertext)));

        emit DecryptionRequested(requestId, msg.sender);

        // Forward to decryption contract
        (bool success, ) = decryptionContract.call(
            abi.encodeWithSignature("processDecryption(uint256,bytes,address)", requestId, _ciphertext, msg.sender)
        );

        if (!success) revert DecryptionRequestFailed();

        return requestId;
    }

    /**
     * @dev Call KMS Generation contract
     * @param _data Data to send to KMS Generation
     * @return result Result from KMS Generation contract
     */
    function callKMSGeneration(bytes memory _data) external whenNotPaused returns (bytes memory result) {
        if (_data.length == 0) revert EmptyData();

        emit KMSGenerationCalled(msg.sender, _data);

        (bool success, bytes memory returnData) = kmsGenerationContract.call(_data);
        if (!success) revert KMSGenerationCallFailed();

        return returnData;
    }

    /**
     * @dev Get the number of authorized pausers
     * @return uint256 Number of pausers
     */
    function getPauserCount() external view returns (uint256) {
        return pauserSet.getPauserCount();
    }

    /**
     * @dev Check if KMS Generation contract is configured
     * @return bool True if KMS Generation is set
     */
    function isKMSGenerationConfigured() external view returns (bool) {
        return kmsGenerationContract != address(0);
    }

    /**
     * @dev Get gateway status information
     * @return isPaused Current pause state
     * @return pauserCount Number of authorized pausers
     * @return kmsConfigured Whether KMS is configured
     * @return decryptionConfigured Whether decryption is configured
     */
    function getGatewayStatus() external view returns (
        bool isPaused,
        uint256 pauserCount,
        bool kmsConfigured,
        bool decryptionConfigured
    ) {
        return (
            paused,
            pauserSet.getPauserCount(),
            kmsGenerationContract != address(0),
            decryptionContract != address(0)
        );
    }
}
