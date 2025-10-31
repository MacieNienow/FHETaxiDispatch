import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

export default function InfoTab() {
  const { address, isConnected } = useAccount();
  const [queryAddress, setQueryAddress] = useState('');

  // Read system stats
  const { data: systemStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSystemStats',
  });

  // Read driver info
  const { data: driverInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getDriverInfo',
    args: [queryAddress || address || '0x0000000000000000000000000000000000000000'],
  });

  // Read passenger history
  const { data: passengerHistory } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPassengerHistory',
    args: [queryAddress || address || '0x0000000000000000000000000000000000000000'],
  });

  // Read driver history
  const { data: driverHistory } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getDriverHistory',
    args: [queryAddress || address || '0x0000000000000000000000000000000000000000'],
  });

  return (
    <div>
      <div className="card">
        <h2>System Statistics</h2>
        {systemStats && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{systemStats[0]?.toString() || '0'}</div>
              <div className="stat-label">Total Ride Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats[1]?.toString() || '0'}</div>
              <div className="stat-label">Total Drivers</div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Query User Information</h2>
        <div className="form-group">
          <label>Address (leave empty for your own):</label>
          <input
            type="text"
            value={queryAddress}
            onChange={(e) => setQueryAddress(e.target.value)}
            placeholder={address || '0x...'}
          />
        </div>

        <h3>Driver Information</h3>
        {driverInfo && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Registered:</strong> {driverInfo[0] ? 'Yes' : 'No'}</p>
            <p><strong>Available:</strong> {driverInfo[1] ? 'Yes' : 'No'}</p>
            <p><strong>Total Rides:</strong> {driverInfo[2]?.toString() || '0'}</p>
            <p><strong>Rating:</strong> {driverInfo[3]?.toString() || '0'}/5</p>
          </div>
        )}

        <h3 style={{ marginTop: '20px' }}>Ride History</h3>
        {passengerHistory && passengerHistory.length > 0 ? (
          <div>
            <p><strong>As Passenger:</strong></p>
            <ul className="history-list">
              {passengerHistory.map((requestId: any, index: number) => (
                <li key={index} className="history-item">
                  Request ID: {requestId.toString()}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No passenger history</p>
        )}

        {driverHistory && driverHistory.length > 0 ? (
          <div>
            <p><strong>As Driver:</strong></p>
            <ul className="history-list">
              {driverHistory.map((requestId: any, index: number) => (
                <li key={index} className="history-item">
                  Request ID: {requestId.toString()}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No driver history</p>
        )}
      </div>
    </div>
  );
}
