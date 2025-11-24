# API Documentation - Privacy-Preserving Ride-Sharing Platform

## Table of Contents
1. [Contract Overview](#contract-overview)
2. [Core Functions](#core-functions)
3. [Gateway Integration](#gateway-integration)
4. [Refund & Timeout Functions](#refund--timeout-functions)
5. [Query Functions](#query-functions)
6. [Events](#events)
7. [Errors](#errors)
8. [Usage Examples](#usage-examples)

---

## Contract Overview

**Contract Name:** `PrivateTaxiDispatch`
**Solidity Version:** `^0.8.24`
**Network:** Ethereum Sepolia Testnet
**FHE Library:** `@fhevm/solidity`

### Key Features
- Encrypted location storage (euint32)
- Encrypted fare handling (euint64)
- Gateway callback integration
- Automatic refund mechanism
- Timeout protection
- Division protection with random multipliers
- Price obfuscation

---

## Core Functions

### 1. Driver Management

#### `registerDriver()`
Register as a taxi driver in the system.

**Signature:**
```solidity
function registerDriver() external whenOperational
```

**Requirements:**
- Caller must not already be registered
- System must not be paused

**Effects:**
- Creates driver profile
- Initializes encrypted location (0, 0)
- Sets initial rating to 50/100
- Grants ACL permissions
- Increments driver counter

**Events Emitted:**
- `DriverRegistered(address indexed driver, uint256 timestamp)`

**Example:**
```javascript
// Frontend (using ethers.js)
const tx = await contract.registerDriver();
await tx.wait();
console.log("Driver registered successfully");
```

---

#### `updateLocation(uint32 _latitude, uint32 _longitude)`
Update driver's encrypted location.

**Signature:**
```solidity
function updateLocation(uint32 _latitude, uint32 _longitude)
    external
    onlyRegisteredDriver
    whenOperational
```

**Parameters:**
- `_latitude`: Scaled latitude coordinate (e.g., 40.7128 → 407128)
- `_longitude`: Scaled longitude coordinate (e.g., -74.0060 → -740060)

**Requirements:**
- Caller must be registered driver
- System must not be paused

**Effects:**
- Updates encrypted location
- Grants ACL permissions to driver

**Events Emitted:**
- `LocationUpdated(address indexed driver)`

**Example:**
```javascript
// Frontend
const lat = 40.7128;  // New York City
const lng = -74.0060;
const scaledLat = Math.floor(lat * 10000);
const scaledLng = Math.floor(lng * 10000);

const tx = await contract.updateLocation(scaledLat, scaledLng);
await tx.wait();
```

---

#### `setAvailability(bool _available)`
Set driver availability status.

**Signature:**
```solidity
function setAvailability(bool _available) external onlyRegisteredDriver
```

**Parameters:**
- `_available`: `true` to mark as available, `false` for unavailable

**Requirements:**
- Caller must be registered driver

**Example:**
```javascript
const tx = await contract.setAvailability(true);
await tx.wait();
console.log("Driver is now available");
```

---

### 2. Ride Request Management

#### `requestRide(...)`
Request a ride with encrypted pickup and destination.

**Signature:**
```solidity
function requestRide(
    uint32 _pickupLat,
    uint32 _pickupLng,
    uint32 _destLat,
    uint32 _destLng,
    uint256 _maxFare
) external payable whenOperational validateFareInput(_maxFare)
```

**Parameters:**
- `_pickupLat`: Encrypted pickup latitude
- `_pickupLng`: Encrypted pickup longitude
- `_destLat`: Encrypted destination latitude
- `_destLng`: Encrypted destination longitude
- `_maxFare`: Maximum fare willing to pay (in wei)

**Requirements:**
- `msg.value >= _maxFare` (escrow deposit)
- `_maxFare >= MIN_FARE` (0.001 ETH)
- `_maxFare <= MAX_FARE` (10 ETH)
- System must not be paused

**Effects:**
- Creates ride request
- Locks escrowed funds
- Grants ACL permissions
- Increments request counter

**Events Emitted:**
- `RideRequested(uint32 indexed requestId, address indexed passenger, uint256 escrowAmount)`
- `EscrowLocked(uint32 indexed requestId, uint256 amount)`

**Example:**
```javascript
const pickupLat = 407128;
const pickupLng = -740060;
const destLat = 408000;
const destLng = -739000;
const maxFare = ethers.utils.parseEther("0.05");

const tx = await contract.requestRide(
    pickupLat,
    pickupLng,
    destLat,
    destLng,
    maxFare,
    { value: maxFare }
);
await tx.wait();
```

---

#### `submitOffer(...)`
Driver submits an offer for a ride request.

**Signature:**
```solidity
function submitOffer(
    uint32 _requestId,
    uint256 _proposedFare,
    uint32 _estimatedTime
) external
    onlyRegisteredDriver
    validRequest(_requestId)
    whenOperational
    validateFareInput(_proposedFare)
```

**Parameters:**
- `_requestId`: Ride request ID
- `_proposedFare`: Proposed fare amount (in wei)
- `_estimatedTime`: Estimated time to pickup (in seconds)

**Requirements:**
- Caller must be registered and available driver
- Request must be active (not completed/cancelled)
- Request must not have assigned driver
- Fare must be within valid range

**Effects:**
- Creates encrypted offer
- Applies price obfuscation (random multiplier)
- Grants ACL permissions to passenger

**Events Emitted:**
- `OfferSubmitted(uint32 indexed requestId, address indexed driver)`

**Price Obfuscation:**
- Random multiplier between 100-1000 applied
- Prevents price leakage through division
- Original fare stored for settlement

**Example:**
```javascript
const requestId = 1;
const proposedFare = ethers.utils.parseEther("0.045");
const estimatedTime = 300; // 5 minutes

const tx = await contract.submitOffer(
    requestId,
    proposedFare,
    estimatedTime
);
await tx.wait();
```

---

#### `acceptOffer(uint32 _requestId, uint256 _offerIndex)`
Passenger accepts a driver's offer.

**Signature:**
```solidity
function acceptOffer(uint32 _requestId, uint256 _offerIndex)
    external
    validRequest(_requestId)
```

**Parameters:**
- `_requestId`: Ride request ID
- `_offerIndex`: Index of the offer in the offers array

**Requirements:**
- Caller must be request owner (passenger)
- Offer index must be valid
- Request must not have assigned driver
- Driver must still be available

**Effects:**
- Assigns driver to request
- Marks offer as accepted
- Sets driver as unavailable
- Updates driver history

**Events Emitted:**
- `RideMatched(uint32 indexed requestId, address indexed driver, address indexed passenger)`

**Example:**
```javascript
const requestId = 1;
const offerIndex = 0; // First offer

const tx = await contract.acceptOffer(requestId, offerIndex);
await tx.wait();
```

---

#### `completeRide(uint32 _requestId, uint8 _passengerRating)`
Complete a ride and rate passenger.

**Signature:**
```solidity
function completeRide(uint32 _requestId, uint8 _passengerRating)
    external
    validRequest(_requestId)
```

**Parameters:**
- `_requestId`: Ride request ID
- `_passengerRating`: Rating for passenger (0-100)

**Requirements:**
- Caller must be assigned driver
- Rating must be <= 100

**Effects:**
- Marks ride as completed
- Updates driver statistics
- Sets driver as available
- Updates encrypted rating

**Events Emitted:**
- `RideCompleted(uint32 indexed requestId, address indexed driver, address indexed passenger)`

**Example:**
```javascript
const requestId = 1;
const rating = 95; // 95/100

const tx = await contract.completeRide(requestId, rating);
await tx.wait();
```

---

## Gateway Integration

### `requestFareDecryption(uint32 _requestId, uint256 _offerIndex)`
Request fare decryption via Gateway oracle (asynchronous).

**Signature:**
```solidity
function requestFareDecryption(uint32 _requestId, uint256 _offerIndex)
    external
    validRequest(_requestId)
    whenOperational
```

**Parameters:**
- `_requestId`: Ride request ID
- `_offerIndex`: Index of the offer to decrypt

**Requirements:**
- Caller must be request owner
- Offer index must be valid
- No previous decryption request for this ride

**Effects:**
- Converts encrypted fare to bytes32
- Submits decryption request to Gateway
- Stores decryption metadata

**Events Emitted:**
- `FareDecryptionRequested(uint32 indexed requestId, uint256 decryptionRequestId)`

**Workflow:**
```
User calls requestFareDecryption()
    ↓
Contract submits to Gateway via FHE.requestDecryption()
    ↓
Gateway oracle processes decryption
    ↓
Gateway calls fareDecryptionCallback()
    ↓
Decrypted value stored and event emitted
```

**Example:**
```javascript
const requestId = 1;
const offerIndex = 0;

const tx = await contract.requestFareDecryption(requestId, offerIndex);
const receipt = await tx.wait();

// Listen for decryption completion
contract.on("FareDecryptionCompleted", (reqId, decryptedFare) => {
    console.log(`Fare decrypted: ${ethers.utils.formatEther(decryptedFare)} ETH`);
});
```

---

### `fareDecryptionCallback(...)`
Gateway callback function (called by oracle only).

**Signature:**
```solidity
function fareDecryptionCallback(
    uint256 decryptionId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `decryptionId`: Unique decryption request ID
- `cleartexts`: Decrypted values (ABI encoded)
- `decryptionProof`: Cryptographic proof

**Requirements:**
- Called by Gateway oracle only
- Signatures must be valid (verified by FHE.checkSignatures())

**Effects:**
- Verifies cryptographic proof
- Decodes and stores decrypted fare
- Marks decryption as completed

**Events Emitted:**
- `FareDecryptionCompleted(uint32 indexed requestId, uint64 decryptedFare)`

**Security:**
- Only Gateway can call (enforced by FHE.checkSignatures())
- Replay protection via request ID
- Cryptographic proof verification

---

## Refund & Timeout Functions

### `handleDecryptionTimeout(uint32 _requestId)`
Handle decryption timeout and issue automatic refund.

**Signature:**
```solidity
function handleDecryptionTimeout(uint32 _requestId) external
```

**Parameters:**
- `_requestId`: Ride request ID

**Requirements:**
- Caller must be request owner (passenger)
- Decryption must be in progress
- Timeout period must have elapsed (1 hour)

**Effects:**
- Marks decryption as timed out
- Issues full refund to passenger
- Cancels ride request

**Events Emitted:**
- `DecryptionTimedOut(uint32 indexed requestId, uint256 decryptionRequestId)`
- `RefundIssued(uint32 indexed requestId, address indexed passenger, uint256 amount)`
- `EscrowReleased(uint32 indexed requestId, address indexed recipient, uint256 amount)`

**Example:**
```javascript
// After 1 hour of no response from Gateway
const requestId = 1;
const tx = await contract.handleDecryptionTimeout(requestId);
await tx.wait();
console.log("Refund issued due to decryption timeout");
```

---

### `cancelRideWithRefund(uint32 _requestId)`
Cancel ride and receive refund (before assignment).

**Signature:**
```solidity
function cancelRideWithRefund(uint32 _requestId) external
```

**Parameters:**
- `_requestId`: Ride request ID

**Requirements:**
- Caller must be request owner
- Request must not be completed/cancelled
- No driver assigned
- 24-hour timeout must have elapsed

**Effects:**
- Issues full refund
- Cancels ride request

**Events Emitted:**
- `RefundIssued(uint32 indexed requestId, address indexed passenger, uint256 amount)`
- `EscrowReleased(uint32 indexed requestId, address indexed recipient, uint256 amount)`

**Example:**
```javascript
// After 24 hours with no offers accepted
const requestId = 1;
const tx = await contract.cancelRideWithRefund(requestId);
await tx.wait();
```

---

### `releaseEscrowToDriver(uint32 _requestId)`
Release escrowed funds to driver after ride completion.

**Signature:**
```solidity
function releaseEscrowToDriver(uint32 _requestId) external
```

**Parameters:**
- `_requestId`: Ride request ID

**Requirements:**
- Ride must be completed
- Caller must be assigned driver
- Funds must be locked in escrow

**Effects:**
- Releases escrowed funds to driver
- Marks funds as released

**Events Emitted:**
- `EscrowReleased(uint32 indexed requestId, address indexed recipient, uint256 amount)`

**Example:**
```javascript
// After ride completion
const requestId = 1;
const tx = await contract.releaseEscrowToDriver(requestId);
await tx.wait();
console.log("Escrow released to driver");
```

---

## Query Functions

### `getRequestInfo(uint32 _requestId)`
Get basic request information.

**Returns:**
```solidity
(
    address passenger,
    address assignedDriver,
    bool isCompleted,
    bool isCancelled,
    uint256 requestTime,
    uint256 offerCount
)
```

**Example:**
```javascript
const requestId = 1;
const info = await contract.getRequestInfo(requestId);
console.log({
    passenger: info[0],
    assignedDriver: info[1],
    isCompleted: info[2],
    isCancelled: info[3],
    requestTime: info[4].toString(),
    offerCount: info[5].toString()
});
```

---

### `getDriverInfo(address _driver)`
Get driver public information.

**Returns:**
```solidity
(
    bool isRegistered,
    bool isAvailable,
    uint256 totalRides,
    uint256 registrationTime
)
```

**Example:**
```javascript
const driverAddress = "0x...";
const info = await contract.getDriverInfo(driverAddress);
console.log({
    isRegistered: info[0],
    isAvailable: info[1],
    totalRides: info[2].toString(),
    registrationTime: info[3].toString()
});
```

---

### `getEscrowInfo(uint32 _requestId)`
Get escrow information for a ride request.

**Returns:**
```solidity
(
    uint256 escrowAmount,
    bool fundsLocked
)
```

**Example:**
```javascript
const requestId = 1;
const [escrowAmount, fundsLocked] = await contract.getEscrowInfo(requestId);
console.log({
    escrowAmount: ethers.utils.formatEther(escrowAmount),
    fundsLocked: fundsLocked
});
```

---

### `getDecryptionStatus(uint256 _decryptionId)`
Get decryption request status.

**Returns:**
```solidity
(
    uint32 requestId,
    address requester,
    uint256 timestamp,
    bool completed,
    bool timedOut
)
```

**Example:**
```javascript
const decryptionId = 12345;
const status = await contract.getDecryptionStatus(decryptionId);
console.log({
    requestId: status[0],
    requester: status[1],
    timestamp: status[2].toString(),
    completed: status[3],
    timedOut: status[4]
});
```

---

### `isDecryptionTimedOut(uint32 _requestId)`
Check if decryption request has timed out.

**Returns:** `bool`

**Example:**
```javascript
const requestId = 1;
const isTimedOut = await contract.isDecryptionTimedOut(requestId);
if (isTimedOut) {
    console.log("Decryption has timed out - eligible for refund");
}
```

---

### `isDriverEligibleForOffer(address _driverAddress, uint32 _requestId)`
Check if driver can submit an offer.

**Returns:** `bool`

**Example:**
```javascript
const driverAddress = "0x...";
const requestId = 1;
const eligible = await contract.isDriverEligibleForOffer(driverAddress, requestId);
```

---

### `getSystemStats()`
Get system statistics.

**Returns:**
```solidity
(
    uint32 totalRequests,
    uint32 totalDrivers
)
```

**Example:**
```javascript
const [totalRequests, totalDrivers] = await contract.getSystemStats();
console.log(`Total Requests: ${totalRequests}, Total Drivers: ${totalDrivers}`);
```

---

## Events

### Driver Events
```solidity
event DriverRegistered(address indexed driver, uint256 timestamp);
event LocationUpdated(address indexed driver);
```

### Ride Events
```solidity
event RideRequested(uint32 indexed requestId, address indexed passenger, uint256 escrowAmount);
event OfferSubmitted(uint32 indexed requestId, address indexed driver);
event RideMatched(uint32 indexed requestId, address indexed driver, address indexed passenger);
event RideCompleted(uint32 indexed requestId, address indexed driver, address indexed passenger);
event RideCancelled(uint32 indexed requestId, address indexed passenger);
```

### Decryption Events
```solidity
event FareDecryptionRequested(uint32 indexed requestId, uint256 decryptionRequestId);
event FareDecryptionCompleted(uint32 indexed requestId, uint64 decryptedFare);
event DecryptionTimedOut(uint32 indexed requestId, uint256 decryptionRequestId);
```

### Escrow Events
```solidity
event EscrowLocked(uint32 indexed requestId, uint256 amount);
event EscrowReleased(uint32 indexed requestId, address indexed recipient, uint256 amount);
event RefundIssued(uint32 indexed requestId, address indexed passenger, uint256 amount);
```

---

## Errors

```solidity
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
```

---

## Usage Examples

### Complete Workflow Example

```javascript
// 1. Driver Registration
const driverTx = await contract.connect(driverSigner).registerDriver();
await driverTx.wait();

// 2. Driver Updates Location
const latLng = [407128, -740060];
const locationTx = await contract.connect(driverSigner).updateLocation(latLng[0], latLng[1]);
await locationTx.wait();

// 3. Driver Sets Availability
const availTx = await contract.connect(driverSigner).setAvailability(true);
await availTx.wait();

// 4. Passenger Requests Ride
const maxFare = ethers.utils.parseEther("0.05");
const rideTx = await contract.connect(passengerSigner).requestRide(
    407128, -740060,  // Pickup
    408000, -739000,  // Destination
    maxFare,
    { value: maxFare }
);
const rideReceipt = await rideTx.wait();
const requestId = 1; // From event

// 5. Driver Submits Offer
const proposedFare = ethers.utils.parseEther("0.045");
const offerTx = await contract.connect(driverSigner).submitOffer(
    requestId,
    proposedFare,
    300 // 5 minutes
);
await offerTx.wait();

// 6. Passenger Accepts Offer
const acceptTx = await contract.connect(passengerSigner).acceptOffer(requestId, 0);
await acceptTx.wait();

// 7. Request Fare Decryption (Optional)
const decryptTx = await contract.connect(passengerSigner).requestFareDecryption(requestId, 0);
await decryptTx.wait();

// 8. Complete Ride
const completeTx = await contract.connect(driverSigner).completeRide(requestId, 95);
await completeTx.wait();

// 9. Release Escrow
const releaseTx = await contract.connect(driverSigner).releaseEscrowToDriver(requestId);
await releaseTx.wait();

console.log("Ride completed successfully!");
```

### Error Handling Example

```javascript
try {
    const tx = await contract.submitOffer(requestId, proposedFare, estimatedTime);
    await tx.wait();
} catch (error) {
    if (error.message.includes("DriverNotRegistered")) {
        console.error("Driver must register first");
    } else if (error.message.includes("InvalidFareAmount")) {
        console.error("Fare must be between 0.001 and 10 ETH");
    } else if (error.message.includes("RequestNotActive")) {
        console.error("Ride request is no longer active");
    } else {
        console.error("Unknown error:", error);
    }
}
```

### Event Listening Example

```javascript
// Listen for ride requests
contract.on("RideRequested", (requestId, passenger, escrowAmount, event) => {
    console.log(`New ride request: #${requestId}`);
    console.log(`Passenger: ${passenger}`);
    console.log(`Escrow: ${ethers.utils.formatEther(escrowAmount)} ETH`);
});

// Listen for offers
contract.on("OfferSubmitted", (requestId, driver, event) => {
    console.log(`New offer for request #${requestId} from ${driver}`);
});

// Listen for decryption completion
contract.on("FareDecryptionCompleted", (requestId, decryptedFare, event) => {
    console.log(`Fare decrypted for request #${requestId}`);
    console.log(`Fare: ${ethers.utils.formatEther(decryptedFare)} ETH`);
});

// Listen for refunds
contract.on("RefundIssued", (requestId, passenger, amount, event) => {
    console.log(`Refund issued for request #${requestId}`);
    console.log(`Amount: ${ethers.utils.formatEther(amount)} ETH`);
});
```

---

## Integration Guide

### Frontend Integration

**1. Install Dependencies:**
```bash
npm install @fhevm/sdk ethers @rainbow-me/rainbowkit wagmi viem
```

**2. Initialize FHEVM:**
```javascript
import { createFhevmInstance } from '@fhevm/sdk';

const fhevm = await createFhevmInstance({
    gatewayAddress: '0x79d6742b1Bf62452bfcBC6b137ed4eA1ba459a6B',
    chainId: 11155111, // Sepolia
});
```

**3. Connect Contract:**
```javascript
import { ethers } from 'ethers';
import PrivateTaxiDispatchABI from './abi/PrivateTaxiDispatch.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(
    '0xCONTRACT_ADDRESS',
    PrivateTaxiDispatchABI,
    signer
);
```

**4. Encrypt Data (Client-Side):**
```javascript
import { encryptValue } from '@fhevm/sdk';

const latitude = 40.7128;
const scaledLat = Math.floor(latitude * 10000);
const encryptedLat = await encryptValue(scaledLat, 'euint32');
```

---

## Rate Limiting & Best Practices

### Recommended Rate Limits
- Location updates: Max 1 per minute
- Ride requests: Max 5 per hour
- Offer submissions: Max 10 per hour

### Gas Optimization Tips
1. Batch operations when possible
2. Use custom errors instead of require strings
3. Minimize storage writes
4. Cache values in memory before storage updates

### Security Best Practices
1. Always validate user inputs
2. Check escrow balance before transactions
3. Monitor timeout periods
4. Handle Gateway callback failures gracefully
5. Implement frontend rate limiting

---

## Support & Resources

**Documentation:**
- [Zama FHEVM Docs](https://docs.zama.ai)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)

**Contract Address:** `0xd3cc141C38dac488bc1875140e538f0fAcEe7b26` (Sepolia)
**Network:** Ethereum Sepolia Testnet (Chain ID: 11155111)
**Block Explorer:** [Sepolia Etherscan](https://sepolia.etherscan.io)
