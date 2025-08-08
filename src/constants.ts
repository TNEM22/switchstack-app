// export const SERVER_URL = 'http://localhost:3000';
// export const SERVER_URL = 'https://switchstack-app-backend.onrender.com';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const WS_URL = import.meta.env.VITE_WS_URL;
export const USER_STORAGE_KEY = 'switchstack-user';
export const ROOMS_STORAGE_KEY = 'switchstack-rooms';

// BLE UUIDs for ESP32 - these must match the UUIDs defined on the ESP32 devices
export const ESP32_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const ESP32_WIFI_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const ESP32_SSID_CHAR_UUID = '8801c9f9-df5c-4d86-9fa7-a2358c48db18';
export const ESP32_PASSWORD_CHAR_UUID = 'c8bda280-c946-463b-9da9-a3cb3c9481e6';
export const ESP32_STATUS_CHAR_UUID = '86077f48-d9ec-4b0b-b543-53be4c18a6c2';
