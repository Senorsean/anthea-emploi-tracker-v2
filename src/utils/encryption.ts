// Encryption utilities for securing localStorage data
const ENCRYPTION_KEY = 'lovable-career-app-key';

// Simple encryption using base64 encoding and string manipulation
// Note: This is basic obfuscation, not cryptographic security
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonString)));
    return `encrypted_${encoded}`;
  } catch (error) {
    console.warn('Failed to encrypt data:', error);
    return JSON.stringify(data);
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    // Check if data is encrypted
    if (!encryptedData.startsWith('encrypted_')) {
      // Return as-is if not encrypted (backward compatibility)
      return JSON.parse(encryptedData);
    }
    
    const encoded = encryptedData.replace('encrypted_', '');
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch (error) {
    console.warn('Failed to decrypt data:', error);
    // Return null on decryption failure
    return null;
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any) => {
    const encrypted = encryptData(value);
    localStorage.setItem(key, encrypted);
  },
  
  getItem: (key: string) => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return decryptData(stored);
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};