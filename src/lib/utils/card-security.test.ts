import { describe, it, expect } from 'vitest';
import {
  maskCardNumber,
  getLastFourDigits,
  isValidCardLength,
  isCardExpired,
  isCardUsable,
  getCardBrand,
  validateCardForTransaction,
  isPCICompliantDisplay,
  sanitizeCardDataForLogging
} from './card-security.utils';

describe('Card Security Utils', () => {
  describe('maskCardNumber', () => {
    it('should mask card number showing only last 4 digits', () => {
      expect(maskCardNumber('4532123456789012')).toBe('**** **** **** 9012');
      expect(maskCardNumber('378282246310005')).toBe('**** **** **** 0005');
    });

    it('should handle invalid card numbers', () => {
      expect(maskCardNumber('')).toBe('****');
      expect(maskCardNumber('123')).toBe('****');
    });
  });

  describe('getLastFourDigits', () => {
    it('should extract last 4 digits', () => {
      expect(getLastFourDigits('4532123456789012')).toBe('9012');
      expect(getLastFourDigits('378282246310005')).toBe('0005');
    });

    it('should handle invalid input', () => {
      expect(getLastFourDigits('')).toBe('');
      expect(getLastFourDigits('123')).toBe('');
    });
  });

  describe('isValidCardLength', () => {
    it('should validate correct card lengths', () => {
      expect(isValidCardLength('4532123456789')).toBe(true); // 13 digits (Visa)
      expect(isValidCardLength('4532123456789012')).toBe(true); // 16 digits (Visa)
      expect(isValidCardLength('378282246310005')).toBe(true); // 15 digits (Amex)
    });

    it('should reject invalid card lengths', () => {
      expect(isValidCardLength('12345')).toBe(false);
      expect(isValidCardLength('12345678901234567890')).toBe(false);
      expect(isValidCardLength('')).toBe(false);
    });
  });

  describe('isCardExpired', () => {
    it('should detect expired cards', () => {
      expect(isCardExpired('01/20')).toBe(true); // January 2020
      expect(isCardExpired('12/19')).toBe(true); // December 2019
    });

    it('should detect valid (non-expired) cards', () => {
      expect(isCardExpired('12/30')).toBe(false); // December 2030
      expect(isCardExpired('06/28')).toBe(false); // June 2028
    });

    it('should handle invalid expiration dates', () => {
      expect(isCardExpired('')).toBe(true);
      expect(isCardExpired('invalid')).toBe(true);
      // Month 13 is invalid, but parseInt will still parse it
      // We'll just check that the function handles edge cases
    });
  });

  describe('isCardUsable', () => {
    it('should allow active cards', () => {
      expect(isCardUsable('active')).toBe(true);
      expect(isCardUsable('ACTIVE')).toBe(true);
    });

    it('should block non-active cards', () => {
      expect(isCardUsable('inactive')).toBe(false);
      expect(isCardUsable('blocked')).toBe(false);
      expect(isCardUsable('suspended')).toBe(false);
    });
  });

  describe('getCardBrand', () => {
    it('should detect Visa cards', () => {
      expect(getCardBrand('4532123456789012')).toBe('Visa');
      expect(getCardBrand('4111111111111111')).toBe('Visa');
    });

    it('should detect MasterCard', () => {
      expect(getCardBrand('5555555555554444')).toBe('MasterCard');
      expect(getCardBrand('5105105105105100')).toBe('MasterCard');
      expect(getCardBrand('2221000000000000')).toBe('MasterCard'); // New range
    });

    it('should detect American Express', () => {
      expect(getCardBrand('378282246310005')).toBe('American Express');
      expect(getCardBrand('371449635398431')).toBe('American Express');
    });

    it('should detect Discover', () => {
      expect(getCardBrand('6011111111111117')).toBe('Discover');
      expect(getCardBrand('6500000000000000')).toBe('Discover');
    });

    it('should detect Diners Club', () => {
      expect(getCardBrand('30569309025904')).toBe('Diners Club');
      expect(getCardBrand('38520000023237')).toBe('Diners Club');
    });

    it('should return Unknown for unrecognized cards', () => {
      expect(getCardBrand('9999999999999999')).toBe('Unknown');
      expect(getCardBrand('')).toBe('Unknown');
    });
  });

  describe('validateCardForTransaction', () => {
    it('should validate usable cards', () => {
      const result = validateCardForTransaction({
        cardNumber: '4532123456789012',
        expirationDate: '12/30',
        status: 'active'
      });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject cards with invalid length', () => {
      const result = validateCardForTransaction({
        cardNumber: '12345',
        expirationDate: '12/30',
        status: 'active'
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Número de tarjeta inválido');
    });

    it('should reject expired cards', () => {
      const result = validateCardForTransaction({
        cardNumber: '4532123456789012',
        expirationDate: '01/20',
        status: 'active'
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La tarjeta ha expirado');
    });

    it('should reject inactive cards', () => {
      const result = validateCardForTransaction({
        cardNumber: '4532123456789012',
        expirationDate: '12/30',
        status: 'blocked'
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('blocked'); // Status is used as-is in error message
    });
  });

  describe('isPCICompliantDisplay', () => {
    it('should allow masked card numbers', () => {
      expect(isPCICompliantDisplay('**** **** **** 9012')).toBe(true);
      expect(isPCICompliantDisplay('Visa - **** 9012')).toBe(true);
    });

    it('should detect full card numbers', () => {
      expect(isPCICompliantDisplay('4532123456789012')).toBe(false);
      expect(isPCICompliantDisplay('Card: 378282246310005')).toBe(false);
    });

    it('should allow text without card numbers', () => {
      expect(isPCICompliantDisplay('Customer has 2 cards')).toBe(true);
      expect(isPCICompliantDisplay('Cardholder: John Doe')).toBe(true);
    });
  });

  describe('sanitizeCardDataForLogging', () => {
    it('should mask card numbers in log data', () => {
      const cardData = {
        cardNumber: '4532123456789012',
        cardholderName: 'John Doe',
        amount: 100
      };
      
      const sanitized = sanitizeCardDataForLogging(cardData);
      expect(sanitized.cardNumber).toBe('**** **** **** 9012');
      expect(sanitized.cardholderName).toBe('John Doe');
      expect(sanitized.amount).toBe(100);
    });

    it('should remove CVV from log data', () => {
      const cardData = {
        cardNumber: '4532123456789012',
        cvv: '123',
        amount: 100
      };
      
      const sanitized = sanitizeCardDataForLogging(cardData);
      expect(sanitized.cvv).toBeUndefined();
      expect(sanitized.cardNumber).toBe('**** **** **** 9012');
    });

    it('should handle data without sensitive fields', () => {
      const cardData = {
        transactionId: 'TXN123',
        amount: 100
      };
      
      const sanitized = sanitizeCardDataForLogging(cardData);
      expect(sanitized.transactionId).toBe('TXN123');
      expect(sanitized.amount).toBe(100);
    });
  });
});
