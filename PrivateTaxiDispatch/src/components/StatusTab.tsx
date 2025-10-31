import { useFhevm } from '@fhevm/sdk/react';
import { useAccount } from 'wagmi';
import { FHEVM_CONFIG, CONTRACT_ADDRESS } from '../config';

export default function StatusTab() {
  const { address, isConnected, chain } = useAccount();
  const { isReady, error } = useFhevm(FHEVM_CONFIG);

  return (
    <div className="card">
      <h2>Application Status</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Wallet Connection</div>
          <div className="stat-value" style={{ fontSize: '1.5em' }}>
            {isConnected ? '✓' : '✗'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">FHEVM Status</div>
          <div className="stat-value" style={{ fontSize: '1.5em' }}>
            {isReady ? '✓' : '⌛'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Network</div>
          <div className="stat-value" style={{ fontSize: '1em' }}>
            {chain?.name || 'Not Connected'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Chain ID</div>
          <div className="stat-value" style={{ fontSize: '1.5em' }}>
            {chain?.id || '-'}
          </div>
        </div>
      </div>

      {isConnected && (
        <div style={{ marginTop: '30px' }}>
          <h3>Connected Account</h3>
          <p style={{ wordBreak: 'break-all', background: '#f3f4f6', padding: '15px', borderRadius: '8px', fontFamily: 'monospace' }}>
            {address}
          </p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Contract Information</h3>
        <p><strong>Contract Address:</strong></p>
        <p style={{ wordBreak: 'break-all', background: '#f3f4f6', padding: '15px', borderRadius: '8px', fontFamily: 'monospace' }}>
          {CONTRACT_ADDRESS}
        </p>
        <p style={{ marginTop: '15px' }}><strong>Gateway Address:</strong></p>
        <p style={{ wordBreak: 'break-all', background: '#f3f4f6', padding: '15px', borderRadius: '8px', fontFamily: 'monospace' }}>
          {FHEVM_CONFIG.gatewayAddress}
        </p>
      </div>

      {error && (
        <div className="message error" style={{ marginTop: '20px' }}>
          <strong>FHEVM Error:</strong> {error.message}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>About This Application</h3>
        <p style={{ lineHeight: '1.8' }}>
          This is a privacy-preserving ride-sharing platform built with Fully Homomorphic Encryption (FHE).
          All sensitive data including GPS coordinates, fares, and ratings are encrypted on-chain using the
          <strong> @fhevm/sdk</strong>.
        </p>
        <ul style={{ marginTop: '15px', lineHeight: '1.8' }}>
          <li>Driver locations remain private</li>
          <li>Passenger pickup/destination coordinates are encrypted</li>
          <li>Fare negotiations through encrypted offers</li>
          <li>Anonymous rating system</li>
          <li>Zero-knowledge matching between drivers and passengers</li>
        </ul>
      </div>
    </div>
  );
}
