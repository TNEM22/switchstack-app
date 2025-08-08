import { Capacitor } from '@capacitor/core';
import { useState, useEffect, useCallback } from 'react';
import {
  Wifi,
  Bluetooth,
  BluetoothOff,
  RefreshCw,
  Check,
  X,
  MapPin,
} from 'lucide-react';

import bluetoothService, { BluetoothDevice } from '@/services/bluetoothService';

import { Room } from '@/context/RoomContext';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface RoomBluetoothSetupProps {
  room: Room;
}

export const RoomBluetoothSetup = ({ room }: RoomBluetoothSetupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(
    null
  );
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState<'scan' | 'credentials' | 'connecting'>(
    'scan'
  );
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState<boolean | null>(
    null
  );
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean | null>(
    null
  ); // Start with null to show "checking" state

  // Function to check if location services are enabled
  const checkLocationPermission = async () => {
    // Check if we're on a mobile device with Capacitor
    // const isNative = 'Capacitor' in window;
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        // For Android, location permission is required for Bluetooth scanning
        // We can use the BleClient to check if permissions are granted
        // This will indirectly tell us if location is enabled
        await bluetoothService.hasRequiredPermissions();
        setIsLocationEnabled(true);
      } catch (error) {
        toast.error('Location permission not granted:', error);
        setIsLocationEnabled(false);
      }
    } else {
      // On web, assume location is available (though this is not reliable)
      setIsLocationEnabled(true);
    }
  };

  // Function to check Bluetooth status
  const checkBluetoothStatus = useCallback(async () => {
    try {
      const enabled = await bluetoothService.isBluetoothEnabled();
      setIsBluetoothEnabled(enabled);

      // On Android, location services are required for Bluetooth scanning
      if (enabled) {
        checkLocationPermission();
      }
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      setIsBluetoothEnabled(false);
    }
  }, []);

  // Check Bluetooth status when component mounts
  useEffect(() => {
    checkBluetoothStatus();
    checkLocationPermission();
  }, [checkBluetoothStatus]);

  // Check Bluetooth status when dialog opens
  useEffect(() => {
    if (isOpen) {
      checkBluetoothStatus();
      checkLocationPermission();
    }
  }, [isOpen, checkBluetoothStatus]);

  const openBluetoothSettings = async () => {
    // On mobile devices, we can prompt users to open Bluetooth settings
    const isNative = 'Capacitor' in window;

    if (isNative) {
      try {
        // Use App API to open settings if available
        // This is a simplified example - in a real app you would use a plugin like:
        // import { App } from '@capacitor/app';
        // await App.openUrl({ url: 'app-settings:bluetooth' });

        // For now, we'll just show a toast with instructions
        toast.info('Please enable Bluetooth in your device settings', {
          duration: 5000,
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });

        // After a delay, check if the user enabled Bluetooth
        setTimeout(() => {
          checkBluetoothStatus();
        }, 1000);
      } catch (error) {
        console.error('Error opening Bluetooth settings:', error);
      }
    } else {
      // On web, just show instructions
      toast.info('Please enable Bluetooth in your browser settings', {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    }
  };

  const openLocationSettings = async () => {
    // On mobile devices, we can prompt users to open Location settings
    const isNative = 'Capacitor' in window;

    if (isNative) {
      try {
        // Use App API to open settings if available
        // This is a simplified example - in a real app you would use a plugin like:
        // import { App } from '@capacitor/app';
        // await App.openUrl({ url: 'app-settings:' });

        // For now, we'll just show a toast with instructions
        toast.info('Please enable Location services in your device settings', {
          duration: 5000,
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });

        // After a delay, check if the user enabled location
        setTimeout(() => {
          checkLocationPermission();
        }, 1000);
      } catch (error) {
        console.error('Error opening location settings:', error);
      }
    } else {
      // On web, just show instructions
      toast.info('Please enable Location services in your browser settings', {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    }
  };

  const scanForDevices = async () => {
    try {
      setIsScanning(true);
      const foundDevices = await bluetoothService.scanForDevices();
      setDevices(foundDevices);

      if (foundDevices.length === 0) {
        toast.error(
          'No Bluetooth devices found. Make sure your ESP32 is in pairing mode.',
          { duration: 1000 }
        );
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      toast.error('Failed to scan for Bluetooth devices');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceSelect = (device: BluetoothDevice) => {
    setSelectedDevice(device);
    setStep('credentials');
  };

  const handleSubmitCredentials = async () => {
    if (!selectedDevice) {
      toast.error('No device selected');
      return;
    }

    if (!ssid || !password) {
      toast.error('Please enter both WiFi SSID and password');
      return;
    }

    setStep('connecting');
    setIsConnecting(true);

    try {
      const success = await bluetoothService.setWifiCredentials(
        selectedDevice.deviceId,
        { ssid, password }
      );

      if (success) {
        toast.success('WiFi credentials set successfully');
        setIsOpen(false);
        // Reset the form
        setSelectedDevice(null);
        setSsid('');
        setPassword('');
        setStep('scan');
      } else {
        toast.error('Failed to set WiFi credentials');
        setStep('credentials');
      }
    } catch (error) {
      console.error('Error setting WiFi credentials:', error);
      toast.error('An error occurred while setting WiFi credentials');
      setStep('credentials');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancel = () => {
    // Disconnect if connected
    bluetoothService.disconnect().catch(console.error);

    // Reset the state
    setSelectedDevice(null);
    setSsid('');
    setPassword('');
    setStep('scan');
    setIsOpen(false);
  };

  const renderScanStep = () => (
    <>
      <div className='space-y-4 py-4'>
        {/* Bluetooth and Location Status Indicators */}
        <div className='space-y-3 mb-4'>
          <div className='flex items-center justify-between p-3 border rounded-md'>
            <div className='flex items-center space-x-2'>
              {isBluetoothEnabled ? (
                <Bluetooth className='h-5 w-5 text-green-500' />
              ) : (
                <BluetoothOff className='h-5 w-5 text-red-500' />
              )}
              <div>
                <p className='font-medium'>Bluetooth</p>
                <p className='text-xs text-muted-foreground'>
                  {isBluetoothEnabled === null
                    ? 'Checking status...'
                    : isBluetoothEnabled
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>
            </div>
            {isBluetoothEnabled === false && (
              <Button
                variant='outline'
                size='sm'
                onClick={openBluetoothSettings}
              >
                Enable
              </Button>
            )}
          </div>

          <div className='flex items-center justify-between p-3 border rounded-md'>
            <div className='flex items-center space-x-2'>
              <MapPin
                className={`h-5 w-5 ${
                  isLocationEnabled === null
                    ? 'text-muted-foreground'
                    : isLocationEnabled
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              />
              <div>
                <p className='font-medium'>Location Services</p>
                <p className='text-xs text-muted-foreground'>
                  {isLocationEnabled === null
                    ? 'Checking status...'
                    : isLocationEnabled
                    ? 'Enabled'
                    : 'Required for scanning'}
                </p>
              </div>
            </div>
            {isLocationEnabled === false && (
              <Button
                variant='outline'
                size='sm'
                onClick={openLocationSettings}
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>
            Looking for ESP32 device corresponding to room:{' '}
            <strong>{room.name}</strong>
          </p>
          <p className='text-sm text-muted-foreground'>
            Make sure your ESP32 device is powered on and in pairing mode.
          </p>
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-medium'>Available Devices</h3>
            <Button
              variant='outline'
              size='icon'
              onClick={scanForDevices}
              disabled={
                isScanning ||
                !isBluetoothEnabled ||
                isLocationEnabled === false ||
                isLocationEnabled === null
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>

          {devices.length === 0 ? (
            <div className='py-4 text-center text-sm text-muted-foreground'>
              {isScanning
                ? 'Scanning for devices...'
                : !isBluetoothEnabled
                ? 'Enable Bluetooth to scan for devices'
                : isLocationEnabled === false
                ? 'Enable Location Services to scan for devices'
                : 'No devices found. Click refresh to scan again.'}
            </div>
          ) : (
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  className='flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-accent'
                  onClick={() => handleDeviceSelect(device)}
                >
                  <div className='flex items-center space-x-2'>
                    <Bluetooth className='h-4 w-4 text-blue-500' />
                    <div>
                      <p className='font-medium'>{device.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {device.deviceId.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  {device.rssi && (
                    <div className='text-xs text-muted-foreground'>
                      Signal: {device.rssi} dBm
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant='outline' onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          onClick={scanForDevices}
          disabled={
            isScanning ||
            !isBluetoothEnabled ||
            isLocationEnabled === false ||
            isLocationEnabled === null
          }
        >
          {isScanning ? 'Scanning...' : 'Scan Again'}
        </Button>
      </DialogFooter>
    </>
  );

  const renderCredentialsStep = () => (
    <>
      <div className='space-y-4 py-4'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>
            Connected to device: <strong>{selectedDevice?.name}</strong>
          </p>
          <p className='text-sm text-muted-foreground'>
            Enter the WiFi network credentials you want to set for this ESP32
            device.
          </p>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ssid'>WiFi Network Name (SSID)</Label>
            <Input
              id='ssid'
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder='Enter WiFi SSID'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>WiFi Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter WiFi password'
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant='outline' onClick={() => setStep('scan')}>
          Back
        </Button>
        <Button onClick={handleSubmitCredentials} disabled={!ssid || !password}>
          Set WiFi Credentials
        </Button>
      </DialogFooter>
    </>
  );

  const renderConnectingStep = () => (
    <div className='space-y-6 py-6'>
      <div className='flex flex-col items-center justify-center space-y-4'>
        <div className='animate-pulse flex items-center justify-center w-16 h-16 rounded-full bg-primary/20'>
          <Wifi className='h-8 w-8 text-primary' />
        </div>
        <h3 className='text-lg font-medium text-center'>Connecting to WiFi</h3>
        <p className='text-sm text-muted-foreground text-center'>
          Setting up WiFi connection for your ESP32 device. This may take a few
          moments...
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        className='flex items-center gap-2'
        onClick={() => {
          setIsOpen(true);
          checkBluetoothStatus();
          checkLocationPermission();
        }}
      >
        {isBluetoothEnabled === false ? (
          <BluetoothOff className='h-4 w-4 text-red-500' />
        ) : (
          <Bluetooth className='h-4 w-4' />
        )}
        <span>Set WiFi</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>
              {step === 'scan' && 'Connect to ESP32 Device'}
              {step === 'credentials' && 'Set WiFi Credentials'}
              {step === 'connecting' && 'Connecting to WiFi'}
            </DialogTitle>
          </DialogHeader>

          {step === 'scan' && renderScanStep()}
          {step === 'credentials' && renderCredentialsStep()}
          {step === 'connecting' && renderConnectingStep()}
        </DialogContent>
      </Dialog>
    </>
  );
};
