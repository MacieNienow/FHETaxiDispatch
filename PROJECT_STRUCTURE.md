# Private Taxi Dispatch - Project Structure

Complete overview of the project structure and file organization.

## Directory Structure

```
PrivateTaxiDispatch/
├── contracts/                  # Smart contracts
│   ├── PauserSet.sol          # Pauser management contract
│   ├── TaxiGateway.sol        # Gateway with pause control
│   ├── PrivateTaxiDispatch.sol # Main dispatch contract
│   └── test/                  # Contract test helpers
│
├── scripts/                    # Deployment and interaction scripts
│   ├── deploy.js              # Main deployment script
│   ├── verify.js              # Contract verification script
│   ├── interact.js            # Contract interaction utilities
│   └── simulate.js            # System simulation script
│
├── test/                       # Test suites
│   ├── PauserSet.test.js      # PauserSet contract tests
│   ├── TaxiGateway.test.js    # TaxiGateway contract tests
│   └── PrivateTaxiDispatch.test.js # Main contract tests
│
├── deploy/                     # Hardhat-deploy deployment scripts
│   └── (optional deployment tasks)
│
├── deployments/                # Deployment artifacts (generated)
│   ├── sepolia/
│   │   └── deployment.json    # Sepolia deployment info
│   └── localhost/
│       └── deployment.json    # Local deployment info
│
├── public/                     # Frontend files
│   ├── index.html             # Main HTML file
│   ├── app.js                 # Frontend JavaScript
│   ├── styles.css             # Styling
│   └── contracts.json         # Contract addresses (generated)
│
├── typechain-types/            # Generated TypeScript types
│   └── (auto-generated)
│
├── artifacts/                  # Compiled contract artifacts
│   └── (auto-generated)
│
├── cache/                      # Hardhat cache
│   └── (auto-generated)
│
├── node_modules/               # Dependencies
│
├── .github/                    # GitHub configuration
│   └── workflows/
│       └── deploy.yml         # GitHub Actions deployment
│
├── hardhat.config.ts          # Hardhat TypeScript configuration
├── hardhat.config.js          # Legacy Hardhat configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # NPM package configuration
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── vercel.json                # Vercel deployment config
│
├── README.md                  # Main documentation
├── DEPLOYMENT.md              # Deployment guide
├── PROJECT_STRUCTURE.md       # This file
├── DEVELOPMENT.md             # Development guide
├── GATEWAY_UPDATE.md          # Gateway update notes
├── IMPLEMENTATION_COMPLETE.md # Implementation notes
├── IMPLEMENTATION_SUMMARY.md  # Implementation summary
├── MIGRATION_GUIDE.md         # Migration guide
├── QUICK_REFERENCE.md         # Quick reference
└── QUICKSTART.md              # Quick start guide
```

## Core Files Description

### Smart Contracts

#### `contracts/PauserSet.sol`
- Manages the set of authorized pausers
- Validates pauser permissions
- Used by TaxiGateway for access control

**Key Functions**:
```solidity
function isPauser(address account) external view returns (bool)
function getPausers() external view returns (address[] memory)
```

#### `contracts/TaxiGateway.sol`
- Implements pause/unpause functionality
- Requires consensus from multiple pausers
- Controls access to main dispatch contract

**Key Functions**:
```solidity
function pause() external onlyPauser
function unpause() external onlyPauser
function setAuthorizedContract(address _contract, bool _authorized) external
```

#### `contracts/PrivateTaxiDispatch.sol`
- Main ride-sharing logic
- FHE-encrypted data handling
- Driver and passenger management

**Key Functions**:
```solidity
function registerDriver() external
function requestRide(...) external
function submitOffer(...) external
function acceptOffer(uint32 requestId, uint32 offerId) external
function completeRide(uint32 requestId, euint8 rating) external
```

### Deployment Scripts

#### `scripts/deploy.js`
Main deployment script that:
1. Deploys PauserSet with configured pausers
2. Deploys TaxiGateway linked to PauserSet
3. Deploys PrivateTaxiDispatch linked to Gateway
4. Configures Gateway authorization
5. Saves deployment data

**Usage**:
```bash
npm run deploy:sepolia
```

#### `scripts/verify.js`
Contract verification script that:
- Reads deployment data
- Verifies each contract on Etherscan
- Provides verification links

**Usage**:
```bash
npm run verify:sepolia
```

#### `scripts/interact.js`
Interactive utility providing:
- Contract information display
- Driver registration
- Ride request creation
- System state queries

**Usage**:
```bash
npm run interact:sepolia
```

#### `scripts/simulate.js`
Full system simulation that:
- Registers multiple drivers
- Creates multiple ride requests
- Displays statistics
- Tests complete workflow

**Usage**:
```bash
npm run simulate:sepolia
```

### Configuration Files

#### `hardhat.config.ts`
TypeScript Hardhat configuration with:
- Solidity compiler settings (v0.8.24)
- Network configurations (hardhat, localhost, sepolia)
- Plugin configurations (typechain, gas reporter, etherscan)
- Path configurations
- Named accounts setup

#### `tsconfig.json`
TypeScript configuration for:
- Target: ES2020
- Module: CommonJS
- Type checking settings
- Include/exclude patterns

#### `package.json`
NPM package configuration with:
- Project metadata
- Script commands
- Dependencies
- Development dependencies

### Environment Configuration

#### `.env.example`
Template for environment variables:

