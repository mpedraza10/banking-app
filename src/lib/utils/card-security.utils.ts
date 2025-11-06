/**
 * Card Security Utilities
 * PCI DSS Compliance: Card number masking and security validation
 * 
 * This module provides utilities for handling payment card information
 * in compliance with PCI DSS (Payment Card Industry Data Security Standard).
 */

/**
 * Masks a card number to show only the last 4 digits
 * PCI DSS Requirement 3.3: Mask PAN when displayed
 * 
 * @param cardNumber - The full card number to mask
 * @returns Masked card number in format: **** **** **** 1234
 * 
 * @example
 * maskCardNumber('4532123456789012') // Returns: '**** **** **** 9012'
 * maskCardNumber('378282246310005')  // Returns: '**** **** **** 0005'
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) {
    return '****';
  }
  
  // Extract last 4 digits
  const lastFour = cardNumber.slice(-4);
  
  // Return masked format with last 4 digits visible
  return `**** **** **** ${lastFour}`;
}

/**
 * Gets only the last 4 digits of a card number
 * Used for display and logging purposes
 * 
 * @param cardNumber - The full card number
 * @returns Last 4 digits or empty string if invalid
 * 
 * @example
 * getLastFourDigits('4532123456789012') // Returns: '9012'
 */
export function getLastFourDigits(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) {
    return '';
  }
  return cardNumber.slice(-4);
}

/**
 * Validates if a card number has the correct length
 * Different card types have different valid lengths
 * 
 * @param cardNumber - The card number to validate
 * @returns true if length is valid for any known card type
 */
export function isValidCardLength(cardNumber: string): boolean {
  if (!cardNumber) return false;
  
  const length = cardNumber.replace(/\s/g, '').length;
  
  // Valid lengths for major card types:
  // Visa: 13, 16, 19
  // MasterCard: 16
  // American Express: 15
  // Discover: 16
  // Diners Club: 14
  const validLengths = [13, 14, 15, 16, 19];
  
  return validLengths.includes(length);
}

/**
 * Validates card expiration date
 * Checks if the card is not expired
 * 
 * @param expirationDate - Expiration date in format MM/YY
 * @returns true if card is not expired
 * 
 * @example
 * isCardExpired('12/25') // Returns: false (if current date is before Dec 2025)
 * isCardExpired('01/20') // Returns: true (if current date is after Jan 2020)
 */
export function isCardExpired(expirationDate: string): boolean {
  if (!expirationDate || !expirationDate.includes('/')) {
    return true;
  }
  
  const [month, year] = expirationDate.split('/');
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(`20${year}`, 10);
  
  if (isNaN(expMonth) || isNaN(expYear)) {
    return true;
  }
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = now.getFullYear();
  
  // Card expires at the end of the expiration month
  if (expYear < currentYear) {
    return true;
  }
  
  if (expYear === currentYear && expMonth < currentMonth) {
    return true;
  }
  
  return false;
}

/**
 * Validates if a card status allows transactions
 * Only 'active' cards should be usable
 * 
 * @param status - Card status
 * @returns true if card can be used for transactions
 */
export function isCardUsable(status: string): boolean {
  return status.toLowerCase() === 'active';
}

/**
 * Formats a card number with spaces for better readability
 * Groups of 4 digits separated by spaces
 * ONLY USE WITH MASKED NUMBERS - Never with full card numbers
 * 
 * @param maskedCardNumber - Already masked card number
 * @returns Formatted masked card number
 * 
 * @example
 * formatMaskedCardNumber('****************9012') // Returns: '**** **** **** 9012'
 */
export function formatMaskedCardNumber(maskedCardNumber: string): string {
  // Remove existing spaces
  const cleaned = maskedCardNumber.replace(/\s/g, '');
  
  // Add spaces every 4 characters
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  
  return formatted;
}

/**
 * Sanitizes card data for logging
 * Removes sensitive information before logging
 * 
 * @param cardData - Card data object
 * @returns Sanitized card data safe for logging
 */
export function sanitizeCardDataForLogging(cardData: {
  cardNumber?: string;
  cvv?: string;
  [key: string]: unknown;
}): Record<string, unknown> {
  const sanitized = { ...cardData };
  
  // Remove or mask sensitive fields
  if (sanitized.cardNumber) {
    sanitized.cardNumber = maskCardNumber(sanitized.cardNumber as string);
  }
  
  // Never log CVV
  if (sanitized.cvv) {
    delete sanitized.cvv;
  }
  
  return sanitized;
}

/**
 * Determines card brand from card number
 * Uses industry-standard IIN (Issuer Identification Number) ranges
 * 
 * @param cardNumber - Card number (first 6 digits are enough)
 * @returns Card brand name or 'Unknown'
 */
export function getCardBrand(cardNumber: string): string {
  if (!cardNumber) return 'Unknown';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(cleaned)) {
    return 'Visa';
  }
  
  // MasterCard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2(2[2-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cleaned)) {
    return 'MasterCard';
  }
  
  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleaned)) {
    return 'American Express';
  }
  
  // Discover: starts with 6011, 622126-622925, 644-649, or 65
  if (/^6011|^64[4-9]|^65|^622(1[2-9][6-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5])/.test(cleaned)) {
    return 'Discover';
  }
  
  // Diners Club: starts with 36 or 38 or 300-305
  if (/^3(0[0-5]|[68])/.test(cleaned)) {
    return 'Diners Club';
  }
  
  return 'Unknown';
}

/**
 * Validates complete card data for transaction processing
 * Checks all security requirements before allowing a transaction
 * 
 * @param card - Card object with all relevant data
 * @returns Validation result with success flag and error message
 */
export function validateCardForTransaction(card: {
  cardNumber: string;
  expirationDate: string;
  status: string;
}): { isValid: boolean; error?: string } {
  // Check card number length
  if (!isValidCardLength(card.cardNumber)) {
    return {
      isValid: false,
      error: 'Número de tarjeta inválido'
    };
  }
  
  // Check if card is expired
  if (isCardExpired(card.expirationDate)) {
    return {
      isValid: false,
      error: 'La tarjeta ha expirado'
    };
  }
  
  // Check if card status allows transactions
  if (!isCardUsable(card.status)) {
    return {
      isValid: false,
      error: `La tarjeta está ${card.status}. Solo tarjetas activas pueden ser utilizadas.`
    };
  }
  
  return { isValid: true };
}

/**
 * PCI DSS compliance checker for card display
 * Ensures no full card numbers are being displayed
 * 
 * @param displayText - Text that will be displayed to user
 * @returns true if text is PCI compliant (no full card numbers)
 */
export function isPCICompliantDisplay(displayText: string): boolean {
  // Remove spaces and check for sequences of 13+ digits
  const cleaned = displayText.replace(/\s/g, '');
  
  // Look for patterns that might be full card numbers
  const hasFullCardNumber = /\d{13,19}/.test(cleaned);
  
  // PCI compliant if no full card numbers detected
  return !hasFullCardNumber;
}
