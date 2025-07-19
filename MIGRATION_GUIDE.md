# Migration Guide: FHE Gateway Contract Updates

## Overview

This guide explains the migration from the old gateway contract architecture to the new system supporting:
- **PauserSet**: Immutable contract for decentralized pause control
- **KMS Generation**: Updated from KMS Management
- **Transaction Input Rerandomization**: Enhanced security with sIND-CPAD
- **New View Functions**: Replacing `check...` functions with `is...` functions

## Breaking Changes

### 1. Gateway Contract Address
The KMS Management contract has been renamed and relocated:

**DEPRECATED:**
```
KMS_MANAGEMENT_ADDRESS
```

**NEW:**
```
KMS_GENERATION_ADDRESS
```

### 2. Pauser Configuration

**OLD System:**
```env
PAUSER_ADDRESS=0x1234...
```

**NEW System:**
```env
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0x1234...
PAUSER_ADDRESS_1=0x5678...
PAUSER_ADDRESS_2=0x9abc...
```

The number of pausers should equal: `n_kms + n_copro`
- `n_kms`: Number of registered KMS nodes
- `n_copro`: Number of registered coprocessors

### 3. View Functions API Change

All `check...` functions have been replaced with `is...` functions that return booleans instead of reverting:

**OLD:**
```solidity
gateway.checkPublicDecryptAllowed(address);
// Reverts if not allowed
```

**NEW:**
```solidity
bool allowed = gateway.isPublicDecryptAllowed(address);
if (!allowed) {
    // Handle error
}
```

## Contract Changes

### 1. PauserSet Contract (New)

Immutable contract that manages pauser addresses:

```solidity
contract PauserSet {
    function isPauser(address) external view returns (bool);
    function getPauserCount() external view returns (uint256);
    function getAllPausers() external view returns (address[] memory);
}
```

**Key Features:**
- Immutable after deployment
- Supports multiple pauser addresses
- Efficient pauser lookup

### 2. TaxiGateway Contract (New)

Enhanced gateway with integrated pause control:

```solidity
contract TaxiGateway {
    PauserSet public immutable pauserSet;
    address public immutable kmsGenerationContract;

    function pause() external onlyPauser;
    function unpause() external onlyOwner;
    function isPublicDecryptAllowed(address) external view returns (bool);
    function isOperational() external view returns (bool);
}
```

**Key Features:**
- Integrates with PauserSet for decentralized pause control
- References KMS Generation contract
- Non-reverting view functions

### 3. PrivateTaxiDispatch Updates

Main contract now integrates with gateway:

```solidity
contract PrivateTaxiDispatch {
    TaxiGateway public gateway;

    modifier whenOperational() {
        if (address(gateway) != address(0)) {
            require(gateway.isOperational(), "System paused");
        }
        _;
    }

    // New view functions
    function isDriverEligibleForOffer(address, uint32) external view returns (bool);
    function isRequestActive(uint32) external view returns (bool);
    function isDriverAvailable(address) external view returns (bool);
    function isSystemOperational() external view returns (bool);
}
```

## Migration Steps

### Step 1: Update Environment Configuration

1. Create a `.env` file based on `.env.example`
2. Configure pauser addresses:
   ```env
   NUM_PAUSERS=3
   PAUSER_ADDRESS_0=<KMS_NODE_1>
   PAUSER_ADDRESS_1=<KMS_NODE_2>
   PAUSER_ADDRESS_2=<COPROCESSOR_1>
   ```
3. Update KMS address:
   ```env
   KMS_GENERATION_ADDRESS=<NEW_KMS_GENERATION_ADDRESS>
   ```

### Step 2: Deploy New Contracts

```bash
# Install dependencies
npm install

# Compile contracts (using Hardhat or Foundry)
npx hardhat compile

# Deploy with new gateway system
node scripts/deploy-with-gateway.js
```

**Deployment Order:**
1. PauserSet (with pauser addresses)
2. TaxiGateway (with PauserSet and KMS Generation addresses)
3. PrivateTaxiDispatch (with Gateway address)

### Step 3: Update Frontend Integration

Update your DApp to use the new contract addresses and functions:

