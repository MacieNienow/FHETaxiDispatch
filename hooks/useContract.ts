import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, PRIVATE_TAXI_DISPATCH_ABI } from '@/config/contracts';
import { useState, useCallback } from 'react';
import type { LoadingState, ErrorState } from '@/lib/types';

export function usePrivateTaxiDispatch() {
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  const { writeContractAsync } = useWriteContract();

  const executeTransaction = useCallback(
    async (functionName: string, args: any[], loadingMessage: string) => {
      setLoadingState({ isLoading: true, message: loadingMessage });
      setErrorState({ hasError: false });

      try {
        const hash = await writeContractAsync({
          address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
          abi: PRIVATE_TAXI_DISPATCH_ABI,
          functionName,
          args,
        });

        return hash;
      } catch (error: any) {
        const errorMessage = error?.message || 'Transaction failed';
        setErrorState({ hasError: true, message: errorMessage, code: error?.code });
        throw error;
      } finally {
        setLoadingState({ isLoading: false });
      }
    },
    [writeContractAsync]
  );

  // Driver Functions
  const registerDriver = useCallback(async () => {
    return executeTransaction('registerDriver', [], 'Registering as driver...');
  }, [executeTransaction]);

  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    return executeTransaction(
      'updateLocation',
      [latitude, longitude],
      'Updating location...'
    );
  }, [executeTransaction]);

  const setAvailability = useCallback(async (available: boolean) => {
    return executeTransaction(
      'setAvailability',
      [available],
      `Setting availability to ${available ? 'available' : 'unavailable'}...`
    );
  }, [executeTransaction]);

  // Passenger Functions
  const requestRide = useCallback(
    async (
      pickupLat: number,
      pickupLng: number,
      destLat: number,
      destLng: number,
      maxFare: number
    ) => {
      return executeTransaction(
        'requestRide',
        [pickupLat, pickupLng, destLat, destLng, maxFare],
        'Requesting ride...'
      );
    },
    [executeTransaction]
  );

  const submitOffer = useCallback(
    async (requestId: number, proposedFare: number, estimatedTime: number) => {
      return executeTransaction(
        'submitOffer',
        [requestId, proposedFare, estimatedTime],
        'Submitting offer...'
      );
    },
    [executeTransaction]
  );

  const acceptOffer = useCallback(async (requestId: number, offerIndex: number) => {
    return executeTransaction(
      'acceptOffer',
      [requestId, offerIndex],
      'Accepting offer...'
    );
  }, [executeTransaction]);

  const completeRide = useCallback(async (requestId: number, rating: number) => {
    return executeTransaction(
      'completeRide',
      [requestId, rating],
      'Completing ride...'
    );
  }, [executeTransaction]);

  const cancelRequest = useCallback(async (requestId: number) => {
    return executeTransaction(
      'cancelRequest',
      [requestId],
      'Cancelling request...'
    );
  }, [executeTransaction]);

  return {
    registerDriver,
    updateLocation,
    setAvailability,
    requestRide,
    submitOffer,
    acceptOffer,
    completeRide,
    cancelRequest,
    loadingState,
    errorState,
  };
}

// Read-only hooks
export function useDriverInfo(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'getDriverInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useRideRequest(requestId?: number) {
  return useReadContract({
    address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'getRequestInfo',
    args: requestId !== undefined ? [requestId] : undefined,
    query: {
      enabled: requestId !== undefined,
    },
  });
}

export function useSystemStats() {
  return useReadContract({
    address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'getSystemStats',
  });
}

export function usePassengerHistory(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'getPassengerHistory',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useDriverHistory(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'getDriverHistory',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useIsSystemOperational() {
  return useReadContract({
    address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
    abi: PRIVATE_TAXI_DISPATCH_ABI,
    functionName: 'isSystemOperational',
  });
}
