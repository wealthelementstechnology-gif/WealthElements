import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import storage from './storage';

const SALT_ROUNDS = 10;

const authService = {
  // Check if user exists (has PIN set up)
  isUserSetUp() {
    const userId = storage.getUserId();
    const pinHash = storage.getPinHash();
    return !!(userId && pinHash);
  },

  // Create new user with PIN
  async createUser(pin) {
    try {
      const userId = uuidv4();
      const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);

      storage.setUserId(userId);
      storage.setPinHash(pinHash);

      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  },

  // Verify PIN
  async verifyPin(pin) {
    try {
      const pinHash = storage.getPinHash();
      if (!pinHash) {
        return { success: false, error: 'No PIN set up' };
      }

      const isValid = await bcrypt.compare(pin, pinHash);
      if (isValid) {
        const userId = storage.getUserId();
        return { success: true, userId };
      }

      return { success: false, error: 'Invalid PIN' };
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return { success: false, error: 'Failed to verify PIN' };
    }
  },

  // Change PIN
  async changePin(currentPin, newPin) {
    try {
      const verification = await this.verifyPin(currentPin);
      if (!verification.success) {
        return { success: false, error: 'Current PIN is incorrect' };
      }

      const newPinHash = await bcrypt.hash(newPin, SALT_ROUNDS);
      storage.setPinHash(newPinHash);

      return { success: true };
    } catch (error) {
      console.error('Error changing PIN:', error);
      return { success: false, error: 'Failed to change PIN' };
    }
  },

  // Logout (clear session, keep data)
  logout() {
    // We don't clear the PIN or userId, just the session
    return { success: true };
  },

  // Reset all data
  resetAllData() {
    storage.clearAll();
    return { success: true };
  },

  // Get current user ID
  getCurrentUserId() {
    return storage.getUserId();
  },

  // Check onboarding status
  isOnboardingCompleted() {
    return storage.isOnboardingCompleted();
  },

  // Complete onboarding
  completeOnboarding() {
    storage.setOnboardingCompleted(true);
  },
};

export default authService;
