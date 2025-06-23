import React, { createContext, useContext, useEffect, useState } from 'react';

import { Network } from '@capacitor/network';
import { toast } from '@/components/ui/sonner';

interface NetworkContextType {
  isOnline: boolean;
  connectionType: string | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // Check initial network status
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    };

    checkNetworkStatus();

    // Listen for network status changes
    //   const networkStatusListener =
    Network.addListener('networkStatusChange', (status) => {
      if (status.connected && !isOnline) {
        // Connection was restored
        toast.success('You are back online!', {
          duration: 3000,
        });
      }

      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    return () => {
      // Clean up listeners when component unmounts
      Network.removeAllListeners();
    };
  }, [isOnline]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        connectionType,
      }}
    >
      {children}
      {!isOnline && (
        <div className='fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 z-50 flex items-center justify-center space-x-2'>
          {/* <span className='inline-block h-2 w-2 rounded-full bg-current animate-pulse' /> */}
          <span className='animate-pulse text-center'>
            You are offline
            <br />
            Some features may be unavailable
          </span>
        </div>
      )}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
