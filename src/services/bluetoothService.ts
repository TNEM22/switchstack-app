import {
  BleClient,
  ScanResult,
  BleDevice,
} from '@capacitor-community/bluetooth-le';
import { toast } from '@/components/ui/sonner';
import {
  ESP32_SERVICE_UUID,
  ESP32_WIFI_CHAR_UUID,
  ESP32_SSID_CHAR_UUID,
  ESP32_PASSWORD_CHAR_UUID,
  ESP32_STATUS_CHAR_UUID,
} from '@/constants';

interface WiFiCredentials {
  ssid: string;
  password: string;
}

export interface BluetoothDevice {
  name: string;
  deviceId: string;
  rssi?: number;
}

export class BluetoothService {
  private static instance: BluetoothService;
  private isScanning = false;
  private connectedDevice: string | null = null;

  private constructor() {
    // Initialize the BLE plugin
    this.initialize();
  }

  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await BleClient.initialize();
      console.log('Bluetooth initialized');
    } catch (error) {
      console.error('Error initializing Bluetooth', error);
      toast.error('Failed to initialize Bluetooth');
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    // if (this.isScanning) {
    //   await this.stopScan();
    // }
    const foundDevices: BluetoothDevice[] = [];

    return new Promise<BluetoothDevice[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        BleClient.stopLEScan();
        resolve(foundDevices);
      }, 5000); // 5 seconds scan duration

      BleClient.requestLEScan(
        {
          allowDuplicates: false,
          // services: [],
        },
        (result: ScanResult) => {
          if (
            result &&
            result.device &&
            result.device?.name?.startsWith('SH-IN-')
          ) {
            // console.log('Device found:', result.device);
            const device: BluetoothDevice = {
              deviceId: result.device.deviceId,
              name: result.device.name || 'Unknown Device',
              rssi: result.rssi,
            };

            // Avoid duplicates
            if (!foundDevices.some((d) => d.deviceId === device.deviceId)) {
              foundDevices.push(device);
            }
          }
        }
      ).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // try {
    //   this.isScanning = true;

    //   // Start scan with specific service UUID filter for ESP32 devices
    //   let devices: BleDevice[] = [];

    //   try {
    //     // Use requestLEScan for Capacitor Bluetooth LE scanning
    //     await BleClient.requestLEScan(
    //       { services: [], allowDuplicates: false },
    //       (res) => {
    //         console.log('Device found during scan:', res);
    //       }
    //     );
    //     // await BleClient.requestLEScan(
    //     //   { services: [ESP32_SERVICE_UUID] },
    //     //   () => {
    //     //     // This is the callback that will be called when a device is found
    //     //     console.log('Device found during scan');
    //     //   }
    //     // );

    //     // Wait for 5 seconds to collect devices
    //     await new Promise((resolve) => setTimeout(resolve, 5000));

    //     // Stop scanning
    //     await BleClient.stopLEScan();

    //     // Get discovered devices
    //     // devices = await BleClient.getConnectedDevices([ESP32_SERVICE_UUID]);
    //     devices = await BleClient.getConnectedDevices([]);
    //   } catch (error) {
    //     console.error('Scan error:', error);
    //   } finally {
    //     this.isScanning = false;
    //   }

    //   // Transform scan results to our BluetoothDevice format
    //   return devices.map((device) => ({
    //     deviceId: device.deviceId,
    //     name: device.name || 'Unknown Device',
    //   }));
    // } catch (error) {
    //   this.isScanning = false;
    //   console.error('Error scanning for devices', error);
    //   toast.error('Failed to scan for Bluetooth devices');
    //   return [];
    // }
  }

  async stopScan(): Promise<void> {
    if (this.isScanning) {
      try {
        await BleClient.stopLEScan();
        this.isScanning = false;
      } catch (error) {
        console.error('Error stopping scan', error);
      }
    }
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      await BleClient.connect(deviceId, (deviceId) => {
        console.log(`Device ${deviceId} disconnected`);
        if (this.connectedDevice === deviceId) {
          this.connectedDevice = null;
        }
      });

      this.connectedDevice = deviceId;
      toast.success('Connected to device');
      return true;
    } catch (error) {
      console.error('Error connecting to device', error);
      toast.error('Failed to connect to device');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await BleClient.disconnect(this.connectedDevice);
        this.connectedDevice = null;
        toast.success('Disconnected from device');
      } catch (error) {
        console.error('Error disconnecting from device', error);
        toast.error('Failed to disconnect from device');
      }
    }
  }

  async setWifiCredentials(
    deviceId: string,
    credentials: WiFiCredentials
  ): Promise<boolean> {
    try {
      // Connect if not already connected
      if (this.connectedDevice !== deviceId) {
        const connected = await this.connect(deviceId);
        if (!connected) return false;
      }

      // Convert strings to byte arrays
      const ssidBytes = this.stringToBytes(credentials.ssid);
      const passwordBytes = this.stringToBytes(credentials.password);

      // Write SSID to the characteristic
      await BleClient.write(
        deviceId,
        ESP32_SERVICE_UUID,
        ESP32_SSID_CHAR_UUID,
        new DataView(ssidBytes.buffer)
      );

      // Write password to the characteristic
      await BleClient.write(
        deviceId,
        ESP32_SERVICE_UUID,
        ESP32_PASSWORD_CHAR_UUID,
        new DataView(passwordBytes.buffer)
      );

      // Signal the ESP32 to connect to WiFi
      const triggerBytes = new Uint8Array([1]);
      await BleClient.write(
        deviceId,
        ESP32_SERVICE_UUID,
        ESP32_WIFI_CHAR_UUID,
        new DataView(triggerBytes.buffer)
      );

      // Wait for status update
      return this.checkWifiStatus(deviceId);
    } catch (error) {
      console.error('Error setting WiFi credentials', error);
      toast.error('Failed to set WiFi credentials');
      return false;
    }
  }

  private async checkWifiStatus(deviceId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => {
        BleClient.stopNotifications(
          deviceId,
          ESP32_SERVICE_UUID,
          ESP32_STATUS_CHAR_UUID
        ).catch(console.error);
        resolve(false); // Timeout - assume failure
      }, 15000); // 15 seconds timeout for WiFi connection

      const onStatusUpdate = (value: DataView) => {
        const status = value.getUint8(0);

        if (status === 1) {
          clearTimeout(timeoutId);
          BleClient.stopNotifications(
            deviceId,
            ESP32_SERVICE_UUID,
            ESP32_STATUS_CHAR_UUID
          ).catch(console.error);
          toast.success('WiFi connected successfully');
          resolve(true);
        } else {
          toast.error('Failed to connect to WiFi');
          resolve(false);
        }
      };

      // Set up notification for status updates
      BleClient.startNotifications(
        deviceId,
        ESP32_SERVICE_UUID,
        ESP32_STATUS_CHAR_UUID,
        onStatusUpdate
      ).catch((error) => {
        console.error('Error starting notifications', error);
        resolve(false);
      });
    });
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      // First make sure Bluetooth is initialized
      await BleClient.initialize();

      // If the initialization succeeds without throwing an error
      // then Bluetooth is enabled
      return true;
    } catch (error) {
      console.error('Bluetooth is not enabled:', error);
      return false;
    }
  }

  async hasRequiredPermissions(): Promise<boolean> {
    try {
      // This will check if all required permissions are granted
      // For Android, this includes location permission
      await BleClient.initialize();

      // On Android 12+, we need to check if we have BLUETOOTH_SCAN permission
      // which requires location services to be enabled
      return true;
    } catch (error) {
      console.error('Required permissions not granted:', error);
      return false;
    }
  }

  // Utility method for converting string to byte array
  private stringToBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }
}

// Export a singleton instance
const bluetoothService = BluetoothService.getInstance();
export default bluetoothService;
