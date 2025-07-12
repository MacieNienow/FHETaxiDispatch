'use client';

import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAddress, formatTimestamp } from '@/lib/utils';
import { ExternalLink, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TX_TYPE_LABELS = {
  driver_registration: 'Driver Registration',
  location_update: 'Location Update',
  ride_request: 'Ride Request',
  offer_submitted: 'Offer Submitted',
  ride_matched: 'Ride Matched',
  ride_completed: 'Ride Completed',
  ride_cancelled: 'Ride Cancelled',
};

const TX_TYPE_COLORS = {
  driver_registration: 'text-blue-600 bg-blue-50',
  location_update: 'text-gray-600 bg-gray-50',
  ride_request: 'text-purple-600 bg-purple-50',
  offer_submitted: 'text-yellow-600 bg-yellow-50',
  ride_matched: 'text-green-600 bg-green-50',
  ride_completed: 'text-emerald-600 bg-emerald-50',
  ride_cancelled: 'text-red-600 bg-red-50',
};

export function TransactionHistory() {
  const { transactions, isLoading, error, refetch } = useTransactionHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Loading your recent transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions found</p>
            <p className="text-sm mt-2">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        TX_TYPE_COLORS[tx.type] || 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      {TX_TYPE_LABELS[tx.type] || tx.type}
                    </span>
                    {tx.status === 'confirmed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {tx.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {tx.status === 'pending' && (
                      <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Hash: {formatAddress(tx.hash)}</p>
                    <p>From: {formatAddress(tx.from)}</p>
                    {tx.to && <p>To: {formatAddress(tx.to)}</p>}
                    <p>Time: {formatTimestamp(tx.timestamp)}</p>
                    {tx.gasUsed && (
                      <p className="text-xs">Gas Used: {parseInt(tx.gasUsed).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