```javascript
// Old code
try {
    await gateway.checkPublicDecryptAllowed(userAddress);
    // Proceed with decryption
} catch (error) {
    // Not allowed
}

// New code
const allowed = await gateway.isPublicDecryptAllowed(userAddress);
if (allowed) {
    // Proceed with decryption
} else {
    // Handle not allowed case
}
```

### Step 4: Update View Function Calls

Replace all `check...` function calls with `is...` equivalents:

| Old Function | New Function |
|-------------|--------------|
| `checkPublicDecryptAllowed(address)` | `isPublicDecryptAllowed(address)` |
| N/A (was reverting) | `isRequestActive(uint32)` |
| N/A (was reverting) | `isDriverAvailable(address)` |
| N/A (was reverting) | `isSystemOperational()` |

### Step 5: Test Pause Functionality

```javascript
// Test pause from authorized pauser
await gateway.connect(pauserSigner).pause();

// Verify operations are blocked
const operational = await gateway.isOperational();
console.log('Operational:', operational); // false

// Test unpause from owner
await gateway.connect(ownerSigner).unpause();
```

## Security Considerations

### Transaction Input Rerandomization

The new system automatically rerandomizes all transaction inputs (including state inputs) before FHE operation evaluation:

- **What**: Encrypted values are re-encrypted with fresh randomness
- **Why**: Provides sIND-CPAD security
- **Impact**: Transparent to users, no code changes needed

### Pauser Authorization

Only addresses in the PauserSet can pause the contract:

```solidity
// Check if address is authorized pauser
bool authorized = pauserSet.isPauser(someAddress);

// Pause operation (only authorized pausers)
if (authorized) {
    gateway.pause();
}
```

### Immutability Considerations

**PauserSet is immutable:**
- Cannot add/remove pausers after deployment
- Carefully configure pauser addresses before deployment
- Plan for KMS/coprocessor changes in advance

## Rollback Plan

If issues occur during migration:

1. **Keep old contract addresses** in a backup file
2. **Test on testnet** before mainnet migration
3. **Gradual migration**: Deploy new contracts alongside old ones
4. **Monitor for 24-48 hours** before deprecating old contracts
5. **Emergency contacts**: Maintain list of pauser addresses

## Testing Checklist

- [ ] PauserSet deployment with correct addresses
- [ ] TaxiGateway integration with PauserSet
- [ ] KMS Generation contract connectivity
- [ ] Pause/unpause functionality
- [ ] Driver registration when operational
- [ ] Operations blocked when paused
- [ ] View functions return correct values
- [ ] Frontend displays correct state
- [ ] Decryption requests work correctly
- [ ] All pausers can pause the system
- [ ] Only owner can unpause

## Support and Resources

### Documentation
- FHE Gateway Specification: [Link to docs]
- Zama FHEVM Documentation: https://docs.zama.ai/fhevm
- PauserSet Implementation: `contracts/PauserSet.sol`

### Contract Addresses (Example - Sepolia)
```
PauserSet:           0x...
TaxiGateway:         0x...
PrivateTaxiDispatch: 0x...
KMS Generation:      0x...
```

### Deprecated Variables (DO NOT USE)
- `PAUSER_ADDRESS` → Use `PAUSER_ADDRESS_[0-N]`
- `KMS_MANAGEMENT_ADDRESS` → Use `KMS_GENERATION_ADDRESS`
- `checkPublicDecryptAllowed()` → Use `isPublicDecryptAllowed()`

## Common Issues and Solutions

### Issue 1: "Invalid gateway address"
**Solution:** Ensure TaxiGateway is deployed before PrivateTaxiDispatch

### Issue 2: "Not authorized pauser"
**Solution:** Verify caller address is in PauserSet deployment

### Issue 3: "System paused by gateway"
**Solution:** Check gateway status with `isOperational()` and unpause if needed

### Issue 4: KMS Generation not responding
**Solution:** Verify `KMS_GENERATION_ADDRESS` is correct and contract is deployed

## Conclusion

This migration enhances the security and flexibility of the Private Taxi Dispatch system through:
- Decentralized pause control via PauserSet
- Improved KMS integration with Generation contract
- Enhanced security through rerandomization
- Better error handling with non-reverting view functions

Follow this guide carefully to ensure a smooth migration. Test thoroughly on testnet before deploying to mainnet.

---

**Last Updated:** 2025-10-23
**Version:** 1.0.0
**Contact:** support@privatetaxidispatch.example
