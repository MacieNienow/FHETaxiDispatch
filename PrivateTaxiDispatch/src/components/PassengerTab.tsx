import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, COORDINATE_SCALE } from '../config';

export default function PassengerTab() {
  const { isConnected } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt('euint32');
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [pickupLat, setPickupLat] = useState('40.7589');
  const [pickupLng, setPickupLng] = useState('-73.9851');
  const [destLat, setDestLat] = useState('40.7614');
  const [destLng, setDestLng] = useState('-73.9776');
  const [maxFare, setMaxFare] = useState('50');
  const [message, setMessage] = useState('');

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleRequestRide = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    try {
      // Convert all values to integers
      const pickupLatInt = Math.floor(parseFloat(pickupLat) * COORDINATE_SCALE);
      const pickupLngInt = Math.floor(parseFloat(pickupLng) * COORDINATE_SCALE);
      const destLatInt = Math.floor(parseFloat(destLat) * COORDINATE_SCALE);
      const destLngInt = Math.floor(parseFloat(destLng) * COORDINATE_SCALE);
      const maxFareInt = Math.floor(parseFloat(maxFare) * 100); // Cents

      // Encrypt all ride request data using @fhevm/sdk
      const [encPickupLat, encPickupLng, encDestLat, encDestLng, encMaxFare] = await Promise.all([
        encrypt(pickupLatInt),
        encrypt(pickupLngInt),
        encrypt(destLatInt),
        encrypt(destLngInt),
        encrypt(maxFareInt),
      ]);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestRide',
        args: [
          encPickupLat.data,
          encPickupLng.data,
          encDestLat.data,
          encDestLng.data,
          encMaxFare.data,
        ],
      });

      showMessage('Ride request submitted with encrypted data!');
    } catch (error: any) {
      showMessage(`Failed to request ride: ${error.message}`, 'error');
    }
  };

  const isProcessing = isPending || isConfirming || isEncrypting;

  return (
    <div className="card">
      <h2>Request a Ride</h2>
      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      <p>Submit a ride request with encrypted pickup and destination coordinates</p>

      <h3>Pickup Location</h3>
      <div className="form-group">
        <label>Latitude:</label>
        <input
          type="number"
          step="0.0001"
          value={pickupLat}
          onChange={(e) => setPickupLat(e.target.value)}
          placeholder="40.7589"
        />
      </div>
      <div className="form-group">
        <label>Longitude:</label>
        <input
          type="number"
          step="0.0001"
          value={pickupLng}
          onChange={(e) => setPickupLng(e.target.value)}
          placeholder="-73.9851"
        />
      </div>

      <h3>Destination Location</h3>
      <div className="form-group">
        <label>Latitude:</label>
        <input
          type="number"
          step="0.0001"
          value={destLat}
          onChange={(e) => setDestLat(e.target.value)}
          placeholder="40.7614"
        />
      </div>
      <div className="form-group">
        <label>Longitude:</label>
        <input
          type="number"
          step="0.0001"
          value={destLng}
          onChange={(e) => setDestLng(e.target.value)}
          placeholder="-73.9776"
        />
      </div>

      <div className="form-group">
        <label>Maximum Fare ($):</label>
        <input
          type="number"
          step="0.01"
          value={maxFare}
          onChange={(e) => setMaxFare(e.target.value)}
          placeholder="50.00"
        />
      </div>

      <button
        onClick={handleRequestRide}
        disabled={!isConnected || isProcessing}
        className="button-primary"
      >
        {isEncrypting ? 'Encrypting Ride Data...' : isPending || isConfirming ? 'Processing...' : 'Request Ride'}
      </button>

      {isEncrypting && (
        <div className="message info" style={{ marginTop: '15px' }}>
          Encrypting 5 values (pickup, destination, and fare) using FHE...
        </div>
      )}
    </div>
  );
}
