# Private Taxi Dispatch - React Edition

A privacy-preserving ride-sharing platform built with React, Vite, and Fully Homomorphic Encryption (FHE) using the `@fhevm/sdk`.

> **Note**: This application has been converted from vanilla JavaScript to React with full `@fhevm/sdk` integration. The legacy static version is preserved in the `public/legacy/` directory.

## 🚀 Live Demo

**Website**: [https://private-taxi-dispatch.vercel.app/](https://private-taxi-dispatch.vercel.app/)
 

## 📖 Project Core Concepts

### FHE Contract Anonymous Taxi Dispatch

This system leverages **Fully Homomorphic Encryption (FHE)** to create a completely private taxi dispatch platform where:

- **Driver locations** are encrypted and never exposed publicly
- **Passenger pickup/destination coordinates** remain private throughout the process
- **Fare negotiations** happen through encrypted offers
- **Identity protection** for both drivers and passengers
- **Smart contract automation** handles matching and payments securely

### Privacy Taxi Management System

The platform provides a comprehensive privacy-first approach to ride-sharing:

#### For Drivers 🚗
- Register anonymously on the blockchain
- Update encrypted location coordinates
- Set availability status privately
- Submit encrypted offers for ride requests
- Complete rides with encrypted passenger ratings

#### For Passengers 👤
- Request rides with encrypted pickup/destination data
- Set maximum fare preferences privately
- Review encrypted driver offers
- Rate drivers while maintaining anonymity
- Access complete ride history with privacy intact

#### For the System 🔐
- All sensitive data encrypted using FHE
- Zero-knowledge proof implementations
- Decentralized matching algorithms
- Transparent yet private transaction records
- Anti-fraud mechanisms without compromising privacy

## 🛠 Technical Architecture

### Smart Contract Features
- **Driver Registration & Management**: Anonymous driver onboarding
- **Location Updates**: Encrypted coordinate handling
- **Ride Request Processing**: Private demand-supply matching
- **Offer Management**: Encrypted bid system
- **Payment Processing**: Secure transaction handling
- **Rating System**: Anonymous feedback mechanism

### Encryption Technology
- **Fully Homomorphic Encryption (FHE)**: Enables computation on encrypted data
- **Zero-Knowledge Proofs**: Verify information without revealing it
- **Blockchain Security**: Immutable and transparent transaction records
- **Web3 Integration**: Seamless wallet connectivity

## 📝 Contract Information

**Smart Contract Address**: `0xd3cc141c38dac488bc1875140e538f0facee7b26`

The contract is deployed on Ethereum-compatible networks and provides the following key functions:
- `registerDriver()` - Anonymous driver registration
- `updateLocation()` - Encrypted location updates
- `requestRide()` - Private ride requests
- `submitOffer()` - Encrypted offer submissions
- `acceptOffer()` - Secure offer acceptance
- `completeRide()` - Anonymous ride completion

## 🎥 Demo & Screenshots

### PrivateTaxiDispatch.mp4
Experience the full functionality of the Private Taxi Dispatch system through our comprehensive demo video, showcasing:
- Driver registration process
- Anonymous location updates
- Private ride request workflows
- Encrypted offer management
- Secure ride completion

### PrivateTaxiDispatch.png
View real blockchain transactions demonstrating:
- Driver registration confirmations
- Encrypted data submissions
- Smart contract interactions
- Payment processing
- Privacy-preserving operations

## 🌟 Key Features

### Privacy-First Design
- **End-to-End Encryption**: All sensitive data encrypted using FHE
- **Anonymous Operations**: No personal data exposure
- **Zero-Knowledge Architecture**: Prove eligibility without revealing identity
- **Decentralized Privacy**: No central authority accessing private data

### Smart Contract Automation
- **Automated Matching**: Algorithm-driven driver-passenger pairing
- **Transparent Pricing**: Fair fare calculation without data exposure
- **Dispute Resolution**: Blockchain-based conflict management
- **Payment Security**: Trustless transaction processing

### User Experience
- **Intuitive Interface**: Clean, modern web application
- **Real-Time Updates**: Live status monitoring
- **Mobile Responsive**: Optimized for all devices
- **Web3 Integration**: Seamless wallet connectivity

## 🔧 Technology Stack

- **Blockchain**: Ethereum-compatible networks
- **Smart Contracts**: Solidity with FHE integration
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Encryption**: Zama's FHEVM for homomorphic encryption
- **Web3**: Ethers.js for blockchain interaction
- **Deployment**: Vercel for hosting

## 🚀 Getting Started

1. **Visit the Live Application**: Navigate to [https://private-taxi-dispatch.vercel.app/](https://private-taxi-dispatch.vercel.app/)

2. **Connect Your Wallet**: Use MetaMask or any Web3-compatible wallet

3. **Choose Your Role**:
   - **Driver**: Register and start accepting ride requests
   - **Passenger**: Submit ride requests and book drivers

4. **Enjoy Private Transportation**: Experience truly anonymous ride-sharing

## 🔐 Security & Privacy

### Data Protection
- All location data encrypted using FHE
- Private key management through Web3 wallets
- Zero personal information stored on-chain
- Anonymous transaction processing

### Smart Contract Security
- Thoroughly tested contract logic
- Secure payment handling
- Access control mechanisms
- Anti-fraud protection systems

## 🌐 Network Compatibility

The system is designed to work on:
- Ethereum Mainnet
- Polygon Network
- Arbitrum
- Other Ethereum-compatible chains

## 📊 System Statistics

Track real-time system metrics:
- Total registered drivers
- Completed ride requests
- Active network participants
- Privacy-preserving operations

## 🤝 Contributing

We welcome contributions from the privacy and blockchain community. The system represents a significant advancement in anonymous transportation services.

## 📜 License

This project is open-source and available under the MIT License.

## 🔗 Links

- **Live Application**: [https://private-taxi-dispatch.vercel.app/](https://private-taxi-dispatch.vercel.app/)
- **Smart Contract**: `0xd3cc141c38dac488bc1875140e538f0facee7b26`

---

*Building the future of private transportation with blockchain technology and advanced cryptography.*