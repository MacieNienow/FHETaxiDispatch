import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, COORDINATE_SCALE } from '../config';

export default function DriverTab() {
  const { address, isConnected } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt('euint32');
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [latitude, setLatitude] = useState('40.7128');
  const [longitude, setLongitude] = useState('-74.0060');
  const [message, setMessage] = useState('');

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleRegisterDriver = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerDriver',
      });
      showMessage('Driver registration submitted!');
    } catch (error: any) {
      showMessage(`Failed to register: ${error.message}`, 'error');
    }
  };

  const handleUpdateLocation = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    try {
      // Convert coordinates to integers (multiply by COORDINATE_SCALE for precision)
      const latInt = Math.floor(parseFloat(latitude) * COORDINATE_SCALE);
      const lonInt = Math.floor(parseFloat(longitude) * COORDINATE_SCALE);

      // Encrypt coordinates using @fhevm/sdk
      const [encLat, encLon] = await Promise.all([
        encrypt(latInt),
        encrypt(lonInt),
      ]);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'updateLocation',
        args: [encLat.data, encLon.data],
      });

      showMessage('Location update submitted!');
    } catch (error: any) {
      showMessage(`Failed to update location: ${error.message}`, 'error');
    }
  };

  const handleSetAvailability = async (available: boolean) => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'setAvailability',
        args: [available],
      });
      showMessage(`Availability set to ${available ? 'available' : 'unavailable'}!`);
    } catch (error: any) {
      showMessage(`Failed to set availability: ${error.message}`, 'error');
    }
  };

  const isProcessing = isPending || isConfirming || isEncrypting;

  return (
    <div className="grid">
      <div className="card">
        <h2>Driver Registration</h2>
        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        <p>Register yourself as a driver on the platform. You'll start with a neutral rating.</p>
        <button
          onClick={handleRegisterDriver}
          disabled={!isConnected || isProcessing}
          className="button-primary"
        >
          {isProcessing ? 'Processing...' : 'Register as Driver'}
        </button>
      </div>

      <div className="card">
        <h2>Update Location</h2>
        <p>Update your encrypted location (GPS coordinates are kept private using FHE)</p>
        <div className="form-group">
          <label>Latitude:</label>
          <input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="40.7128"
          />
        </div>
        <div className="form-group">
          <label>Longitude:</label>
          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-74.0060"
          />
        </div>
        <button
          onClick={handleUpdateLocation}
          disabled={!isConnected || isProcessing}
          className="button-primary"
        >
          {isEncrypting ? 'Encrypting...' : isPending || isConfirming ? 'Processing...' : 'Update Location'}
        </button>
      </div>

      <div className="card">
        <h2>Set Availability</h2>
        <p>Set whether you're available to accept ride requests</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={() => handleSetAvailability(true)}
            disabled={!isConnected || isProcessing}
            className="button-primary"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Set Available
          </button>
          <button
            onClick={() => handleSetAvailability(false)}
            disabled={!isConnected || isProcessing}
            className="button-primary"
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            Set Unavailable
          </button>
        </div>
      </div>
    </div>
  );
}
