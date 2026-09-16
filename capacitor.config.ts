import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hotel.owner',
  appName: 'Hotel PMS',
  webDir: 'dist',
  server: {
    url: 'https://hotel-management-system-client.vercel.app',
    cleartext: true
  }
};

export default config;