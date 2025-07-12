export const CONTRACTS = {
  PAUSER_SET: {
    address: process.env.NEXT_PUBLIC_PAUSER_SET_ADDRESS as `0x${string}`,
    chainId: 11155111,
  },
  TAXI_GATEWAY: {
    address: process.env.NEXT_PUBLIC_TAXI_GATEWAY_ADDRESS as `0x${string}`,
    chainId: 11155111,
  },
  PRIVATE_TAXI_DISPATCH: {
    address: process.env.NEXT_PUBLIC_PRIVATE_TAXI_DISPATCH_ADDRESS as `0x${string}`,
    chainId: 11155111,
  },
} as const;

export const PRIVATE_TAXI_DISPATCH_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_gatewayAddress", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "driver", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "DriverRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "driver", "type": "address"}
    ],
    "name": "LocationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint32", "name": "requestId", "type": "uint32"},
      {"indexed": true, "internalType": "address", "name": "passenger", "type": "address"}
    ],
    "name": "RideRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint32", "name": "requestId", "type": "uint32"},
      {"indexed": true, "internalType": "address", "name": "driver", "type": "address"}
    ],
    "name": "OfferSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint32", "name": "requestId", "type": "uint32"},
      {"indexed": true, "internalType": "address", "name": "driver", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "passenger", "type": "address"}
    ],
    "name": "RideMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint32", "name": "requestId", "type": "uint32"},
      {"indexed": true, "internalType": "address", "name": "driver", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "passenger", "type": "address"}
    ],
    "name": "RideCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint32", "name": "requestId", "type": "uint32"},
      {"indexed": true, "internalType": "address", "name": "passenger", "type": "address"}
    ],
    "name": "RideCancelled",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "registerDriver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint32", "name": "_latitude", "type": "uint32"},
      {"internalType": "uint32", "name": "_longitude", "type": "uint32"}
    ],
    "name": "updateLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bool", "name": "_available", "type": "bool"}],
    "name": "setAvailability",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint32", "name": "_pickupLat", "type": "uint32"},
      {"internalType": "uint32", "name": "_pickupLng", "type": "uint32"},
      {"internalType": "uint32", "name": "_destLat", "type": "uint32"},
      {"internalType": "uint32", "name": "_destLng", "type": "uint32"},
      {"internalType": "uint32", "name": "_maxFare", "type": "uint32"}
    ],
    "name": "requestRide",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint32", "name": "_requestId", "type": "uint32"},
      {"internalType": "uint32", "name": "_proposedFare", "type": "uint32"},
      {"internalType": "uint32", "name": "_estimatedTime", "type": "uint32"}
    ],
    "name": "submitOffer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint32", "name": "_requestId", "type": "uint32"},
      {"internalType": "uint256", "name": "_offerIndex", "type": "uint256"}
    ],
    "name": "acceptOffer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint32", "name": "_requestId", "type": "uint32"},
      {"internalType": "uint8", "name": "_passengerRating", "type": "uint8"}
    ],
    "name": "completeRide",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint32", "name": "_requestId", "type": "uint32"}],
    "name": "cancelRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint32", "name": "_requestId", "type": "uint32"}],
    "name": "getRequestInfo",
    "outputs": [
      {"internalType": "address", "name": "passenger", "type": "address"},
      {"internalType": "address", "name": "assignedDriver", "type": "address"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"},
      {"internalType": "bool", "name": "isCancelled", "type": "bool"},
      {"internalType": "uint256", "name": "requestTime", "type": "uint256"},
      {"internalType": "uint256", "name": "offerCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_driver", "type": "address"}],
    "name": "getDriverInfo",
    "outputs": [
      {"internalType": "bool", "name": "isRegistered", "type": "bool"},
      {"internalType": "bool", "name": "isAvailable", "type": "bool"},
      {"internalType": "uint256", "name": "totalRides", "type": "uint256"},
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_passenger", "type": "address"}],
    "name": "getPassengerHistory",
    "outputs": [{"internalType": "uint32[]", "name": "", "type": "uint32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_driver", "type": "address"}],
    "name": "getDriverHistory",
    "outputs": [{"internalType": "uint32[]", "name": "", "type": "uint32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSystemStats",
    "outputs": [
      {"internalType": "uint32", "name": "totalRequests", "type": "uint32"},
      {"internalType": "uint32", "name": "totalDrivers", "type": "uint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isSystemOperational",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestCounter",
    "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "driverCounter",
    "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
