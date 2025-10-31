// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateTaxiDispatch is SepoliaConfig {

    address public dispatcher;
    uint32 public requestCounter;
    uint32 public driverCounter;

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
        euint32 maxFare;
        address assignedDriver;
        bool isCompleted;
        bool isCancelled;
        uint256 requestTime;
        uint256 completionTime;
    }

    struct RideOffer {
        uint32 requestId;
        address driver;
        euint32 proposedFare;
        euint32 estimatedTime;
        bool isAccepted;
        uint256 offerTime;
    }

    mapping(address => TaxiDriver) public drivers;
    mapping(uint32 => RideRequest) public requests;
    mapping(uint32 => RideOffer[]) public requestOffers;
    mapping(address => uint32[]) public passengerHistory;
    mapping(address => uint32[]) public driverHistory;

    event DriverRegistered(address indexed driver, uint256 timestamp);
    event LocationUpdated(address indexed driver);
    event RideRequested(uint32 indexed requestId, address indexed passenger);
    event OfferSubmitted(uint32 indexed requestId, address indexed driver);
    event RideMatched(uint32 indexed requestId, address indexed driver, address indexed passenger);
    event RideCompleted(uint32 indexed requestId, address indexed driver, address indexed passenger);
    event RideCancelled(uint32 indexed requestId, address indexed passenger);

    modifier onlyDispatcher() {
        require(msg.sender == dispatcher, "Not authorized");
        _;
    }

    modifier onlyRegisteredDriver() {
        require(drivers[msg.sender].isRegistered, "Driver not registered");
        _;
    }

    modifier validRequest(uint32 _requestId) {
        require(_requestId > 0 && _requestId <= requestCounter, "Invalid request");
        require(!requests[_requestId].isCompleted && !requests[_requestId].isCancelled, "Request not active");
        _;
    }

    constructor() {
        dispatcher = msg.sender;
        requestCounter = 0;
        driverCounter = 0;
    }

    // Register as a taxi driver
    function registerDriver() external {
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
    function updateLocation(uint32 _latitude, uint32 _longitude) external onlyRegisteredDriver {
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

    // Request a ride with encrypted pickup and destination
    function requestRide(
        uint32 _pickupLat,
        uint32 _pickupLng,
        uint32 _destLat,
        uint32 _destLng,
        uint32 _maxFare
    ) external {
        requestCounter++;

        euint32 pickupLatEnc = FHE.asEuint32(_pickupLat);
        euint32 pickupLngEnc = FHE.asEuint32(_pickupLng);
        euint32 destLatEnc = FHE.asEuint32(_destLat);
        euint32 destLngEnc = FHE.asEuint32(_destLng);
        euint32 maxFareEnc = FHE.asEuint32(_maxFare);

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
            completionTime: 0
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

        emit RideRequested(requestCounter, msg.sender);
    }

    // Driver submits an offer for a ride request
    function submitOffer(
        uint32 _requestId,
        uint32 _proposedFare,
        uint32 _estimatedTime
    ) external onlyRegisteredDriver validRequest(_requestId) {
        require(drivers[msg.sender].isAvailable, "Driver not available");
        require(requests[_requestId].assignedDriver == address(0), "Request already assigned");

        euint32 fareEnc = FHE.asEuint32(_proposedFare);
        euint32 timeEnc = FHE.asEuint32(_estimatedTime);

        requestOffers[_requestId].push(RideOffer({
            requestId: _requestId,
            driver: msg.sender,
            proposedFare: fareEnc,
            estimatedTime: timeEnc,
            isAccepted: false,
            offerTime: block.timestamp
        }));

        // Grant ACL permissions
        FHE.allowThis(fareEnc);
        FHE.allowThis(timeEnc);
        FHE.allow(fareEnc, requests[_requestId].passenger);
        FHE.allow(timeEnc, requests[_requestId].passenger);

        emit OfferSubmitted(_requestId, msg.sender);
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

    // Emergency function to pause system (dispatcher only)
    function emergencyPause() external onlyDispatcher {
        // Implementation for emergency pause
        // This could disable new requests and offers
    }
}