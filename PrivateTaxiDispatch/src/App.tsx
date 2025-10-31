import { useState } from 'react';
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi-config';
import { CONTRACT_ADDRESS, CONTRACT_ABI, FHEVM_CONFIG, COORDINATE_SCALE } from './config';
import { TabType } from './types';
import DriverTab from './components/DriverTab';
import PassengerTab from './components/PassengerTab';
import OffersTab from './components/OffersTab';
import ManagementTab from './components/ManagementTab';
import InfoTab from './components/InfoTab';
import StatusTab from './components/StatusTab';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isReady } = useFhevm(FHEVM_CONFIG);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'status', label: 'Status' },
    { id: 'driver', label: 'Driver' },
    { id: 'passenger', label: 'Passenger' },
    { id: 'offers', label: 'Offers' },
    { id: 'management', label: 'Management' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Private Taxi Dispatch</h1>
        <p className="subtitle">Secure & Private Ride Sharing with FHE</p>

        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : ''}`} />
          <span>{isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}</span>
          {!isConnected ? (
            <button onClick={handleConnect} className="connect-button">
              Connect Wallet
            </button>
          ) : (
            <button onClick={() => disconnect()} className="disconnect-button">
              Disconnect
            </button>
          )}
        </div>

        {isReady && (
          <div className="fhevm-status">
            <span className="status-badge">FHEVM Ready</span>
          </div>
        )}
      </header>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="app-main">
        {activeTab === 'status' && <StatusTab />}
        {activeTab === 'driver' && <DriverTab />}
        {activeTab === 'passenger' && <PassengerTab />}
        {activeTab === 'offers' && <OffersTab />}
        {activeTab === 'management' && <ManagementTab />}
        {activeTab === 'info' && <InfoTab />}
      </main>

      <footer className="app-footer">
        <p>Contract: {CONTRACT_ADDRESS}</p>
        <p>Powered by FHEVM & Zama</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
