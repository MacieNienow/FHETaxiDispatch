import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACTS, PRIVATE_TAXI_DISPATCH_ABI } from '@/config/contracts';
import type { TransactionHistory } from '@/lib/types';

const EVENT_NAMES = {
  DriverRegistered: 'driver_registration',
  LocationUpdated: 'location_update',
  RideRequested: 'ride_request',
  OfferSubmitted: 'offer_submitted',
  RideMatched: 'ride_matched',
  RideCompleted: 'ride_completed',
  RideCancelled: 'ride_cancelled',
} as const;

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const fetchTransactionHistory = useCallback(async () => {
    if (!address || !publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 10000n; // Last ~10000 blocks

      // Fetch all events
      const events = await publicClient.getContractEvents({
        address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
        abi: PRIVATE_TAXI_DISPATCH_ABI,
        fromBlock,
        toBlock: 'latest',
      });

      // Filter events related to the current user
      const userEvents = events.filter((event: any) => {
        const args = event.args as any;
        return (
          args?.driver?.toLowerCase() === address.toLowerCase() ||
          args?.passenger?.toLowerCase() === address.toLowerCase()
        );
      });

      // Transform events to transaction history
      const history: TransactionHistory[] = await Promise.all(
        userEvents.map(async (event: any) => {
          const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
          const transaction = await publicClient.getTransaction({ hash: event.transactionHash });
          const receipt = await publicClient.getTransactionReceipt({ hash: event.transactionHash });

          const eventName = event.eventName as keyof typeof EVENT_NAMES;
          const type = EVENT_NAMES[eventName] || 'unknown';

          return {
            hash: event.transactionHash,
            type: type as any,
            timestamp: Number(block.timestamp),
            status: receipt.status === 'success' ? 'confirmed' : 'failed',
            from: transaction.from,
            to: transaction.to || undefined,
            value: transaction.value.toString(),
            gasUsed: receipt.gasUsed.toString(),
          };
        })
      );

      // Sort by timestamp (newest first)
      history.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(history);
    } catch (err: any) {
      console.error('Error fetching transaction history:', err);
      setError(err.message || 'Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    if (address) {
      fetchTransactionHistory();
    }
  }, [address, fetchTransactionHistory]);

  const refetch = useCallback(() => {
    fetchTransactionHistory();
  }, [fetchTransactionHistory]);

  return {
    transactions,
    isLoading,
    error,
    refetch,
  };
}

export function useWatchTransactions() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [latestTransaction, setLatestTransaction] = useState<TransactionHistory | null>(null);

  useEffect(() => {
    if (!publicClient || !address) return;

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACTS.PRIVATE_TAXI_DISPATCH.address,
      abi: PRIVATE_TAXI_DISPATCH_ABI,
      onLogs: async (logs) => {
        for (const log of logs) {
          const args = log.args as any;
          const isUserRelated =
            args?.driver?.toLowerCase() === address.toLowerCase() ||
            args?.passenger?.toLowerCase() === address.toLowerCase();

          if (isUserRelated) {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const transaction = await publicClient.getTransaction({ hash: log.transactionHash });

            const eventName = log.eventName as keyof typeof EVENT_NAMES;
            const type = EVENT_NAMES[eventName] || 'unknown';

            setLatestTransaction({
              hash: log.transactionHash,
              type: type as any,
              timestamp: Number(block.timestamp),
              status: 'confirmed',
              from: transaction.from,
              to: transaction.to || undefined,
              value: transaction.value.toString(),
            });
          }
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [publicClient, address]);

  return latestTransaction;
}
