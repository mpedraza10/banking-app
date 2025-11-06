import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCustomerById } from "../actions/customer-detail";
import { db } from "../db";
import type { Mock } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("Customer Selection Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCustomerById", () => {
    it("should throw error when customer ID is empty", async () => {
      await expect(getCustomerById("")).rejects.toThrow("Failed to fetch customer details");
    });

    it("should throw error when customer ID is whitespace only", async () => {
      await expect(getCustomerById("   ")).rejects.toThrow("Failed to fetch customer details");
    });

    it("should return null when customer is not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as Mock) = mockSelect;

      const result = await getCustomerById("non-existent-id");
      expect(result).toBeNull();
    });

    it("should return customer detail when customer exists with all data", async () => {
      const mockCustomerId = "customer-123";
      const mockCustomerData = {
        id: mockCustomerId,
        firstName: "ISABEL",
        lastName: "ESQUIVEL",
        middleName: "VELAZQUEZ",
        status: "active",
        createdAt: new Date("2024-01-01"),
      };

      const mockAddresses = [
        {
          id: "addr-1",
          street: "GUASIMA 208 COL. JARDINES DE CASA BLANCA",
          postalCode: "81820",
          isPrimary: true,
          stateName: "Sinaloa",
          municipalityName: "Ahome",
          neighborhoodName: "Jardines de Casa Blanca",
        },
      ];

      const mockPhones = [
        { id: "phone-1", number: "6681234567", type: "Casa" },
      ];

      const mockGovIds = [
        { id: "gov-1", type: "RFC", number: "EUVI801124A1A" },
      ];

      // Mock the customer query
      let callCount = 0;
      const mockSelect = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          // First call: customer basic info
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockCustomerData]),
              }),
            }),
          };
        } else if (callCount === 2) {
          // Second call: addresses
          return {
            from: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue(mockAddresses),
            }),
          };
        } else if (callCount === 3) {
          // Third call: phones
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockPhones),
            }),
          };
        } else {
          // Fourth call: government IDs
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockGovIds),
            }),
          };
        }
      });

      (db.select as Mock) = mockSelect;

      const result = await getCustomerById(mockCustomerId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockCustomerId);
      expect(result?.firstName).toBe("ISABEL");
      expect(result?.lastName).toBe("ESQUIVEL");
      expect(result?.secondLastName).toBe("VELAZQUEZ");
      expect(result?.status).toBe("active");
      expect(result?.addresses).toHaveLength(1);
      expect(result?.phones).toHaveLength(1);
      expect(result?.governmentIds).toHaveLength(1);
    });

    it("should handle customer with no addresses", async () => {
      const mockCustomerId = "customer-456";
      const mockCustomerData = {
        id: mockCustomerId,
        firstName: "Juan",
        lastName: "Perez",
        middleName: "Garcia",
        status: "active",
        createdAt: new Date("2024-01-01"),
      };

      let callCount = 0;
      const mockSelect = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockCustomerData]),
              }),
            }),
          };
        } else if (callCount === 2) {
          return {
            from: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        } else if (callCount === 3) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        } else {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        }
      });

      (db.select as Mock) = mockSelect;

      const result = await getCustomerById(mockCustomerId);

      expect(result).not.toBeNull();
      expect(result?.addresses).toHaveLength(0);
      expect(result?.phones).toHaveLength(0);
      expect(result?.governmentIds).toHaveLength(0);
    });

    it("should handle customer with null postal code in address", async () => {
      const mockCustomerId = "customer-789";
      const mockCustomerData = {
        id: mockCustomerId,
        firstName: "Maria",
        lastName: "Lopez",
        middleName: null,
        status: "active",
        createdAt: new Date("2024-01-01"),
      };

      const mockAddresses = [
        {
          id: "addr-1",
          street: "Calle Principal 123",
          postalCode: null,
          isPrimary: true,
          stateName: "Estado",
          municipalityName: "Municipio",
          neighborhoodName: "Colonia",
        },
      ];

      let callCount = 0;
      const mockSelect = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockCustomerData]),
              }),
            }),
          };
        } else if (callCount === 2) {
          return {
            from: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue(mockAddresses),
            }),
          };
        } else if (callCount === 3) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        } else {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        }
      });

      (db.select as Mock) = mockSelect;

      const result = await getCustomerById(mockCustomerId);

      expect(result).not.toBeNull();
      expect(result?.addresses[0].postalCode).toBe("");
    });

    it("should throw error when database query fails", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("Database connection error")),
          }),
        }),
      });

      (db.select as Mock) = mockSelect;

      await expect(getCustomerById("customer-123")).rejects.toThrow(
        "Failed to fetch customer details"
      );
    });

    it("should handle inactive customer status", async () => {
      const mockCustomerId = "customer-inactive";
      const mockCustomerData = {
        id: mockCustomerId,
        firstName: "Pedro",
        lastName: "Martinez",
        middleName: "Rodriguez",
        status: "inactive",
        createdAt: new Date("2024-01-01"),
      };

      let callCount = 0;
      const mockSelect = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockCustomerData]),
              }),
            }),
          };
        } else {
          return {
            from: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        }
      });

      (db.select as Mock) = mockSelect;

      const result = await getCustomerById(mockCustomerId);

      expect(result).not.toBeNull();
      expect(result?.status).toBe("inactive");
    });

    it("should return customer with multiple addresses", async () => {
      const mockCustomerId = "customer-multi";
      const mockCustomerData = {
        id: mockCustomerId,
        firstName: "Ana",
        lastName: "Gomez",
        middleName: "Silva",
        status: "active",
        createdAt: new Date("2024-01-01"),
      };

      const mockAddresses = [
        {
          id: "addr-1",
          street: "Calle Principal 123",
          postalCode: "12345",
          isPrimary: true,
          stateName: "Estado1",
          municipalityName: "Municipio1",
          neighborhoodName: "Colonia1",
        },
        {
          id: "addr-2",
          street: "Calle Secundaria 456",
          postalCode: "67890",
          isPrimary: false,
          stateName: "Estado2",
          municipalityName: "Municipio2",
          neighborhoodName: "Colonia2",
        },
      ];

      let callCount = 0;
      const mockSelect = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockCustomerData]),
              }),
            }),
          };
        } else if (callCount === 2) {
          return {
            from: vi.fn().mockReturnValue({
              leftJoin: vi.fn().mockReturnThis(),
              where: vi.fn().mockResolvedValue(mockAddresses),
            }),
          };
        } else {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        }
      });

      (db.select as Mock) = mockSelect;

      const result = await getCustomerById(mockCustomerId);

      expect(result).not.toBeNull();
      expect(result?.addresses).toHaveLength(2);
      expect(result?.addresses[0].isPrimary).toBe(true);
      expect(result?.addresses[1].isPrimary).toBe(false);
    });
  });
});
