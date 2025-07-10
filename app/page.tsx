'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionHistory } from '@/components/TransactionHistory';
import {
  usePrivateTaxiDispatch,
  useDriverInfo,
  useSystemStats,
  useIsSystemOperational,
} from '@/hooks/useContract';
import { Shield, Car, Users, Activity, AlertCircle } from 'lucide-react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: driverInfo } = useDriverInfo(address);
  const { data: systemStats } = useSystemStats();
  const { data: isOperational } = useIsSystemOperational();
  const { registerDriver, loadingState, errorState } = usePrivateTaxiDispatch();

  const handleRegisterDriver = async () => {
    try {
      await registerDriver();
    } catch (error) {
      console.error('Failed to register driver:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Private Ride Platform</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* System Status Banner */}
      {isOperational === false && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">System is currently paused</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="max-w-4xl mx-auto text-center py-20">
            <Shield className="h-20 w-20 mx-auto text-blue-600 mb-6" />
            <h2 className="text-4xl font-bold mb-4">Privacy-Focused Ride Sharing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Secure, anonymous, and decentralized ride-sharing powered by blockchain and FHE
              encryption
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-blue-600 mb-2" />
                  <CardTitle>Fully Encrypted</CardTitle>
                  <CardDescription>All location and fare data encrypted using FHE</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Car className="h-12 w-12 text-green-600 mb-2" />
                  <CardTitle>For Drivers</CardTitle>
                  <CardDescription>Register anonymously and accept ride requests</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-purple-600 mb-2" />
                  <CardTitle>For Passengers</CardTitle>
                  <CardDescription>Request rides with complete privacy</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className={isOperational ? 'text-green-600' : 'text-red-600'} />
                    <span className="text-2xl font-bold">
                      {isOperational ? 'Operational' : 'Paused'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{systemStats?.[1]?.toString() || '0'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{systemStats?.[0]?.toString() || '0'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Driver Registration */}
            {!driverInfo?.[0] && (
              <Card>
                <CardHeader>
                  <CardTitle>Become a Driver</CardTitle>
                  <CardDescription>
                    Register to start accepting ride requests anonymously
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleRegisterDriver}
                    isLoading={loadingState.isLoading}
                    disabled={!isOperational}
                  >
                    {loadingState.isLoading ? loadingState.message : 'Register as Driver'}
                  </Button>
                  {errorState.hasError && (
                    <p className="text-sm text-destructive mt-2">{errorState.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Driver Info */}
            {driverInfo?.[0] && (
              <Card>
                <CardHeader>
                  <CardTitle>Driver Dashboard</CardTitle>
                  <CardDescription>Your driver statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">
                      {driverInfo[1] ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rides:</span>
                    <span className="font-medium">{driverInfo[2]?.toString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction History */}
            <TransactionHistory />
          </div>
        )}
      </div>
    </main>
  );
}
