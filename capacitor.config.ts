import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.steady.shadowlevel',
  appName: 'STEADY Shadow Level System',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
