import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

export default function ManagementTab() {
  const { isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [completeRequestId, setCompleteRequestId] = useState('');
  const [rating, setRating] = useState('5');
  const [cancelRequestId, setCancelRequestId] = useState('');
  const [message, setMessage] = useState('');

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCompleteRide = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!completeRequestId || !rating) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'completeRide',
        args: [parseInt(completeRequestId), parseInt(rating)],
      });

      showMessage('Ride completed!');
    } catch (error: any) {
      showMessage(`Failed to complete ride: ${error.message}`, 'error');
    }
  };

  const handleCancelRequest = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!cancelRequestId) {
      showMessage('Please enter a request ID', 'error');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelRequest',
        args: [parseInt(cancelRequestId)],
      });

      showMessage('Request cancelled!');
    } catch (error: any) {
      showMessage(`Failed to cancel request: ${error.message}`, 'error');
    }
  };

  const isProcessing = isPending || isConfirming;

  return (
    <div className="grid">
      <div className="card">
        <h2>Complete Ride</h2>
        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        <p>Mark a ride as completed and rate the driver</p>

        <div className="form-group">
          <label>Request ID:</label>
          <input
            type="number"
            value={completeRequestId}
            onChange={(e) => setCompleteRequestId(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Driver Rating (1-5):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="5"
          />
        </div>

        <button
          onClick={handleCompleteRide}
          disabled={!isConnected || isProcessing}
          className="button-primary"
        >
          {isProcessing ? 'Processing...' : 'Complete Ride'}
        </button>
      </div>

      <div className="card">
        <h2>Cancel Request</h2>
        <p>Cancel a ride request before it's matched</p>

        <div className="form-group">
          <label>Request ID:</label>
          <input
            type="number"
            value={cancelRequestId}
            onChange={(e) => setCancelRequestId(e.target.value)}
            placeholder="0"
          />
        </div>

        <button
          onClick={handleCancelRequest}
          disabled={!isConnected || isProcessing}
          className="button-primary"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
        >
          {isProcessing ? 'Processing...' : 'Cancel Request'}
        </button>
      </div>
    </div>
  );
}
