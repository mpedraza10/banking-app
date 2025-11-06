import type { CustomerSearchFilters } from "@/lib/types/customer";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  generalError?: string;
}

/**
 * Validates phone number format (10 digits)
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return true; // Empty is valid (optional field)
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates RFC format (13 alphanumeric characters)
 */
export function validateRFC(rfc: string): boolean {
  if (!rfc) return true; // Empty is valid (optional field)
  const rfcRegex = /^[A-Z0-9]{13}$/i;
  return rfcRegex.test(rfc);
}

/**
 * Validates postal code format (5 digits)
 */
export function validatePostalCode(postalCode: string): boolean {
  if (!postalCode) return true; // Empty is valid (optional field)
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
}

/**
 * Counts the number of filled filter fields
 */
export function countFilledFilters(filters: CustomerSearchFilters): number {
  let count = 0;
  
  // Phone fields
  if (filters.primaryPhone) count++;
  if (filters.secondaryPhone) count++;
  
  // Customer data fields
  if (filters.clientNumber) count++;
  if (filters.firstName) count++;
  if (filters.lastName) count++;
  if (filters.secondLastName) count++;
  if (filters.dateOfBirth) count++;
  if (filters.rfc) count++;
  
  // Address fields (any address component counts as one filter)
  if (filters.stateId || filters.municipalityId || filters.neighborhoodId || filters.postalCode) {
    count++;
  }
  
  // Government ID fields
  if (filters.ife) count++;
  if (filters.passport) count++;
  
  return count;
}

/**
 * Main validation function for customer search filters
 */
export function validateSearchFilters(filters: CustomerSearchFilters): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Rule 1: Minimum two filters required
  const filledFiltersCount = countFilledFilters(filters);
  if (filledFiltersCount < 2) {
    return {
      isValid: false,
      errors: [],
      generalError: "Campos necesarios faltantes. Por favor, llena al menos dos campos para realizar la búsqueda.",
    };
  }
  
  // Rule 2: Validate phone number format (primary phone)
  if (filters.primaryPhone && !validatePhoneNumber(filters.primaryPhone)) {
    errors.push({
      field: "primaryPhone",
      message: "El teléfono de casa debe tener 10 dígitos numéricos",
    });
  }
  
  // Rule 3: Validate phone number format (secondary phone)
  if (filters.secondaryPhone && !validatePhoneNumber(filters.secondaryPhone)) {
    errors.push({
      field: "secondaryPhone",
      message: "El número celular debe tener 10 dígitos numéricos",
    });
  }
  
  // Rule 4: Validate RFC format
  if (filters.rfc && !validateRFC(filters.rfc)) {
    errors.push({
      field: "rfc",
      message: "El RFC debe tener 13 caracteres alfanuméricos",
    });
  }
  
  // Rule 5: Validate postal code format
  if (filters.postalCode && !validatePostalCode(filters.postalCode)) {
    errors.push({
      field: "postalCode",
      message: "El código postal debe tener 5 dígitos numéricos",
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
