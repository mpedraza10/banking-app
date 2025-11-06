import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WorkflowProvider, useWorkflow, useWorkflowState } from "./workflow-context";
import type { ReactNode } from "react";
import type { CustomerSearchFilters, CustomerSearchResult } from "@/lib/types/customer";

// Wrapper component for testing
const wrapper = ({ children }: { children: ReactNode }) => (
  <WorkflowProvider>{children}</WorkflowProvider>
);

describe("WorkflowContext", () => {
  describe("useWorkflow Hook", () => {
    it("should provide initial state", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      expect(result.current.searchFilters).toBeNull();
      expect(result.current.searchResults).toBeNull();
      expect(result.current.selectedCustomerId).toBeNull();
      expect(result.current.selectedCustomerName).toBeNull();
      expect(result.current.selectedCardId).toBeNull();
      expect(result.current.currentStep).toBeNull();
      expect(result.current.navigationHistory).toEqual([]);
    });

    it("should throw error when used outside provider", () => {
      // Suppress console errors for this test
      const consoleError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useWorkflow());
      }).toThrow("useWorkflow must be used within a WorkflowProvider");

      console.error = consoleError;
    });
  });

  describe("Search Actions", () => {
    it("should set search filters", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      const filters: CustomerSearchFilters = {
        primaryPhone: "1234567890",
        clientNumber: "12345",
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
        secondaryPhone: "",
      };

      act(() => {
        result.current.setSearchFilters(filters);
      });

      expect(result.current.searchFilters).toEqual(filters);
      expect(result.current.currentStep).toBe("search");
    });

    it("should set search results", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      const results: CustomerSearchResult[] = [
        {
          id: "1",
          customerNumber: "12345",
          firstName: "John",
          lastName: "Doe",
          secondLastName: "Smith",
          rfc: "ABCD123456EFG",
          primaryAddress: "123 Main St",
          primaryPhone: "1234567890",
          status: "active",
        },
      ];

      act(() => {
        result.current.setSearchResults(results);
      });

      expect(result.current.searchResults).toEqual(results);
      expect(result.current.currentStep).toBe("selection");
    });

    it("should clear search", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      // First set some data
      act(() => {
        result.current.setSearchFilters({
          primaryPhone: "1234567890",
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
          secondaryPhone: "",
        });
        result.current.selectCustomer("123", "John Doe");
      });

      // Then clear it
      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchFilters).toBeNull();
      expect(result.current.searchResults).toBeNull();
      expect(result.current.selectedCustomerId).toBeNull();
      expect(result.current.selectedCustomerName).toBeNull();
      expect(result.current.selectedCardId).toBeNull();
      expect(result.current.currentStep).toBe("search");
    });
  });

  describe("Customer Selection Actions", () => {
    it("should select customer", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      act(() => {
        result.current.selectCustomer("123", "John Doe");
      });

      expect(result.current.selectedCustomerId).toBe("123");
      expect(result.current.selectedCustomerName).toBe("John Doe");
      expect(result.current.currentStep).toBe("cards");
    });

    it("should clear customer selection", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      // First select a customer and card
      act(() => {
        result.current.selectCustomer("123", "John Doe");
        result.current.selectCard("card-1", "Visa", "1234");
      });

      // Then clear customer selection
      act(() => {
        result.current.clearCustomerSelection();
      });

      expect(result.current.selectedCustomerId).toBeNull();
      expect(result.current.selectedCustomerName).toBeNull();
      expect(result.current.selectedCardId).toBeNull();
      expect(result.current.selectedCardType).toBeNull();
      expect(result.current.selectedCardLastFour).toBeNull();
      expect(result.current.currentStep).toBe("selection");
    });
  });

  describe("Card Selection Actions", () => {
    it("should select card", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      act(() => {
        result.current.selectCard("card-1", "Visa", "1234");
      });

      expect(result.current.selectedCardId).toBe("card-1");
      expect(result.current.selectedCardType).toBe("Visa");
      expect(result.current.selectedCardLastFour).toBe("1234");
      expect(result.current.currentStep).toBe("payment");
    });

    it("should clear card selection", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      // First select a card
      act(() => {
        result.current.selectCard("card-1", "Visa", "1234");
      });

      // Then clear it
      act(() => {
        result.current.clearCardSelection();
      });

      expect(result.current.selectedCardId).toBeNull();
      expect(result.current.selectedCardType).toBeNull();
      expect(result.current.selectedCardLastFour).toBeNull();
      expect(result.current.currentStep).toBe("cards");
    });
  });

  describe("Navigation Actions", () => {
    it("should set current step", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      act(() => {
        result.current.setCurrentStep("search");
      });

      expect(result.current.currentStep).toBe("search");

      act(() => {
        result.current.setCurrentStep("payment");
      });

      expect(result.current.currentStep).toBe("payment");
    });

    it("should push navigation history", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      act(() => {
        result.current.pushNavigation("/customer-search");
      });

      expect(result.current.navigationHistory).toEqual(["/customer-search"]);

      act(() => {
        result.current.pushNavigation("/customer-detail/123");
      });

      expect(result.current.navigationHistory).toEqual([
        "/customer-search",
        "/customer-detail/123",
      ]);
    });

    it("should pop navigation history", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      // Build navigation history
      act(() => {
        result.current.pushNavigation("/customer-search");
        result.current.pushNavigation("/customer-detail/123");
        result.current.pushNavigation("/customer-cards/123");
      });

      // Pop one item
      let poppedPath: string | null = null;
      act(() => {
        poppedPath = result.current.popNavigation();
      });

      expect(poppedPath).toBe("/customer-cards/123");
      expect(result.current.navigationHistory).toEqual([
        "/customer-search",
        "/customer-detail/123",
      ]);

      // Pop another
      act(() => {
        poppedPath = result.current.popNavigation();
      });

      expect(poppedPath).toBe("/customer-detail/123");
      expect(result.current.navigationHistory).toEqual(["/customer-search"]);
    });

    it("should return null when popping empty history", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      let poppedPath: string | null = null;
      act(() => {
        poppedPath = result.current.popNavigation();
      });

      expect(poppedPath).toBeNull();
      expect(result.current.navigationHistory).toEqual([]);
    });
  });

  describe("Full Workflow Reset", () => {
    it("should reset all workflow state", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      // Set up complex state
      act(() => {
        result.current.setSearchFilters({
          primaryPhone: "1234567890",
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
          secondaryPhone: "",
        });
        result.current.selectCustomer("123", "John Doe");
        result.current.selectCard("card-1", "Visa", "1234");
        result.current.pushNavigation("/customer-search");
        result.current.pushNavigation("/customer-detail/123");
      });

      // Reset everything
      act(() => {
        result.current.resetWorkflow();
      });

      expect(result.current.searchFilters).toBeNull();
      expect(result.current.searchResults).toBeNull();
      expect(result.current.selectedCustomerId).toBeNull();
      expect(result.current.selectedCustomerName).toBeNull();
      expect(result.current.selectedCardId).toBeNull();
      expect(result.current.selectedCardType).toBeNull();
      expect(result.current.selectedCardLastFour).toBeNull();
      expect(result.current.currentStep).toBeNull();
      expect(result.current.navigationHistory).toEqual([]);
    });
  });

  describe("useWorkflowState Hook", () => {
    it("should provide read-only state", () => {
      const { result } = renderHook(() => useWorkflowState(), { wrapper });

      expect(result.current.searchFilters).toBeNull();
      expect(result.current.currentStep).toBeNull();
      
      // Should not have action functions (checking by casting to unknown first)
      const resultAsUnknown = result.current as unknown as Record<string, unknown>;
      expect(resultAsUnknown.setSearchFilters).toBeUndefined();
      expect(resultAsUnknown.resetWorkflow).toBeUndefined();
    });

    it("should throw error when used outside provider", () => {
      // Suppress console errors for this test
      const consoleError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useWorkflowState());
      }).toThrow("useWorkflowState must be used within a WorkflowProvider");

      console.error = consoleError;
    });
  });

  describe("getState Method", () => {
    it("should return current state snapshot", () => {
      const { result } = renderHook(() => useWorkflow(), { wrapper });

      // Set some state
      act(() => {
        result.current.selectCustomer("123", "John Doe");
        result.current.selectCard("card-1", "Visa", "1234");
      });

      const snapshot = result.current.getState();

      expect(snapshot.selectedCustomerId).toBe("123");
      expect(snapshot.selectedCustomerName).toBe("John Doe");
      expect(snapshot.selectedCardId).toBe("card-1");
      expect(snapshot.selectedCardType).toBe("Visa");
      expect(snapshot.selectedCardLastFour).toBe("1234");
      expect(snapshot.currentStep).toBe("payment");
    });
  });
});
