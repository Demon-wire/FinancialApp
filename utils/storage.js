import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// SecureStore nur auf nativen Plattformen laden
let SecureStore = null;
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    // Fällt auf AsyncStorage zurück
  }
}

// Diese Keys werden sicher gespeichert (klein, sensitiv)
const SECURE_KEYS = ['currentUser', 'isLoggedIn', 'lastLoggedInUser'];

const useSecure = (key) => SecureStore !== null && SECURE_KEYS.includes(key);

export const getItem = async (key) => {
  if (useSecure(key)) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return await AsyncStorage.getItem(key);
    }
  }
  return await AsyncStorage.getItem(key);
};

export const setItem = async (key, value) => {
  if (useSecure(key)) {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch (e) {
      // Fallback
    }
  }
  await AsyncStorage.setItem(key, value);
};

export const removeItem = async (key) => {
  if (useSecure(key)) {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch (e) {
      // Fallback
    }
  }
  await AsyncStorage.removeItem(key);
};
