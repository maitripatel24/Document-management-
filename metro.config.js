const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Demo mode (EXPO_PUBLIC_DEMO=1): replace Firebase with an in-memory fake backend
// so the app can be tried with sample data before a Firebase project exists.
if (process.env.EXPO_PUBLIC_DEMO === '1') {
  const mocks = {
    'firebase/app': 'app.js',
    'firebase/auth': 'auth.js',
    'firebase/firestore': 'firestore.js',
    'firebase/storage': 'storage.js',
  };
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (mocks[moduleName]) {
      return { type: 'sourceFile', filePath: path.join(__dirname, 'src', 'demo', mocks[moduleName]) };
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
