// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PauserSet
 * @dev Immutable contract that manages pauser addresses for the gateway and host contracts
 * @notice Once deployed, pauser addresses cannot be modified
 */
contract PauserSet {

    // Custom errors (gas efficient)
    error NoPausersProvided();
    error ZeroAddressNotAllowed();
    error DuplicatePauserAddress(address pauser);
    error IndexOutOfBounds(uint256 index, uint256 length);

    // Mapping to track authorized pausers
    mapping(address => bool) private pausers;

    // Array to store all pauser addresses for enumeration
    address[] private pauserList;

    // Events
    event PauserAdded(address indexed pauser);

    /**
     * @dev Constructor initializes the pauser set with provided addresses
     * @param _pausers Array of pauser addresses (KMS nodes + Coprocessors)
     */
    constructor(address[] memory _pausers) {
        if (_pausers.length == 0) revert NoPausersProvided();

        for (uint256 i = 0; i < _pausers.length; i++) {
            address pauser = _pausers[i];
            if (pauser == address(0)) revert ZeroAddressNotAllowed();
            if (pausers[pauser]) revert DuplicatePauserAddress(pauser);

            pausers[pauser] = true;
            pauserList.push(pauser);

            emit PauserAdded(pauser);
        }
    }

    /**
     * @dev Check if an address is authorized as a pauser
     * @param _address Address to check
     * @return bool True if the address is a pauser
     */
    function isPauser(address _address) external view returns (bool) {
        return pausers[_address];
    }

    /**
     * @dev Get the total number of pausers
     * @return uint256 Number of pauser addresses
     */
    function getPauserCount() external view returns (uint256) {
        return pauserList.length;
    }

    /**
     * @dev Get pauser address at specific index
     * @param _index Index in the pauser list
     * @return address Pauser address at the given index
     */
    function getPauserAtIndex(uint256 _index) external view returns (address) {
        if (_index >= pauserList.length) revert IndexOutOfBounds(_index, pauserList.length);
        return pauserList[_index];
    }

    /**
     * @dev Get all pauser addresses
     * @return address[] Array of all pauser addresses
     */
    function getAllPausers() external view returns (address[] memory) {
        return pauserList;
    }
}
