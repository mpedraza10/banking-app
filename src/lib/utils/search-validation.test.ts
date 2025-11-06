import { describe, it, expect } from "vitest";
import {
  validatePhoneNumber,
  validateRFC,
  validatePostalCode,
  countFilledFilters,
  validateSearchFilters,
} from "./search-validation";
import type { CustomerSearchFilters } from "@/lib/types/customer";

describe("Search Validation Utilities", () => {
  describe("validatePhoneNumber", () => {
    it("should return true for empty string", () => {
      expect(validatePhoneNumber("")).toBe(true);
    });

    it("should return true for valid 10-digit phone", () => {
      expect(validatePhoneNumber("5551234567")).toBe(true);
    });

    it("should return false for phone with less than 10 digits", () => {
      expect(validatePhoneNumber("555123456")).toBe(false);
    });

    it("should return false for phone with more than 10 digits", () => {
      expect(validatePhoneNumber("55512345678")).toBe(false);
    });

    it("should return false for phone with non-numeric characters", () => {
      expect(validatePhoneNumber("555-123-4567")).toBe(false);
      expect(validatePhoneNumber("(555)1234567")).toBe(false);
    });
  });

  describe("validateRFC", () => {
    it("should return true for empty string", () => {
      expect(validateRFC("")).toBe(true);
    });

    it("should return true for valid 13-character RFC", () => {
      expect(validateRFC("ABCD123456XYZ")).toBe(true);
      expect(validateRFC("abcd123456xyz")).toBe(true); // Case insensitive
    });

    it("should return false for RFC with less than 13 characters", () => {
      expect(validateRFC("ABCD12345")).toBe(false);
    });

    it("should return false for RFC with more than 13 characters", () => {
      expect(validateRFC("ABCD123456XYZ1")).toBe(false);
    });

    it("should return false for RFC with special characters", () => {
      expect(validateRFC("ABCD-123456XY")).toBe(false);
    });
  });

  describe("validatePostalCode", () => {
    it("should return true for empty string", () => {
      expect(validatePostalCode("")).toBe(true);
    });

    it("should return true for valid 5-digit postal code", () => {
      expect(validatePostalCode("12345")).toBe(true);
    });

    it("should return false for postal code with less than 5 digits", () => {
      expect(validatePostalCode("1234")).toBe(false);
    });

    it("should return false for postal code with more than 5 digits", () => {
      expect(validatePostalCode("123456")).toBe(false);
    });

    it("should return false for postal code with non-numeric characters", () => {
      expect(validatePostalCode("1234A")).toBe(false);
    });
  });

  describe("countFilledFilters", () => {
    it("should return 0 for empty filters", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      expect(countFilledFilters(filters)).toBe(0);
    });

    it("should count phone fields correctly", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "5551234567",
        secondaryPhone: "5559876543",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      expect(countFilledFilters(filters)).toBe(2);
    });

    it("should count address fields as one filter", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "state-1",
        municipalityId: "muni-1",
        neighborhoodId: "neigh-1",
        postalCode: "12345",
        ife: "",
        passport: "",
      };
      // All address components should count as 1
      expect(countFilledFilters(filters)).toBe(1);
    });

    it("should count customer data fields correctly", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "",
        secondaryPhone: "",
        clientNumber: "12345",
        firstName: "John",
        lastName: "Doe",
        secondLastName: "",
        dateOfBirth: "1990-01-01",
        rfc: "ABCD123456XYZ",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      expect(countFilledFilters(filters)).toBe(5);
    });

    it("should count government ID fields correctly", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "12345678901234567890",
        passport: "ABC123456",
      };
      expect(countFilledFilters(filters)).toBe(2);
    });
  });

  describe("validateSearchFilters", () => {
    it("should fail when less than 2 filters are provided", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "5551234567",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.generalError).toBe(
        "Campos necesarios faltantes. Por favor, llena al menos dos campos para realizar la búsqueda."
      );
    });

    it("should pass when exactly 2 valid filters are provided", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "5551234567",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "John",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when phone number format is invalid", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "555",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "John",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("primaryPhone");
    });

    it("should fail when RFC format is invalid", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "5551234567",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "ABC",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("rfc");
    });

    it("should fail when postal code format is invalid", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "5551234567",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "123",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("postalCode");
    });

    it("should accumulate multiple format errors", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "555",
        secondaryPhone: "123",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "ABC",
        stateId: "",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "12",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });

    it("should pass with multiple valid filters including address", () => {
      const filters: CustomerSearchFilters = {
        primaryPhone: "5551234567",
        secondaryPhone: "",
        clientNumber: "",
        firstName: "",
        lastName: "",
        secondLastName: "",
        dateOfBirth: "",
        rfc: "",
        stateId: "state-1",
        municipalityId: "",
        neighborhoodId: "",
        postalCode: "",
        ife: "",
        passport: "",
      };
      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
