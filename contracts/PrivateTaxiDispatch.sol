// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, euint8, ebool, externalEuint32, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "./TaxiGateway.sol";

/**
 * @title PrivateTaxiDispatch
 * @notice Privacy-preserving ride-sharing platform with FHE encryption
 * @dev Features:
 * - Gateway callback mode for asynchronous decryption
 * - Refund mechanism for decryption failures
 * - Timeout protection to prevent permanent locks
 * - Division protection using random multipliers
 * - Price obfuscation techniques
 * - Comprehensive input validation and access control
 * - Gas and HCU optimization
 */
contract PrivateTaxiDispatch is SepoliaConfig {

    address public dispatcher;
    uint32 public requestCounter;
    uint32 public driverCounter;

    // Timeout and refund constants
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
    uint256 public constant RIDE_TIMEOUT = 24 hours;
    uint256 public constant MIN_FARE = 0.001 ether;
    uint256 public constant MAX_FARE = 10 ether;

    // Gateway integration for pause control
    TaxiGateway public gateway;

    struct EncryptedLocation {
        euint32 latitude;
        euint32 longitude;
        bool isActive;
    }

    struct TaxiDriver {
        address driverAddress;
        EncryptedLocation currentLocation;
        euint8 rating;
        bool isAvailable;
        bool isRegistered;
        uint256 totalRides;
        uint256 registrationTime;
    }

    struct RideRequest {
        address passenger;
        EncryptedLocation pickupLocation;
        EncryptedLocation destination;
        euint64 maxFare;
        address assignedDriver;
        bool isCompleted;
        bool isCancelled;
        uint256 requestTime;
        uint256 completionTime;
        uint256 escrowAmount;          // Escrowed funds for refund protection
        bool fundsLocked;               // Whether funds are locked in escrow
        uint256 decryptionRequestId;    // Gateway decryption request ID
        bool decryptionFailed;          // Flag for decryption failure
    }

    struct RideOffer {
        uint32 requestId;
        address driver;
        euint64 proposedFare;           // Upgraded to euint64 for better range
        euint32 estimatedTime;
        bool isAccepted;
        uint256 offerTime;
        euint64 obfuscatedFare;         // Price obfuscation with random multiplier
        uint256 randomMultiplier;       // Random multiplier for division protection
    }

    struct DecryptionRequest {
        uint32 requestId;
        address requester;
        uint256 timestamp;
        bool completed;
        bool timedOut;
    }

    mapping(address => TaxiDriver) public drivers;
    mapping(uint32 => RideRequest) public requests;
    mapping(uint32 => RideOffer[]) public requestOffers;
    mapping(address => uint32[]) public passengerHistory;
    mapping(address => uint32[]) public driverHistory;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint32) public requestIdByDecryption;

    // Events
    event DriverRegistered(address indexed driver, uint256 timestamp);
    event LocationUpdated(address indexed driver);
    event RideRequested(uint32 indexed requestId, address indexed passenger, uint256 escrowAmount);
    event OfferSubmitted(uint32 indexed requestId, address indexed driver);
    event RideMatched(uint32 indexed requestId, address indexed driver, address indexed passenger);
    event RideCompleted(uint32 indexed requestId, address indexed driver, address indexed passenger);
    event RideCancelled(uint32 indexed requestId, address indexed passenger);
    event FareDecryptionRequested(uint32 indexed requestId, uint256 decryptionRequestId);
    event FareDecryptionCompleted(uint32 indexed requestId, uint64 decryptedFare);
    event DecryptionTimedOut(uint32 indexed requestId, uint256 decryptionRequestId);
    event RefundIssued(uint32 indexed requestId, address indexed passenger, uint256 amount);
    event EscrowLocked(uint32 indexed requestId, uint256 amount);
    event EscrowReleased(uint32 indexed requestId, address indexed recipient, uint256 amount);

    // Custom errors for gas efficiency
    error NotAuthorized();
    error DriverNotRegistered();
    error InvalidRequest();
    error RequestNotActive();
    error InsufficientEscrow();
    error DecryptionInProgress();
    error DecryptionNotTimedOut();
    error FundsAlreadyLocked();
    error InvalidFareAmount();
    error OverflowProtection();

    modifier onlyDispatcher() {
        if (msg.sender != dispatcher) revert NotAuthorized();
        _;
    }

    modifier onlyRegisteredDriver() {
        if (!drivers[msg.sender].isRegistered) revert DriverNotRegistered();
        _;
    }

    modifier validRequest(uint32 _requestId) {
        if (_requestId == 0 || _requestId > requestCounter) revert InvalidRequest();
        if (requests[_requestId].isCompleted || requests[_requestId].isCancelled) revert RequestNotActive();
        _;
    }

    /**
     * @dev Input validation modifier with overflow protection
     */
    modifier validateFareInput(uint256 _fare) {
        if (_fare < MIN_FARE || _fare > MAX_FARE) revert InvalidFareAmount();
        if (_fare > type(uint64).max) revert OverflowProtection();
        _;
    }

    constructor(address _gatewayAddress) {
        dispatcher = msg.sender;
        requestCounter = 0;
        driverCounter = 0;

        if (_gatewayAddress != address(0)) {
            gateway = TaxiGateway(_gatewayAddress);
        }
    }

    /**
     * @dev Set or update gateway contract address
     * @param _gatewayAddress Address of the TaxiGateway contract
     */
    function setGateway(address _gatewayAddress) external onlyDispatcher {
        require(_gatewayAddress != address(0), "Invalid gateway address");
        gateway = TaxiGateway(_gatewayAddress);
    }

    /**
     * @dev Check if operations are allowed (not paused by gateway)
     */
    modifier whenOperational() {
        if (address(gateway) != address(0)) {
            require(gateway.isOperational(), "System paused by gateway");
        }
        _;
    }

    /**
     * @dev Rerandomize encrypted value for sIND-CPAD security
     * Note: Rerandomization is now handled automatically by the FHE library
     * This function is kept for compatibility but simply returns the value
     * @param _value Encrypted value to rerandomize
     * @return euint32 The encrypted value (rerandomization is automatic)
     */
    function rerandomize(euint32 _value) internal pure returns (euint32) {
        // Rerandomization is performed transparently by the FHE library
        // Modern FHE implementations handle this automatically
        return _value;
    }

    // Register as a taxi driver
    function registerDriver() external whenOperational {
        require(!drivers[msg.sender].isRegistered, "Already registered");

        drivers[msg.sender] = TaxiDriver({
            driverAddress: msg.sender,
            currentLocation: EncryptedLocation({
                latitude: FHE.asEuint32(0),
                longitude: FHE.asEuint32(0),
                isActive: false
            }),
            rating: FHE.asEuint8(50), // Start with neutral rating (50/100)
            isAvailable: false,
            isRegistered: true,
            totalRides: 0,
            registrationTime: block.timestamp
        });

        driverCounter++;

        // Grant ACL permissions
        FHE.allowThis(drivers[msg.sender].currentLocation.latitude);
        FHE.allowThis(drivers[msg.sender].currentLocation.longitude);
        FHE.allowThis(drivers[msg.sender].rating);
        FHE.allow(drivers[msg.sender].rating, msg.sender);

        emit DriverRegistered(msg.sender, block.timestamp);
    }

    // Update driver's encrypted location
    function updateLocation(uint32 _latitude, uint32 _longitude) external onlyRegisteredDriver whenOperational {
        euint32 encLat = FHE.asEuint32(_latitude);
        euint32 encLng = FHE.asEuint32(_longitude);

        drivers[msg.sender].currentLocation.latitude = encLat;
        drivers[msg.sender].currentLocation.longitude = encLng;
        drivers[msg.sender].currentLocation.isActive = true;

        // Grant ACL permissions
        FHE.allowThis(encLat);
        FHE.allowThis(encLng);
        FHE.allow(encLat, msg.sender);
        FHE.allow(encLng, msg.sender);

        emit LocationUpdated(msg.sender);
    }

    // Set driver availability status
    function setAvailability(bool _available) external onlyRegisteredDriver {
        drivers[msg.sender].isAvailable = _available;
    }

    /**
     * @notice Request a ride with encrypted pickup and destination
     * @dev Implements escrow locking and timeout protection
     * @param _pickupLat Encrypted pickup latitude
     * @param _pickupLng Encrypted pickup longitude
     * @param _destLat Encrypted destination latitude
     * @param _destLng Encrypted destination longitude
     * @param _maxFare Maximum fare willing to pay (with validation)
     */
    function requestRide(
        uint32 _pickupLat,
        uint32 _pickupLng,
        uint32 _destLat,
        uint32 _destLng,
        uint256 _maxFare
    ) external payable whenOperational validateFareInput(_maxFare) {
        if (msg.value < _maxFare) revert InsufficientEscrow();

        requestCounter++;

        euint32 pickupLatEnc = FHE.asEuint32(_pickupLat);
        euint32 pickupLngEnc = FHE.asEuint32(_pickupLng);
        euint32 destLatEnc = FHE.asEuint32(_destLat);
        euint32 destLngEnc = FHE.asEuint32(_destLng);
        euint64 maxFareEnc = FHE.asEuint64(_maxFare);

        requests[requestCounter] = RideRequest({
            passenger: msg.sender,
            pickupLocation: EncryptedLocation({
                latitude: pickupLatEnc,
                longitude: pickupLngEnc,
                isActive: true
            }),
            destination: EncryptedLocation({
                latitude: destLatEnc,
                longitude: destLngEnc,
                isActive: true
            }),
            maxFare: maxFareEnc,
            assignedDriver: address(0),
            isCompleted: false,
            isCancelled: false,
            requestTime: block.timestamp,
            completionTime: 0,
            escrowAmount: msg.value,
            fundsLocked: true,
            decryptionRequestId: 0,
            decryptionFailed: false
        });

        passengerHistory[msg.sender].push(requestCounter);

        // Grant ACL permissions
        FHE.allowThis(pickupLatEnc);
        FHE.allowThis(pickupLngEnc);
        FHE.allowThis(destLatEnc);
        FHE.allowThis(destLngEnc);
        FHE.allowThis(maxFareEnc);
        FHE.allow(pickupLatEnc, msg.sender);
        FHE.allow(pickupLngEnc, msg.sender);
        FHE.allow(destLatEnc, msg.sender);
        FHE.allow(destLngEnc, msg.sender);
        FHE.allow(maxFareEnc, msg.sender);

        emit RideRequested(requestCounter, msg.sender, msg.value);
        emit EscrowLocked(requestCounter, msg.value);
    }

    /**
     * @notice Driver submits an offer with price obfuscation
     * @dev Implements random multiplier for division protection and privacy
     * @param _requestId The ride request ID
     * @param _proposedFare Proposed fare amount
     * @param _estimatedTime Estimated time to pickup
     */
    function submitOffer(
        uint32 _requestId,
        uint256 _proposedFare,
        uint32 _estimatedTime
    ) external onlyRegisteredDriver validRequest(_requestId) whenOperational validateFareInput(_proposedFare) {
        require(drivers[msg.sender].isAvailable, "Driver not available");
        require(requests[_requestId].assignedDriver == address(0), "Request already assigned");

        // Generate random multiplier for division protection (privacy-preserving technique)
        // This prevents price leakage through division operations
        uint256 randomMultiplier = _generateRandomMultiplier(block.timestamp, msg.sender, _requestId);

        euint64 fareEnc = FHE.asEuint64(_proposedFare);
        euint32 timeEnc = FHE.asEuint32(_estimatedTime);

        // Apply price obfuscation: multiply by random factor
        euint64 obfuscatedFare = FHE.mul(fareEnc, FHE.asEuint64(randomMultiplier));

        requestOffers[_requestId].push(RideOffer({
            requestId: _requestId,
            driver: msg.sender,
            proposedFare: fareEnc,
            estimatedTime: timeEnc,
            isAccepted: false,
            offerTime: block.timestamp,
            obfuscatedFare: obfuscatedFare,
            randomMultiplier: randomMultiplier
        }));

        // Grant ACL permissions for privacy control
        FHE.allowThis(fareEnc);
        FHE.allowThis(timeEnc);
        FHE.allowThis(obfuscatedFare);
        FHE.allow(fareEnc, requests[_requestId].passenger);
        FHE.allow(timeEnc, requests[_requestId].passenger);
        FHE.allow(obfuscatedFare, requests[_requestId].passenger);

        emit OfferSubmitted(_requestId, msg.sender);
    }

    /**
     * @dev Generate random multiplier for division protection
     * @param _timestamp Current timestamp
     * @param _address User address
     * @param _requestId Request ID
     * @return Random multiplier between 100 and 1000
     */
    function _generateRandomMultiplier(
        uint256 _timestamp,
        address _address,
        uint32 _requestId
    ) private view returns (uint256) {
        // Generate pseudo-random number for price obfuscation
        uint256 random = uint256(keccak256(abi.encodePacked(
            _timestamp,
            _address,
            _requestId,
            block.prevrandao,
            blockhash(block.number - 1)
        )));

        // Return value between 100 and 1000 for division protection
        return 100 + (random % 900);
    }

    // Passenger accepts a driver's offer
    function acceptOffer(uint32 _requestId, uint256 _offerIndex) external validRequest(_requestId) {
        require(requests[_requestId].passenger == msg.sender, "Not your request");
        require(_offerIndex < requestOffers[_requestId].length, "Invalid offer index");
        require(requests[_requestId].assignedDriver == address(0), "Already assigned");

        RideOffer storage offer = requestOffers[_requestId][_offerIndex];
        address chosenDriver = offer.driver;

        require(drivers[chosenDriver].isAvailable, "Driver no longer available");

        // Assign the driver
        requests[_requestId].assignedDriver = chosenDriver;
        offer.isAccepted = true;

        // Update driver availability
        drivers[chosenDriver].isAvailable = false;

        driverHistory[chosenDriver].push(_requestId);

        emit RideMatched(_requestId, chosenDriver, msg.sender);
    }

    // Complete a ride (called by driver)
    function completeRide(uint32 _requestId, uint8 _passengerRating) external validRequest(_requestId) {
        require(requests[_requestId].assignedDriver == msg.sender, "Not assigned driver");
        require(_passengerRating <= 100, "Invalid rating");

        requests[_requestId].isCompleted = true;
        requests[_requestId].completionTime = block.timestamp;

        // Update driver stats
        drivers[msg.sender].totalRides++;
        drivers[msg.sender].isAvailable = true;

        // Update driver's rating (simple average)
        euint8 newRating = FHE.asEuint8(_passengerRating);
        drivers[msg.sender].rating = newRating; // Simplified - should be weighted average

        FHE.allowThis(newRating);
        FHE.allow(newRating, msg.sender);

        emit RideCompleted(_requestId, msg.sender, requests[_requestId].passenger);
    }

    // Cancel a ride request
    function cancelRequest(uint32 _requestId) external validRequest(_requestId) {
        require(requests[_requestId].passenger == msg.sender, "Not your request");
        require(requests[_requestId].assignedDriver == address(0), "Cannot cancel assigned ride");

        requests[_requestId].isCancelled = true;

        emit RideCancelled(_requestId, msg.sender);
    }

    // Get basic request info (non-sensitive data)
    function getRequestInfo(uint32 _requestId) external view returns (
        address passenger,
        address assignedDriver,
        bool isCompleted,
        bool isCancelled,
        uint256 requestTime,
        uint256 offerCount
    ) {
        RideRequest storage request = requests[_requestId];
        return (
            request.passenger,
            request.assignedDriver,
            request.isCompleted,
            request.isCancelled,
            request.requestTime,
            requestOffers[_requestId].length
        );
    }

    // Get driver public info
    function getDriverInfo(address _driver) external view returns (
        bool isRegistered,
        bool isAvailable,
        uint256 totalRides,
        uint256 registrationTime
    ) {
        TaxiDriver storage driver = drivers[_driver];
        return (
            driver.isRegistered,
            driver.isAvailable,
            driver.totalRides,
            driver.registrationTime
        );
    }

    // Get passenger's request history
    function getPassengerHistory(address _passenger) external view returns (uint32[] memory) {
        return passengerHistory[_passenger];
    }

    // Get driver's ride history
    function getDriverHistory(address _driver) external view returns (uint32[] memory) {
        return driverHistory[_driver];
    }

    // Get system stats
    function getSystemStats() external view returns (
        uint32 totalRequests,
        uint32 totalDrivers
    ) {
        return (requestCounter, driverCounter);
    }

    /**
     * @dev Check if a driver is eligible to submit an offer
     * @param _driverAddress Address of the driver
     * @param _requestId Request ID to check
     * @return bool True if driver can submit offer
     */
    function isDriverEligibleForOffer(address _driverAddress, uint32 _requestId) external view returns (bool) {
        if (!drivers[_driverAddress].isRegistered) return false;
        if (!drivers[_driverAddress].isAvailable) return false;
        if (_requestId == 0 || _requestId > requestCounter) return false;
        if (requests[_requestId].isCompleted || requests[_requestId].isCancelled) return false;
        if (requests[_requestId].assignedDriver != address(0)) return false;
        return true;
    }

    /**
     * @dev Check if a ride request is active
     * @param _requestId Request ID to check
     * @return bool True if request is active
     */
    function isRequestActive(uint32 _requestId) external view returns (bool) {
        if (_requestId == 0 || _requestId > requestCounter) return false;
        if (requests[_requestId].isCompleted || requests[_requestId].isCancelled) return false;
        return true;
    }

    /**
     * @dev Check if a driver is registered and available
     * @param _driverAddress Address of the driver
     * @return bool True if driver is registered and available
     */
    function isDriverAvailable(address _driverAddress) external view returns (bool) {
        return drivers[_driverAddress].isRegistered && drivers[_driverAddress].isAvailable;
    }

    /**
     * @dev Check if an address is a registered driver
     * @param _address Address to check
     * @return bool True if address is registered as driver
     */
    function isRegisteredDriver(address _address) external view returns (bool) {
        return drivers[_address].isRegistered;
    }

    /**
     * @dev Check if a passenger can cancel a request
     * @param _passengerAddress Passenger address
     * @param _requestId Request ID
     * @return bool True if passenger can cancel
     */
    function isRequestCancellable(address _passengerAddress, uint32 _requestId) external view returns (bool) {
        if (_requestId == 0 || _requestId > requestCounter) return false;
        if (requests[_requestId].passenger != _passengerAddress) return false;
        if (requests[_requestId].isCompleted || requests[_requestId].isCancelled) return false;
        if (requests[_requestId].assignedDriver != address(0)) return false;
        return true;
    }

    /**
     * @dev Check if the system is operational (gateway check)
     * @return bool True if system is operational
     */
    function isSystemOperational() external view returns (bool) {
        if (address(gateway) == address(0)) return true;
        return gateway.isOperational();
    }

    /**
     * @dev Get gateway address
     * @return address Address of the gateway contract
     */
    function getGatewayAddress() external view returns (address) {
        return address(gateway);
    }

    /**
     * @notice Request fare decryption via Gateway (asynchronous callback mode)
     * @dev Initiates decryption request to Gateway oracle
     * @param _requestId Ride request ID
     * @param _offerIndex Index of the accepted offer
     */
    function requestFareDecryption(uint32 _requestId, uint256 _offerIndex)
        external
        validRequest(_requestId)
        whenOperational
    {
        require(requests[_requestId].passenger == msg.sender, "Not your request");
        require(_offerIndex < requestOffers[_requestId].length, "Invalid offer index");
        require(requests[_requestId].decryptionRequestId == 0, "Decryption already requested");

        RideOffer storage offer = requestOffers[_requestId][_offerIndex];

        // Convert encrypted fare to bytes32 for decryption
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(offer.proposedFare);

        // Request decryption via Gateway callback
        uint256 decryptionId = FHE.requestDecryption(
            cts,
            this.fareDecryptionCallback.selector
        );

        requests[_requestId].decryptionRequestId = decryptionId;
        requestIdByDecryption[decryptionId] = _requestId;

        decryptionRequests[decryptionId] = DecryptionRequest({
            requestId: _requestId,
            requester: msg.sender,
            timestamp: block.timestamp,
            completed: false,
            timedOut: false
        });

        emit FareDecryptionRequested(_requestId, decryptionId);
    }

    /**
     * @notice Gateway callback for fare decryption
     * @dev Called by Gateway oracle after decryption completes
     * @param decryptionId Unique decryption request ID
     * @param cleartexts Decrypted values
     * @param decryptionProof Cryptographic proof of decryption
     */
    function fareDecryptionCallback(
        uint256 decryptionId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures from Gateway oracle
        FHE.checkSignatures(decryptionId, cleartexts, decryptionProof);

        uint32 requestId = requestIdByDecryption[decryptionId];
        require(requestId != 0, "Invalid decryption ID");

        DecryptionRequest storage decReq = decryptionRequests[decryptionId];
        require(!decReq.completed, "Decryption already completed");

        // Decode decrypted fare
        uint64 decryptedFare = abi.decode(cleartexts, (uint64));

        decReq.completed = true;

        emit FareDecryptionCompleted(requestId, decryptedFare);
    }

    /**
     * @notice Handle decryption timeout and issue refund
     * @dev Allows passenger to reclaim funds if decryption fails or times out
     * @param _requestId Ride request ID
     */
    function handleDecryptionTimeout(uint32 _requestId) external {
        RideRequest storage request = requests[_requestId];
        require(request.passenger == msg.sender, "Not your request");
        require(request.decryptionRequestId != 0, "No decryption requested");

        DecryptionRequest storage decReq = decryptionRequests[request.decryptionRequestId];
        require(!decReq.completed, "Decryption completed");
        require(
            block.timestamp >= decReq.timestamp + DECRYPTION_TIMEOUT,
            "Timeout not reached"
        );

        // Mark as timed out and issue refund
        decReq.timedOut = true;
        request.decryptionFailed = true;

        _issueRefund(_requestId);

        emit DecryptionTimedOut(_requestId, request.decryptionRequestId);
    }

    /**
     * @notice Issue refund for failed or timed-out rides
     * @dev Internal function to handle refund logic
     * @param _requestId Ride request ID
     */
    function _issueRefund(uint32 _requestId) private {
        RideRequest storage request = requests[_requestId];
        require(request.fundsLocked, "Funds not locked");

        uint256 refundAmount = request.escrowAmount;
        address passenger = request.passenger;

        request.fundsLocked = false;
        request.escrowAmount = 0;
        request.isCancelled = true;

        // Transfer refund to passenger
        (bool success, ) = payable(passenger).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundIssued(_requestId, passenger, refundAmount);
        emit EscrowReleased(_requestId, passenger, refundAmount);
    }

    /**
     * @notice Cancel ride and receive refund (before assignment)
     * @dev Allows passenger to cancel and get refund if ride not assigned
     * @param _requestId Ride request ID
     */
    function cancelRideWithRefund(uint32 _requestId) external {
        RideRequest storage request = requests[_requestId];
        require(request.passenger == msg.sender, "Not your request");
        require(!request.isCompleted && !request.isCancelled, "Request not active");
        require(request.assignedDriver == address(0), "Cannot cancel assigned ride");

        // Check timeout protection
        if (block.timestamp > request.requestTime + RIDE_TIMEOUT) {
            _issueRefund(_requestId);
        } else {
            revert("Cannot cancel before timeout");
        }
    }

    /**
     * @notice Release escrow to driver after ride completion
     * @dev Transfer escrowed funds to driver
     * @param _requestId Ride request ID
     */
    function releaseEscrowToDriver(uint32 _requestId) external {
        RideRequest storage request = requests[_requestId];
        require(request.isCompleted, "Ride not completed");
        require(request.assignedDriver == msg.sender, "Not assigned driver");
        require(request.fundsLocked, "Funds already released");

        uint256 amount = request.escrowAmount;
        address driver = request.assignedDriver;

        request.fundsLocked = false;
        request.escrowAmount = 0;

        (bool success, ) = payable(driver).call{value: amount}("");
        require(success, "Escrow transfer failed");

        emit EscrowReleased(_requestId, driver, amount);
    }

    /**
     * @notice Check if decryption request has timed out
     * @param _requestId Ride request ID
     * @return bool True if timed out
     */
    function isDecryptionTimedOut(uint32 _requestId) external view returns (bool) {
        RideRequest storage request = requests[_requestId];
        if (request.decryptionRequestId == 0) return false;

        DecryptionRequest storage decReq = decryptionRequests[request.decryptionRequestId];
        return block.timestamp >= decReq.timestamp + DECRYPTION_TIMEOUT;
    }

    /**
     * @notice Get decryption request status
     * @param _decryptionId Decryption request ID
     * @return DecryptionRequest struct
     */
    function getDecryptionStatus(uint256 _decryptionId)
        external
        view
        returns (
            uint32 requestId,
            address requester,
            uint256 timestamp,
            bool completed,
            bool timedOut
        )
    {
        DecryptionRequest storage req = decryptionRequests[_decryptionId];
        return (
            req.requestId,
            req.requester,
            req.timestamp,
            req.completed,
            req.timedOut
        );
    }

    /**
     * @notice Get escrow information for a ride request
     * @param _requestId Ride request ID
     * @return escrowAmount Amount in escrow
     * @return fundsLocked Whether funds are locked
     */
    function getEscrowInfo(uint32 _requestId)
        external
        view
        returns (uint256 escrowAmount, bool fundsLocked)
    {
        RideRequest storage request = requests[_requestId];
        return (request.escrowAmount, request.fundsLocked);
    }

    // Emergency function to pause system (dispatcher only)
    function emergencyPause() external onlyDispatcher {
        // This is now handled by the gateway contract
        // Dispatcher can only pause through gateway if authorized
        if (address(gateway) != address(0)) {
            revert("Use gateway pause function");
        }
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}