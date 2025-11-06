import { describe, it, expect } from "vitest";
import {
  WORKFLOW_ROUTES,
  getNextWorkflowStep,
  getPreviousWorkflowStep,
  canNavigateToStep,
  getStepRoute,
  getStepTitle,
  validateWorkflowTransition,
  getWorkflowBreadcrumbs,
  type WorkflowStep,
} from "./workflow-routing";

describe("Workflow Routing Logic", () => {
  describe("WORKFLOW_ROUTES", () => {
    it("should have correct route paths", () => {
      expect(WORKFLOW_ROUTES.SEARCH).toBe("/customer-search");
      expect(WORKFLOW_ROUTES.SELECTION).toBe("/customer-search");
      expect(WORKFLOW_ROUTES.CUSTOMER_DETAIL("123")).toBe("/customer-detail/123");
      expect(WORKFLOW_ROUTES.CARD_MANAGEMENT("456")).toBe("/customer-cards/456");
      expect(WORKFLOW_ROUTES.PAYMENT).toBe("/payment");
    });
  });

  describe("getNextWorkflowStep", () => {
    it("should return correct next step", () => {
      expect(getNextWorkflowStep("search")).toBe("selection");
      expect(getNextWorkflowStep("selection")).toBe("customer-detail");
      expect(getNextWorkflowStep("customer-detail")).toBe("cards");
      expect(getNextWorkflowStep("cards")).toBe("payment");
    });

    it("should return null for last step", () => {
      expect(getNextWorkflowStep("payment")).toBeNull();
    });
  });

  describe("getPreviousWorkflowStep", () => {
    it("should return correct previous step", () => {
      expect(getPreviousWorkflowStep("payment")).toBe("cards");
      expect(getPreviousWorkflowStep("cards")).toBe("customer-detail");
      expect(getPreviousWorkflowStep("customer-detail")).toBe("selection");
      expect(getPreviousWorkflowStep("selection")).toBe("search");
    });

    it("should return null for first step", () => {
      expect(getPreviousWorkflowStep("search")).toBeNull();
    });
  });

  describe("canNavigateToStep", () => {
    it("should allow navigation to search/selection without requirements", () => {
      expect(canNavigateToStep("search", false, false)).toBe(true);
      expect(canNavigateToStep("selection", false, false)).toBe(true);
    });

    it("should require customer for customer-detail step", () => {
      expect(canNavigateToStep("customer-detail", false, false)).toBe(false);
      expect(canNavigateToStep("customer-detail", true, false)).toBe(true);
    });

    it("should require customer for cards step", () => {
      expect(canNavigateToStep("cards", false, false)).toBe(false);
      expect(canNavigateToStep("cards", true, false)).toBe(true);
    });

    it("should require both customer and card for payment step", () => {
      expect(canNavigateToStep("payment", false, false)).toBe(false);
      expect(canNavigateToStep("payment", true, false)).toBe(false);
      expect(canNavigateToStep("payment", false, true)).toBe(false);
      expect(canNavigateToStep("payment", true, true)).toBe(true);
    });
  });

  describe("getStepRoute", () => {
    it("should return correct route for search/selection", () => {
      expect(getStepRoute("search")).toBe("/customer-search");
      expect(getStepRoute("selection")).toBe("/customer-search");
    });

    it("should return correct route for customer-detail", () => {
      expect(getStepRoute("customer-detail", "123")).toBe("/customer-detail/123");
    });

    it("should throw error if customer ID missing for customer-detail", () => {
      expect(() => getStepRoute("customer-detail")).toThrow(
        "Customer ID required for customer detail route"
      );
    });

    it("should return correct route for cards", () => {
      expect(getStepRoute("cards", "456")).toBe("/customer-cards/456");
    });

    it("should throw error if customer ID missing for cards", () => {
      expect(() => getStepRoute("cards")).toThrow(
        "Customer ID required for card management route"
      );
    });

    it("should return correct route for payment", () => {
      expect(getStepRoute("payment")).toBe("/payment");
    });
  });

  describe("getStepTitle", () => {
    it("should return correct titles for all steps", () => {
      expect(getStepTitle("search")).toBe("Búsqueda de cliente");
      expect(getStepTitle("selection")).toBe("Selección de cliente");
      expect(getStepTitle("customer-detail")).toBe("Información del Cliente");
      expect(getStepTitle("cards")).toBe("Gestión de tarjetas");
      expect(getStepTitle("payment")).toBe("Procesamiento de pago");
    });
  });

  describe("validateWorkflowTransition", () => {
    it("should allow valid transitions", () => {
      const result1 = validateWorkflowTransition("search", "selection", false, false);
      expect(result1.valid).toBe(true);

      const result2 = validateWorkflowTransition("selection", "customer-detail", true, false);
      expect(result2.valid).toBe(true);

      const result3 = validateWorkflowTransition("customer-detail", "cards", true, false);
      expect(result3.valid).toBe(true);

      const result4 = validateWorkflowTransition("cards", "payment", true, true);
      expect(result4.valid).toBe(true);
    });

    it("should reject transition to customer-detail without customer", () => {
      const result = validateWorkflowTransition("selection", "customer-detail", false, false);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Debe seleccionar un cliente antes de continuar.");
    });

    it("should reject transition to cards without customer", () => {
      const result = validateWorkflowTransition("customer-detail", "cards", false, false);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Debe seleccionar un cliente antes de continuar.");
    });

    it("should reject transition to payment without customer", () => {
      const result = validateWorkflowTransition("cards", "payment", false, false);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Debe seleccionar un cliente antes de continuar.");
    });

    it("should reject transition to payment without card", () => {
      const result = validateWorkflowTransition("cards", "payment", true, false);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Debe seleccionar una tarjeta antes de continuar.");
    });
  });

  describe("getWorkflowBreadcrumbs", () => {
    it("should return correct breadcrumbs for search", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("search");
      expect(breadcrumbs).toEqual([{ label: "Búsqueda de cliente y pago" }]);
    });

    it("should return correct breadcrumbs for selection", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("selection");
      expect(breadcrumbs).toEqual([{ label: "Búsqueda de cliente y pago" }]);
    });

    it("should return correct breadcrumbs for customer-detail", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("customer-detail");
      expect(breadcrumbs).toEqual([
        { label: "Búsqueda de cliente y pago", href: "/customer-search" },
        { label: "Información del Cliente" },
      ]);
    });

    it("should return correct breadcrumbs for cards with customer ID", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("cards", "123");
      expect(breadcrumbs).toEqual([
        { label: "Búsqueda de cliente y pago", href: "/customer-search" },
        { label: "Información del Cliente", href: "/customer-detail/123" },
        { label: "Gestión de tarjetas" },
      ]);
    });

    it("should return breadcrumbs for cards without customer ID", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("cards");
      expect(breadcrumbs).toEqual([
        { label: "Búsqueda de cliente y pago", href: "/customer-search" },
        { label: "Gestión de tarjetas" },
      ]);
    });

    it("should return correct breadcrumbs for payment with customer ID", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("payment", "456");
      expect(breadcrumbs).toEqual([
        { label: "Búsqueda de cliente y pago", href: "/customer-search" },
        { label: "Gestión de tarjetas", href: "/customer-cards/456" },
        { label: "Procesamiento de pago" },
      ]);
    });

    it("should return breadcrumbs for payment without customer ID", () => {
      const breadcrumbs = getWorkflowBreadcrumbs("payment");
      expect(breadcrumbs).toEqual([
        { label: "Búsqueda de cliente y pago", href: "/customer-search" },
        { label: "Procesamiento de pago" },
      ]);
    });
  });
});
