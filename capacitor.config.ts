import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tnem.switchstack',
  appName: 'SwitchStack',
  webDir: 'dist',
  plugins: {
    // StatusBar: {
    //   sytle: 'default',
    //   // backgroundColor: '#ffffff',
    //   overlaysWewbView: true,
    // },
    // SplashScreen: {
    //   launchShowDuration: 2000,
    //   // backgroundColor: '#ffffff',
    //   androidSplashResourceName: 'splash',
    //   androidScaleType: 'CENTER_CROP',
    //   showSpinner: true,
    // },
  },
};

export default config;
