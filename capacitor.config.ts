import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ph.edu.csu.carig.csuone',
  appName: 'CSU-One',
  webDir: 'dist',
  plugins: {
    // The web app draws behind the status bar and notch (viewport-fit=cover) and pads
    // itself with the safe-area insets. Start with dark status bar icons for the light
    // landing and login screens; the app switches them for dark mode at runtime.
    SystemBars: {
      insetsHandling: 'css',
      style: 'LIGHT',
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
