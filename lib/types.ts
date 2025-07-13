export interface DriverInfo {
  isRegistered: boolean;
  isAvailable: boolean;
  totalRides: bigint;
  registrationTime: bigint;
}

export interface RideRequest {
  requestId: number;
  passenger: string;
  assignedDriver: string;
  isCompleted: boolean;
  isCancelled: boolean;
  requestTime: bigint;
  offerCount: bigint;
}

export interface SystemStats {
  totalRequests: number;
  totalDrivers: number;
}

export interface TransactionHistory {
  hash: string;
  type: 'driver_registration' | 'location_update' | 'ride_request' | 'offer_submitted' | 'ride_matched' | 'ride_completed' | 'ride_cancelled';
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to?: string;
  value?: string;
  gasUsed?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export type UserRole = 'driver' | 'passenger' | null;
