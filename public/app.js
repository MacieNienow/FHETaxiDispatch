// Private Taxi Dispatch DApp
class TaxiDispatchApp {
    constructor() {
        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            console.error('Ethers.js not loaded');
            this.showMessage('Error: Ethers.js library failed to load. Please refresh the page.', 'error');
            return;
        }

        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = null;

        // Contract configuration - Update with your deployed contract address
        this.contractAddress = "0xd3cc141c38dac488bc1875140e538f0facee7b26"; // Updated contract address
        this.contractABI = [
            "function registerDriver()",
            "function updateLocation(uint32 _latitude, uint32 _longitude)",
            "function setAvailability(bool _available)",
            "function requestRide(uint32 _pickupLat, uint32 _pickupLng, uint32 _destLat, uint32 _destLng, uint32 _maxFare)",
            "function submitOffer(uint32 _requestId, uint32 _proposedFare, uint32 _estimatedTime)",
            "function acceptOffer(uint32 _requestId, uint256 _offerIndex)",
            "function completeRide(uint32 _requestId, uint8 _passengerRating)",
            "function cancelRequest(uint32 _requestId)",
            "function getRequestInfo(uint32 _requestId) view returns (address, address, bool, bool, uint256, uint256)",
            "function getDriverInfo(address _driver) view returns (bool, bool, uint256, uint256)",
            "function getPassengerHistory(address _passenger) view returns (uint32[])",
            "function getDriverHistory(address _driver) view returns (uint32[])",
            "function getSystemStats() view returns (uint32, uint32)",
            "event DriverRegistered(address indexed driver, uint256 timestamp)",
            "event LocationUpdated(address indexed driver)",
            "event RideRequested(uint32 indexed requestId, address indexed passenger)",
            "event OfferSubmitted(uint32 indexed requestId, address indexed driver)",
            "event RideMatched(uint32 indexed requestId, address indexed driver, address indexed passenger)",
            "event RideCompleted(uint32 indexed requestId, address indexed driver, address indexed passenger)",
            "event RideCancelled(uint32 indexed requestId, address indexed passenger)"
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateConnectionStatus();
        this.updateContractAddress();

        // Check if wallet is already connected
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        this.connectWallet();
                    }
                });
        }
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());

        // Driver functions
        document.getElementById('registerDriver').addEventListener('click', () => this.registerDriver());
        document.getElementById('updateLocation').addEventListener('click', () => this.updateLocation());
        document.getElementById('setAvailability').addEventListener('click', () => this.setAvailability());

        // Passenger functions
        document.getElementById('requestRide').addEventListener('click', () => this.requestRide());

        // Offer functions
        document.getElementById('submitOffer').addEventListener('click', () => this.submitOffer());
        document.getElementById('viewOffers').addEventListener('click', () => this.viewOffers());

        // Ride management
        document.getElementById('completeRide').addEventListener('click', () => this.completeRide());

        // Information functions
        document.getElementById('refreshStats').addEventListener('click', () => this.loadSystemStats());
        document.getElementById('loadPassengerHistory').addEventListener('click', () => this.loadPassengerHistory());
        document.getElementById('loadDriverHistory').addEventListener('click', () => this.loadDriverHistory());

        // Availability toggle
        document.getElementById('availabilityToggle').addEventListener('change', () => this.setAvailability());
    }

    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to use this application');
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.account = await this.signer.getAddress();

            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);

            this.updateConnectionStatus();
            this.updateCurrentAccount();
            this.loadSystemStats();
            this.setupContractEventListeners();

            this.showMessage('Wallet connected successfully!', 'success');

        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showMessage(`Failed to connect wallet: ${error.message}`, 'error');
        }
    }

    updateConnectionStatus() {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        const button = document.getElementById('connectWallet');

        if (this.account) {
            indicator.classList.add('connected');
            text.textContent = 'Connected';
            button.textContent = 'Connected';
            button.disabled = true;
        } else {
            indicator.classList.remove('connected');
            text.textContent = 'Not Connected';
            button.textContent = 'Connect Wallet';
            button.disabled = false;
        }
    }

    updateCurrentAccount() {
        document.getElementById('currentAccount').textContent = this.account || 'Not connected';
    }

    updateContractAddress() {
        document.getElementById('contractAddress').textContent = this.contractAddress;
    }

    setupContractEventListeners() {
        if (!this.contract) return;

        this.contract.on('DriverRegistered', (driver, timestamp) => {
            if (driver.toLowerCase() === this.account.toLowerCase()) {
                this.showMessage('Successfully registered as driver!', 'success');
            }
        });

        this.contract.on('RideRequested', (requestId, passenger) => {
            if (passenger.toLowerCase() === this.account.toLowerCase()) {
                this.showMessage(`Ride request submitted! Request ID: ${requestId}`, 'success');
            }
        });

        this.contract.on('OfferSubmitted', (requestId, driver) => {
            if (driver.toLowerCase() === this.account.toLowerCase()) {
                this.showMessage(`Offer submitted for request ${requestId}!`, 'success');
            }
        });

        this.contract.on('RideMatched', (requestId, driver, passenger) => {
            if (driver.toLowerCase() === this.account.toLowerCase()) {
                this.showMessage(`Ride matched! You've been assigned request ${requestId}`, 'success');
            } else if (passenger.toLowerCase() === this.account.toLowerCase()) {
                this.showMessage(`Ride matched! Driver assigned to your request ${requestId}`, 'success');
            }
        });

        this.contract.on('RideCompleted', (requestId, driver, passenger) => {
            if (driver.toLowerCase() === this.account.toLowerCase() ||
                passenger.toLowerCase() === this.account.toLowerCase()) {
                this.showMessage(`Ride ${requestId} completed successfully!`, 'success');
            }
        });
    }

    async registerDriver() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const tx = await this.contract.registerDriver();
            this.showMessage('Transaction submitted. Waiting for confirmation...', 'success');

            await tx.wait();
            this.showMessage('Successfully registered as driver!', 'success');

        } catch (error) {
            console.error('Error registering driver:', error);
            this.showMessage(`Failed to register: ${error.message}`, 'error');
        }
    }

    async updateLocation() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const lat = document.getElementById('driverLat').value;
            const lng = document.getElementById('driverLng').value;

            if (!lat || !lng) {
                throw new Error('Please enter both latitude and longitude');
            }

            // Convert coordinates to scaled integers (multiply by 10000 to preserve 4 decimal places)
            const scaledLat = Math.floor(parseFloat(lat) * 10000);
            const scaledLng = Math.floor(parseFloat(lng) * 10000);

            const tx = await this.contract.updateLocation(scaledLat, scaledLng);
            this.showMessage('Updating location...', 'success');

            await tx.wait();
            this.showMessage('Location updated successfully!', 'success');

        } catch (error) {
            console.error('Error updating location:', error);
            this.showMessage(`Failed to update location: ${error.message}`, 'error');
        }
    }

    async setAvailability() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const available = document.getElementById('availabilityToggle').checked;

            const tx = await this.contract.setAvailability(available);
            this.showMessage('Updating availability...', 'success');

            await tx.wait();
            this.showMessage(`Availability set to: ${available ? 'Available' : 'Unavailable'}`, 'success');

        } catch (error) {
            console.error('Error setting availability:', error);
            this.showMessage(`Failed to update availability: ${error.message}`, 'error');
        }
    }

    async requestRide() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const pickupLat = document.getElementById('pickupLat').value;
            const pickupLng = document.getElementById('pickupLng').value;
            const destLat = document.getElementById('destLat').value;
            const destLng = document.getElementById('destLng').value;
            const maxFare = document.getElementById('maxFare').value;

            if (!pickupLat || !pickupLng || !destLat || !destLng || !maxFare) {
                throw new Error('Please fill in all ride details');
            }

            // Convert coordinates to scaled integers
            const scaledPickupLat = Math.floor(parseFloat(pickupLat) * 10000);
            const scaledPickupLng = Math.floor(parseFloat(pickupLng) * 10000);
            const scaledDestLat = Math.floor(parseFloat(destLat) * 10000);
            const scaledDestLng = Math.floor(parseFloat(destLng) * 10000);

            // Convert fare to wei
            const maxFareWei = ethers.utils.parseEther(maxFare);
            const scaledMaxFare = Math.floor(parseFloat(maxFare) * 10000);

            const tx = await this.contract.requestRide(
                scaledPickupLat,
                scaledPickupLng,
                scaledDestLat,
                scaledDestLng,
                scaledMaxFare
            );

            this.showMessage('Submitting ride request...', 'success');
            await tx.wait();
            this.showMessage('Ride request submitted successfully!', 'success');

            // Clear form
            document.getElementById('pickupLat').value = '';
            document.getElementById('pickupLng').value = '';
            document.getElementById('destLat').value = '';
            document.getElementById('destLng').value = '';
            document.getElementById('maxFare').value = '';

        } catch (error) {
            console.error('Error requesting ride:', error);
            this.showMessage(`Failed to request ride: ${error.message}`, 'error');
        }
    }

    async submitOffer() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const requestId = document.getElementById('requestIdOffer').value;
            const proposedFare = document.getElementById('proposedFare').value;
            const estimatedTime = document.getElementById('estimatedTime').value;

            if (!requestId || !proposedFare || !estimatedTime) {
                throw new Error('Please fill in all offer details');
            }

            const scaledFare = Math.floor(parseFloat(proposedFare) * 10000);

            const tx = await this.contract.submitOffer(
                parseInt(requestId),
                scaledFare,
                parseInt(estimatedTime)
            );

            this.showMessage('Submitting offer...', 'success');
            await tx.wait();
            this.showMessage('Offer submitted successfully!', 'success');

            // Clear form
            document.getElementById('requestIdOffer').value = '';
            document.getElementById('proposedFare').value = '';
            document.getElementById('estimatedTime').value = '';

        } catch (error) {
            console.error('Error submitting offer:', error);
            this.showMessage(`Failed to submit offer: ${error.message}`, 'error');
        }
    }

    async viewOffers() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const requestId = document.getElementById('requestIdOffers').value;
            if (!requestId) {
                throw new Error('Please enter a request ID');
            }

            const requestInfo = await this.contract.getRequestInfo(parseInt(requestId));
            const [passenger, assignedDriver, isCompleted, isCancelled, requestTime, offerCount] = requestInfo;

            const offersContainer = document.getElementById('offersList');
            offersContainer.innerHTML = '';

            if (passenger.toLowerCase() !== this.account.toLowerCase()) {
                throw new Error('You can only view offers for your own requests');
            }

            if (offerCount.toNumber() === 0) {
                offersContainer.innerHTML = '<p>No offers received yet.</p>';
                return;
            }

            offersContainer.innerHTML = `
                <h4>Offers for Request #${requestId}</h4>
                <p>Total offers: ${offerCount.toNumber()}</p>
                <p><em>Note: Offer details are encrypted. Drivers will need to provide decryption keys off-chain.</em></p>
                <div class="offer-item">
                    <div class="offer-details">
                        <p><strong>Status:</strong> ${isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : assignedDriver !== ethers.constants.AddressZero ? 'Assigned' : 'Open'}</p>
                        <p><strong>Assigned Driver:</strong> ${assignedDriver !== ethers.constants.AddressZero ? assignedDriver : 'None'}</p>
                        <p><strong>Request Time:</strong> ${new Date(requestTime.toNumber() * 1000).toLocaleString()}</p>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error viewing offers:', error);
            this.showMessage(`Failed to view offers: ${error.message}`, 'error');
        }
    }

    async completeRide() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const requestId = document.getElementById('completeRequestId').value;
            const rating = document.getElementById('passengerRating').value;

            if (!requestId || !rating) {
                throw new Error('Please enter request ID and rating');
            }

            if (rating < 0 || rating > 100) {
                throw new Error('Rating must be between 0 and 100');
            }

            const tx = await this.contract.completeRide(parseInt(requestId), parseInt(rating));
            this.showMessage('Completing ride...', 'success');

            await tx.wait();
            this.showMessage('Ride completed successfully!', 'success');

            // Clear form
            document.getElementById('completeRequestId').value = '';
            document.getElementById('passengerRating').value = '';

        } catch (error) {
            console.error('Error completing ride:', error);
            this.showMessage(`Failed to complete ride: ${error.message}`, 'error');
        }
    }

    async loadSystemStats() {
        try {
            if (!this.contract) return;

            const stats = await this.contract.getSystemStats();
            const [totalRequests, totalDrivers] = stats;

            document.getElementById('totalRequests').textContent = totalRequests.toString();
            document.getElementById('totalDrivers').textContent = totalDrivers.toString();

        } catch (error) {
            console.error('Error loading system stats:', error);
            this.showMessage(`Failed to load statistics: ${error.message}`, 'error');
        }
    }

    async loadPassengerHistory() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const history = await this.contract.getPassengerHistory(this.account);
            const container = document.getElementById('passengerHistoryList');

            if (history.length === 0) {
                container.innerHTML = '<p>No passenger history found.</p>';
                return;
            }

            let historyHTML = '<h4>Your Passenger History</h4>';
            for (let requestId of history) {
                try {
                    const requestInfo = await this.contract.getRequestInfo(requestId);
                    const [passenger, assignedDriver, isCompleted, isCancelled, requestTime, offerCount] = requestInfo;

                    historyHTML += `
                        <div class="history-item">
                            <h4>Request #${requestId.toString()}</h4>
                            <p><strong>Status:</strong> ${isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Active'}</p>
                            <p><strong>Driver:</strong> ${assignedDriver !== ethers.constants.AddressZero ? assignedDriver : 'Not assigned'}</p>
                            <p><strong>Request Time:</strong> ${new Date(requestTime.toNumber() * 1000).toLocaleString()}</p>
                            <p><strong>Offers Received:</strong> ${offerCount.toString()}</p>
                        </div>
                    `;
                } catch (err) {
                    console.error(`Error loading request ${requestId}:`, err);
                }
            }

            container.innerHTML = historyHTML;

        } catch (error) {
            console.error('Error loading passenger history:', error);
            this.showMessage(`Failed to load passenger history: ${error.message}`, 'error');
        }
    }

    async loadDriverHistory() {
        try {
            if (!this.contract) throw new Error('Please connect your wallet first');

            const history = await this.contract.getDriverHistory(this.account);
            const container = document.getElementById('driverHistoryList');

            if (history.length === 0) {
                container.innerHTML = '<p>No driver history found.</p>';
                return;
            }

            let historyHTML = '<h4>Your Driver History</h4>';
            for (let requestId of history) {
                try {
                    const requestInfo = await this.contract.getRequestInfo(requestId);
                    const [passenger, assignedDriver, isCompleted, isCancelled, requestTime, offerCount] = requestInfo;

                    historyHTML += `
                        <div class="history-item">
                            <h4>Request #${requestId.toString()}</h4>
                            <p><strong>Passenger:</strong> ${passenger}</p>
                            <p><strong>Status:</strong> ${isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Active'}</p>
                            <p><strong>Request Time:</strong> ${new Date(requestTime.toNumber() * 1000).toLocaleString()}</p>
                        </div>
                    `;
                } catch (err) {
                    console.error(`Error loading request ${requestId}:`, err);
                }
            }

            container.innerHTML = historyHTML;

        } catch (error) {
            console.error('Error loading driver history:', error);
            this.showMessage(`Failed to load driver history: ${error.message}`, 'error');
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error, .success');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;

        // Add to first card - with safety check
        const firstCard = document.querySelector('.card');
        if (firstCard) {
            firstCard.appendChild(messageDiv);
        } else {
            // Fallback: add to body if card not found
            console.warn('No .card element found, adding message to body');
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#ef4444' : '#10b981'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 1000;
                max-width: 90%;
            `;
            document.body.appendChild(messageDiv);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Tab switching functionality
function switchTab(tabName, event) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    if (event && event.target) {
        event.target.classList.add('active');
    }
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taxiApp = new TaxiDispatchApp();
});

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload();
        } else {
            location.reload();
        }
    });

    window.ethereum.on('chainChanged', () => {
        location.reload();
    });
}