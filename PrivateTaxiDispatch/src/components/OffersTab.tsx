import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

export default function OffersTab() {
  const { isConnected } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt('euint32');
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [requestId, setRequestId] = useState('');
  const [proposedFare, setProposedFare] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [acceptRequestId, setAcceptRequestId] = useState('');
  const [offerIndex, setOfferIndex] = useState('0');
  const [message, setMessage] = useState('');

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmitOffer = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!requestId || !proposedFare || !estimatedTime) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      const fareInt = Math.floor(parseFloat(proposedFare) * 100); // Convert to cents
      const timeInt = parseInt(estimatedTime); // Minutes

      // Encrypt offer data using @fhevm/sdk
      const [encFare, encTime] = await Promise.all([
        encrypt(fareInt),
        encrypt(timeInt),
      ]);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitOffer',
        args: [parseInt(requestId), encFare.data, encTime.data],
      });

      showMessage('Offer submitted with encrypted fare and time!');
    } catch (error: any) {
      showMessage(`Failed to submit offer: ${error.message}`, 'error');
    }
  };

  const handleAcceptOffer = async () => {
    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    if (!acceptRequestId || !offerIndex) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'acceptOffer',
        args: [parseInt(acceptRequestId), BigInt(offerIndex)],
      });

      showMessage('Offer accepted!');
    } catch (error: any) {
      showMessage(`Failed to accept offer: ${error.message}`, 'error');
    }
  };

  const isProcessing = isPending || isConfirming || isEncrypting;

  return (
    <div className="grid">
      <div className="card">
        <h2>Submit Offer (Driver)</h2>
        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        <p>Submit an encrypted offer for a ride request</p>

        <div className="form-group">
          <label>Request ID:</label>
          <input
            type="number"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Proposed Fare ($):</label>
          <input
            type="number"
            step="0.01"
            value={proposedFare}
            onChange={(e) => setProposedFare(e.target.value)}
            placeholder="25.00"
          />
        </div>

        <div className="form-group">
          <label>Estimated Time (minutes):</label>
          <input
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="15"
          />
        </div>

        <button
          onClick={handleSubmitOffer}
          disabled={!isConnected || isProcessing}
          className="button-primary"
        >
          {isEncrypting ? 'Encrypting Offer...' : isPending || isConfirming ? 'Processing...' : 'Submit Offer'}
        </button>
      </div>

      <div className="card">
        <h2>Accept Offer (Passenger)</h2>
        <p>Accept a driver's offer for your ride request</p>

        <div className="form-group">
          <label>Request ID:</label>
          <input
            type="number"
            value={acceptRequestId}
            onChange={(e) => setAcceptRequestId(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Offer Index:</label>
          <input
            type="number"
            value={offerIndex}
            onChange={(e) => setOfferIndex(e.target.value)}
            placeholder="0"
          />
        </div>

        <button
          onClick={handleAcceptOffer}
          disabled={!isConnected || isProcessing}
          className="button-primary"
        >
          {isPending || isConfirming ? 'Processing...' : 'Accept Offer'}
        </button>
      </div>
    </div>
  );
}
