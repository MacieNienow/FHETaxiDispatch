/**
 * FHE Utilities for Private Taxi Dispatch
 * Integrates with fhevmjs library for encrypted operations
 */

class FHEUtils {
    constructor() {
        this.fhevmInstance = null;
        this.initialized = false;
    }

    /**
     * Initialize FHE instance with proper configuration
     */
    async init(provider) {
        try {
            if (typeof fhevmjs === 'undefined') {
                throw new Error('fhevmjs library not loaded');
            }

            // Get network information
            const network = await provider.getNetwork();
            const chainId = network.chainId;

            // Create FHE instance
            this.fhevmInstance = await fhevmjs.createInstance({
                chainId: chainId,
                publicKey: await this.getPublicKey(provider),
                gatewayUrl: this.getGatewayUrl(chainId),
            });

            this.initialized = true;
            console.log('FHE instance initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize FHE:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Get FHE public key from the network
     */
    async getPublicKey(provider) {
        try {
            // For Sepolia testnet, use Zama's public key
            // For local development, this would be different
            const network = await provider.getNetwork();

            if (network.chainId === 11155111) { // Sepolia
                // Fetch from Zama's gateway
                const response = await fetch('https://gateway.sepolia.zama.ai/v1/public-key');
                const data = await response.json();
                return data.publicKey;
            } else {
                // For local testing, return a default key or fetch from local gateway
                console.warn('Using local development mode - public key may not be available');
                return null;
            }
        } catch (error) {
            console.error('Failed to get public key:', error);
            return null;
        }
    }

    /**
     * Get gateway URL based on network
     */
    getGatewayUrl(chainId) {
        const gatewayUrls = {
            11155111: 'https://gateway.sepolia.zama.ai', // Sepolia
            31337: 'http://localhost:8545', // Local
        };
        return gatewayUrls[chainId] || gatewayUrls[11155111];
    }

    /**
     * Encrypt a uint32 value
     */
    async encryptUint32(value) {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }

        try {
            const encrypted = await this.fhevmInstance.encrypt32(BigInt(value));
            return encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    /**
     * Encrypt a uint8 value
     */
    async encryptUint8(value) {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }

        try {
            const encrypted = await this.fhevmInstance.encrypt8(BigInt(value));
            return encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    /**
     * Generate encrypted input for contract
     */
    async generateEncryptedInput(contractAddress, userAddress) {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }

        try {
            const input = this.fhevmInstance.createEncryptedInput(
                contractAddress,
                userAddress
            );
            return input;
        } catch (error) {
            console.error('Failed to create encrypted input:', error);
            throw error;
        }
    }

    /**
     * Request decryption from gateway
     */
    async requestDecryption(ciphertext, contractAddress) {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }

        try {
            // This would interact with the TaxiGateway contract
            // to request decryption through the Zama gateway
            const decrypted = await this.fhevmInstance.decrypt(
                contractAddress,
                ciphertext
            );
            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            throw error;
        }
    }

    /**
     * Generate input proof for ZK verification
     */
    async generateInputProof(input) {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }

        try {
            const proof = await input.generateProof();
            return proof;
        } catch (error) {
            console.error('Failed to generate proof:', error);
            throw error;
        }
    }

    /**
     * Convert coordinates to encrypted format
     * Coordinates are multiplied by 1000000 to preserve precision
     */
    coordinateToUint32(coordinate) {
        // Convert decimal coordinate to scaled integer
        // e.g., 40.758896 -> 40758896
        const scaled = Math.round(Math.abs(coordinate) * 1000000);
        return scaled;
    }

    /**
     * Convert uint32 back to coordinate
     */
    uint32ToCoordinate(value) {
        return value / 1000000;
    }

    /**
     * Create ACL (Access Control List) permissions
     */
    async grantAccess(contractAddress, ciphertext, addresses) {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }

        try {
            // Grant access to specified addresses for the ciphertext
            for (const address of addresses) {
                await this.fhevmInstance.allow(ciphertext, address);
            }
            console.log('Access granted to:', addresses);
        } catch (error) {
            console.error('Failed to grant access:', error);
            throw error;
        }
    }

    /**
     * Check if FHE is properly initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get FHE instance
     */
    getInstance() {
        if (!this.initialized) {
            throw new Error('FHE not initialized. Call init() first.');
        }
        return this.fhevmInstance;
    }
}

// Export for use in main app
window.FHEUtils = FHEUtils;
