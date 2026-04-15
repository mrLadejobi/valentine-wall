// src/lib/encryption.ts
import CryptoJS from 'crypto-js';

export const encryptMessage = (text: string, secretKey: string) => {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

export const decryptMessage = (cipherText: string, secretKey: string) => {
  // 1. Check if the message even looks encrypted (starts with U2FsdGVkX1)
  if (!cipherText.startsWith('U2FsdGVkX1')) {
    return cipherText; // Return as-is (Legacy message)
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // 2. If decryption resulted in valid text, return it
    if (decrypted) return decrypted;
    
    // 3. If it failed but looked like encryption, return the raw text 
    // (This handles cases where the key might have changed)
    return cipherText; 
  } catch (error) {
    return cipherText;
  }
};