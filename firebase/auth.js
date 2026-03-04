import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import app from './firebaseConfig';

// Initialize Auth with AsyncStorage persistence so the user stays logged in
// across app restarts.
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
