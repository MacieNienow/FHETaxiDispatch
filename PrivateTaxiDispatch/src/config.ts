// Contract configuration
export const CONTRACT_ADDRESS = '0xd3cc141c38dac488bc1875140e538f0facee7b26' as const;

export const CONTRACT_ABI = [
  'function registerDriver()',
  'function updateLocation(bytes calldata encryptedLatitude, bytes calldata encryptedLongitude)',
  'function setAvailability(bool _available)',
  'function requestRide(bytes calldata encPickupLat, bytes calldata encPickupLng, bytes calldata encDestLat, bytes calldata encDestLng, bytes calldata encMaxFare)',
  'function submitOffer(uint32 _requestId, bytes calldata encProposedFare, bytes calldata encEstimatedTime)',
  'function acceptOffer(uint32 _requestId, uint256 _offerIndex)',
  'function completeRide(uint32 _requestId, uint8 _passengerRating)',
  'function cancelRequest(uint32 _requestId)',
  'function getRequestInfo(uint32 _requestId) view returns (address, address, bool, bool, uint256, uint256)',
  'function getDriverInfo(address _driver) view returns (bool, bool, uint256, uint256)',
  'function getPassengerHistory(address _passenger) view returns (uint32[])',
  'function getDriverHistory(address _driver) view returns (uint32[])',
  'function getSystemStats() view returns (uint32, uint32)',
  'event DriverRegistered(address indexed driver, uint256 timestamp)',
  'event LocationUpdated(address indexed driver)',
  'event RideRequested(uint32 indexed requestId, address indexed passenger)',
  'event OfferSubmitted(uint32 indexed requestId, address indexed driver)',
  'event RideMatched(uint32 indexed requestId, address indexed driver, address indexed passenger)',
  'event RideCompleted(uint32 indexed requestId, address indexed driver, address indexed passenger)',
  'event RideCancelled(uint32 indexed requestId, address indexed passenger)',
] as const;

// FHEVM Configuration
export const FHEVM_CONFIG = {
  gatewayAddress: '0x79d6742b1Bf62452bfcBC6b137ed4eA1ba459a6B' as const,
  chainId: 11155111, // Sepolia
};

// Coordinate scaling factor (multiply by 10000 for precision)
export const COORDINATE_SCALE = 10000;
