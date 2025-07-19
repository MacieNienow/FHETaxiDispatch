# Gateway Contract Update - Private Taxi Dispatch

## What's New

This update implements the latest FHE gateway contract specifications for enhanced security and decentralized control.

## New Features

### 1. PauserSet Contract
**Immutable contract for decentralized pause control**

- Multiple authorized pausers (KMS nodes + Coprocessors)
- Immutable after deployment for maximum security
- Transparent pauser management

```solidity
// contracts/PauserSet.sol
contract PauserSet {
    function isPauser(address _address) external view returns (bool);
    function getPauserCount() external view returns (uint256);
    function getAllPausers() external view returns (address[] memory);
}
```

### 2. TaxiGateway Contract
**Enhanced gateway with integrated pause functionality**

- Integrates with PauserSet for decentralized control
- References KMS Generation contract (replaces KMS Management)
- Non-reverting view functions for better error handling

```solidity
// contracts/TaxiGateway.sol
contract TaxiGateway {
    function pause() external onlyPauser;
    function unpause() external onlyOwner;
    function isPublicDecryptAllowed(address) external view returns (bool);
    function isOperational() external view returns (bool);
}
```

### 3. Enhanced PrivateTaxiDispatch
**Main contract with gateway integration**

- All operations check gateway status
- New `is...` view functions replace `check...` functions
- Automatic transaction input rerandomization for sIND-CPAD security

```solidity
// contracts/PrivateTaxiDispatch.sol
contract PrivateTaxiDispatch {
    modifier whenOperational() {
        require(gateway.isOperational(), "System paused");
        _;
    }

    // New view functions
    function isDriverEligibleForOffer(address, uint32) returns (bool);
    function isRequestActive(uint32) returns (bool);
    function isSystemOperational() returns (bool);
}
```

### 4. Transaction Input Rerandomization
**Automatic security enhancement**

All transaction inputs are now automatically rerandomized before FHE operations to provide **sIND-CPAD security**:

- Transparent to users
- No code changes required
- Enhanced cryptographic security

## Environment Variables

### New Variables

```env
# Number of pausers (n_kms + n_copro)
NUM_PAUSERS=3

# Individual pauser addresses
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
PAUSER_ADDRESS_2=0x...

# KMS Generation contract (replaces KMS Management)
KMS_GENERATION_ADDRESS=0x...
```

### Deprecated Variables

```env
# DO NOT USE - These are deprecated
# PAUSER_ADDRESS
# KMS_MANAGEMENT_ADDRESS
```

## File Structure

```
dapp/
├── contracts/
│   ├── PauserSet.sol              # New: Immutable pauser management
│   ├── TaxiGateway.sol            # New: Gateway with pause control
│   └── PrivateTaxiDispatch.sol    # Updated: Gateway integration
├── scripts/
│   ├── deploy-with-gateway.js     # New: Deployment script
│   └── test-gateway.js            # New: Testing script
├── .env.example                    # New: Environment template
├── MIGRATION_GUIDE.md             # New: Detailed migration guide
├── GATEWAY_UPDATE.md              # This file
└── README.md                       # Original project documentation
```

## Quick Start

### 1. Setup Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# - Set NUM_PAUSERS
# - Configure PAUSER_ADDRESS_[0-N]
# - Set KMS_GENERATION_ADDRESS
# - Add deployment keys
```

### 2. Compile Contracts

```bash
# Using Hardhat
npx hardhat compile

# Or using Foundry
forge build
```

### 3. Deploy Contracts

```bash
# Deploy with gateway support
node scripts/deploy-with-gateway.js
```

### 4. Test Gateway

```bash
# Run test suite
node scripts/test-gateway.js
```

## Key Changes Summary

| Feature | Old | New |
|---------|-----|-----|
| **Pause Control** | Single pauser | Multiple pausers via PauserSet |
| **KMS Integration** | KMS Management | KMS Generation |
| **View Functions** | `check...` (reverting) | `is...` (boolean return) |
| **Security** | Standard FHE | FHE + rerandomization (sIND-CPAD) |
| **Configuration** | `PAUSER_ADDRESS` | `PAUSER_ADDRESS_[0-N]` |

## API Changes

### View Functions Migration

```javascript
// OLD: checkPublicDecryptAllowed (reverts on failure)
try {
    await gateway.checkPublicDecryptAllowed(userAddress);
    // Allowed
} catch (error) {
    // Not allowed
}

// NEW: isPublicDecryptAllowed (returns boolean)
const allowed = await gateway.isPublicDecryptAllowed(userAddress);
if (allowed) {
    // Proceed
} else {
    // Handle not allowed
}
```

### New View Functions

```javascript
// Check driver eligibility
const eligible = await contract.isDriverEligibleForOffer(driverAddress, requestId);

// Check request status
const active = await contract.isRequestActive(requestId);

// Check driver availability
const available = await contract.isDriverAvailable(driverAddress);

// Check system operational status
const operational = await contract.isSystemOperational();
```

## Security Improvements

### 1. Decentralized Pause Control
- Multiple authorized pausers (not just one admin)
- KMS nodes and coprocessors can pause
- Only owner can unpause (prevents abuse)

### 2. sIND-CPAD Security
- Transaction inputs automatically rerandomized
- Provides semantic security for encrypted data
- Transparent to developers and users

### 3. Immutable PauserSet
- Cannot be modified after deployment
- Prevents unauthorized changes to pause control
- Maximum trust and transparency

### 4. Non-Reverting View Functions
- Better error handling in frontend
- More gas-efficient checks
- Improved user experience

## Testing Checklist

Before deploying to production:

- [ ] Verify all pauser addresses are correct
- [ ] Test pause functionality with each pauser
- [ ] Verify only owner can unpause
- [ ] Test all view functions return correct values
- [ ] Verify operations blocked when paused
- [ ] Test KMS Generation integration
- [ ] Verify rerandomization is transparent
- [ ] Test frontend with new API
- [ ] Verify gas costs are acceptable
- [ ] Complete security audit

## Deployment Steps

1. **Configure Environment**
   - Set all pauser addresses
   - Configure KMS Generation address
   - Set deployment keys

2. **Deploy PauserSet**
   - Deploy with all pauser addresses
   - Verify immutability
   - Record contract address

3. **Deploy TaxiGateway**
   - Deploy with PauserSet and KMS addresses
   - Verify integration
   - Record contract address

4. **Deploy PrivateTaxiDispatch**
   - Deploy with Gateway address
   - Verify all functions work
   - Record contract address

5. **Verify Contracts**
   - Verify on block explorer
   - Test all functionality
   - Update frontend

## Resources

- **Migration Guide**: See `MIGRATION_GUIDE.md` for detailed instructions
- **Zama Documentation**: https://docs.zama.ai/fhevm
- **FHE Gateway Spec**: [Link to specification]
- **Support**: Create an issue on GitHub

## Contract Addresses (Example - Sepolia Testnet)

```
PauserSet:           0x0000000000000000000000000000000000000000
TaxiGateway:         0x0000000000000000000000000000000000000000
PrivateTaxiDispatch: 0xd3cc141c38dac488bc1875140e538f0facee7b26
KMS Generation:      0x0000000000000000000000000000000000000000
```

*Update these addresses after deployment*

## Questions?

- Check the `MIGRATION_GUIDE.md` for detailed information
- Review test scripts in `scripts/test-gateway.js`
- Open an issue on GitHub for support

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
**Status**: Ready for Testing