```env
# Deployment
PRIVATE_KEY=...
SEPOLIA_RPC_URL=...

# Verification
ETHERSCAN_API_KEY=...

# Optional
PAUSER1_ADDRESS=...
PAUSER2_ADDRESS=...
REPORT_GAS=...
COINMARKETCAP_API_KEY=...
```

**Required Variables**:
- `PRIVATE_KEY`: Deployer wallet private key
- `SEPOLIA_RPC_URL`: Infura/Alchemy RPC endpoint
- `ETHERSCAN_API_KEY`: For contract verification

**Optional Variables**:
- `PAUSER1_ADDRESS`: First pauser address (defaults to deployer)
- `PAUSER2_ADDRESS`: Second pauser address (defaults to deployer)
- `REPORT_GAS`: Enable gas reporting in tests
- `COINMARKETCAP_API_KEY`: For gas price conversion

## Generated Files

### Deployment Artifacts

#### `deployments/sepolia/deployment.json`
Contains:
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "deployer": "0x...",
  "timestamp": "2025-10-23T...",
  "contracts": {
    "PauserSet": "0x...",
    "TaxiGateway": "0x...",
    "PrivateTaxiDispatch": "0x..."
  }
}
```

#### `public/contracts.json`
Frontend contract addresses:
```json
{
  "PauserSet": "0x...",
  "TaxiGateway": "0x...",
  "PrivateTaxiDispatch": "0x...",
  "network": "sepolia",
  "chainId": "11155111"
}
```

### TypeChain Types

Generated TypeScript types in `typechain-types/`:
- Contract factories
- Contract interfaces
- Type-safe function calls
- Event types

**Usage in TypeScript**:
```typescript
import { PrivateTaxiDispatch } from './typechain-types';

const contract = await ethers.getContractAt('PrivateTaxiDispatch', address) as PrivateTaxiDispatch;
const driverInfo = await contract.getDriverInfo(driverAddress);
```

## NPM Scripts

### Compilation & Building

```bash
npm run compile          # Compile contracts
npm run typechain        # Generate TypeScript types
npm run size             # Check contract sizes
npm run clean            # Clean build artifacts
```

### Testing

```bash
npm test                 # Run all tests
npm run test:gas         # Run tests with gas reporting
npm run test:coverage    # Generate coverage report
npm run test:gateway     # Test gateway only
npm run test:dispatch    # Test dispatch only
```

### Deployment

```bash
npm run node             # Start local Hardhat node
npm run deploy           # Deploy to default network
npm run deploy:localhost # Deploy to local network
npm run deploy:sepolia   # Deploy to Sepolia testnet
```

### Verification

```bash
npm run verify           # Verify on current network
npm run verify:sepolia   # Verify on Sepolia
```

### Interaction

```bash
npm run interact         # Interact with contracts
npm run interact:sepolia # Interact on Sepolia
npm run simulate         # Run simulation
npm run simulate:sepolia # Run simulation on Sepolia
```

### Maintenance

```bash
npm run clean            # Clean build artifacts
npm run clean:deployments # Clean deployment files
npm run clean:all        # Clean everything + node_modules
```

## Development Workflow

### 1. Initial Setup

```bash
git clone <repository>
cd PrivateTaxiDispatch
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 2. Development Cycle

```bash
# Make changes to contracts
npm run compile
npm test
npm run test:gas
```

### 3. Local Testing

```bash
# Terminal 1
npm run node

# Terminal 2
npm run deploy:localhost
npm run interact
```

### 4. Testnet Deployment

```bash
npm run deploy:sepolia
npm run verify:sepolia
npm run interact:sepolia
npm run simulate:sepolia
```

## File Naming Conventions

- **Contracts**: PascalCase (e.g., `PrivateTaxiDispatch.sol`)
- **Scripts**: kebab-case (e.g., `deploy.js`, `interact.js`)
- **Tests**: kebab-case with `.test.js` suffix
- **Config Files**: lowercase (e.g., `hardhat.config.ts`)
- **Documentation**: UPPERCASE with `.md` (e.g., `README.md`)

## Git Ignore Rules

The `.gitignore` file excludes:

```gitignore
# Dependencies
node_modules/

# Build artifacts
artifacts/
cache/
typechain-types/

# Environment
.env
.env.local

# Deployment data
deployments/localhost/
deployments/hardhat/

# Logs
*.log

# Coverage
coverage/
coverage.json

# IDE
.vscode/
.idea/
```

## Important Notes

### Security

1. **Never commit `.env` file**
2. **Keep private keys secure**
3. **Use `.env.example` as template only**
4. **Review all transactions before signing**

### Best Practices

1. **Always run tests before deployment**
2. **Verify contracts after deployment**
3. **Keep deployment records**
4. **Document all configuration changes**
5. **Use TypeScript for better type safety**

### Maintenance

1. **Update dependencies regularly**
2. **Run security audits**
3. **Monitor gas costs**
4. **Check contract sizes**
5. **Keep documentation updated**

## Resources

- **Hardhat Documentation**: https://hardhat.org/
- **Ethers.js Docs**: https://docs.ethers.org/
- **TypeChain Docs**: https://github.com/dethcrypto/TypeChain
- **Zama FHEVM**: https://docs.zama.ai/fhevm

---

**Version**: 2.0.0
**Last Updated**: 2025-10-23
**Framework**: Hardhat with TypeScript support
