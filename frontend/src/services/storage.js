import { STORAGE_KEYS } from '../utils/constants';

// Local Storage Service
const storage = {
  // Get item from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },

  // Set item in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  // Clear all app-related data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  // User-specific methods
  getUserId() {
    return this.get(STORAGE_KEYS.USER_ID);
  },

  setUserId(userId) {
    return this.set(STORAGE_KEYS.USER_ID, userId);
  },

  getPinHash() {
    return this.get(STORAGE_KEYS.PIN_HASH);
  },

  setPinHash(hash) {
    return this.set(STORAGE_KEYS.PIN_HASH, hash);
  },

  isOnboardingCompleted() {
    return this.get(STORAGE_KEYS.ONBOARDING_COMPLETED) === true;
  },

  setOnboardingCompleted(completed) {
    return this.set(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  },

  isBiometricEnabled() {
    return this.get(STORAGE_KEYS.BIOMETRIC_ENABLED) === true;
  },

  setBiometricEnabled(enabled) {
    return this.set(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
  },
};

export default storage;
