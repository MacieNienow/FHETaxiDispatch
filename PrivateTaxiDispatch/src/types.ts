export interface DriverInfo {
  registered: boolean;
  available: boolean;
  totalRides: number;
  rating: number;
}

export interface RideRequestInfo {
  passenger: string;
  driver: string;
  isActive: boolean;
  isCompleted: boolean;
  offerCount: number;
  acceptedOfferIndex: number;
}

export interface SystemStats {
  totalRequests: number;
  totalDrivers: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface RideRequest extends Location {
  destination: Location;
  maxFare: number;
}

export interface RideOffer {
  requestId: number;
  proposedFare: number;
  estimatedTime: number;
}

export type TabType = 'driver' | 'passenger' | 'offers' | 'management' | 'info' | 'status';
