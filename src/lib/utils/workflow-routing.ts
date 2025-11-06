/**
 * Workflow Routing Logic
 * Handles navigation flow between search, selection, and card management screens
 */

/**
 * Workflow routes configuration
 */
export const WORKFLOW_ROUTES = {
  SEARCH: "/customer-search",
  SELECTION: "/customer-search", // Results shown on same page
  CUSTOMER_DETAIL: (id: string) => `/customer-detail/${id}`,
  CARD_MANAGEMENT: (id: string) => `/customer-cards/${id}`,
  PAYMENT: "/payment", // To be implemented in future tasks
} as const;

/**
 * Workflow step enumeration
 */
export type WorkflowStep = "search" | "selection" | "customer-detail" | "cards" | "payment";

/**
 * Workflow step configuration
 */
interface WorkflowStepConfig {
  route: string;
  title: string;
  requiresCustomer: boolean;
  requiresCard: boolean;
}

/**
 * Workflow steps configuration map
 */
const WORKFLOW_STEPS_CONFIG: Record<WorkflowStep, Omit<WorkflowStepConfig, "route">> = {
  search: {
    title: "Búsqueda de cliente",
    requiresCustomer: false,
    requiresCard: false,
  },
  selection: {
    title: "Selección de cliente",
    requiresCustomer: false,
    requiresCard: false,
  },
  "customer-detail": {
    title: "Información del Cliente",
    requiresCustomer: true,
    requiresCard: false,
  },
  cards: {
    title: "Gestión de tarjetas",
    requiresCustomer: true,
    requiresCard: false,
  },
  payment: {
    title: "Procesamiento de pago",
    requiresCustomer: true,
    requiresCard: true,
  },
};

/**
 * Get the next workflow step
 * @param currentStep - Current workflow step
 * @returns Next workflow step or null if at the end
 */
export function getNextWorkflowStep(currentStep: WorkflowStep): WorkflowStep | null {
  const stepOrder: WorkflowStep[] = ["search", "selection", "customer-detail", "cards", "payment"];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }
  
  return stepOrder[currentIndex + 1];
}

/**
 * Get the previous workflow step
 * @param currentStep - Current workflow step
 * @returns Previous workflow step or null if at the beginning
 */
export function getPreviousWorkflowStep(currentStep: WorkflowStep): WorkflowStep | null {
  const stepOrder: WorkflowStep[] = ["search", "selection", "customer-detail", "cards", "payment"];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return stepOrder[currentIndex - 1];
}

/**
 * Validate if navigation is allowed based on workflow requirements
 * @param targetStep - Target workflow step
 * @param hasCustomer - Whether customer is selected
 * @param hasCard - Whether card is selected
 * @returns True if navigation is allowed, false otherwise
 */
export function canNavigateToStep(
  targetStep: WorkflowStep,
  hasCustomer: boolean,
  hasCard: boolean
): boolean {
  const config = WORKFLOW_STEPS_CONFIG[targetStep];
  
  if (config.requiresCustomer && !hasCustomer) {
    return false;
  }
  
  if (config.requiresCard && !hasCard) {
    return false;
  }
  
  return true;
}

/**
 * Get the route for a workflow step
 * @param step - Workflow step
 * @param customerId - Customer ID (required for customer-specific steps)
 * @returns Route path
 */
export function getStepRoute(step: WorkflowStep, customerId?: string): string {
  switch (step) {
    case "search":
    case "selection":
      return WORKFLOW_ROUTES.SEARCH;
    case "customer-detail":
      if (!customerId) throw new Error("Customer ID required for customer detail route");
      return WORKFLOW_ROUTES.CUSTOMER_DETAIL(customerId);
    case "cards":
      if (!customerId) throw new Error("Customer ID required for card management route");
      return WORKFLOW_ROUTES.CARD_MANAGEMENT(customerId);
    case "payment":
      return WORKFLOW_ROUTES.PAYMENT;
    default:
      return WORKFLOW_ROUTES.SEARCH;
  }
}

/**
 * Get workflow step title
 * @param step - Workflow step
 * @returns Step title
 */
export function getStepTitle(step: WorkflowStep): string {
  return WORKFLOW_STEPS_CONFIG[step].title;
}

/**
 * Validate workflow transition
 * Ensures user doesn't skip required steps
 * @param fromStep - Current step
 * @param toStep - Target step
 * @param hasCustomer - Whether customer is selected
 * @param hasCard - Whether card is selected
 * @returns Validation result with error message if invalid
 */
export function validateWorkflowTransition(
  fromStep: WorkflowStep,
  toStep: WorkflowStep,
  hasCustomer: boolean,
  hasCard: boolean
): { valid: boolean; error?: string } {
  // Check if target step requirements are met
  if (!canNavigateToStep(toStep, hasCustomer, hasCard)) {
    const config = WORKFLOW_STEPS_CONFIG[toStep];
    
    if (config.requiresCustomer && !hasCustomer) {
      return {
        valid: false,
        error: "Debe seleccionar un cliente antes de continuar.",
      };
    }
    
    if (config.requiresCard && !hasCard) {
      return {
        valid: false,
        error: "Debe seleccionar una tarjeta antes de continuar.",
      };
    }
  }
  
  return { valid: true };
}

/**
 * Get breadcrumb trail for current workflow step
 * @param currentStep - Current workflow step
 * @param customerId - Customer ID for dynamic routes
 * @returns Array of breadcrumb items
 */
export function getWorkflowBreadcrumbs(
  currentStep: WorkflowStep,
  customerId?: string
): Array<{ label: string; href?: string }> {
  const breadcrumbs: Array<{ label: string; href?: string }> = [];
  
  switch (currentStep) {
    case "search":
    case "selection":
      breadcrumbs.push({ label: "Búsqueda de cliente y pago" });
      break;
    case "customer-detail":
      breadcrumbs.push({ label: "Búsqueda de cliente y pago", href: WORKFLOW_ROUTES.SEARCH });
      breadcrumbs.push({ label: "Información del Cliente" });
      break;
    case "cards":
      breadcrumbs.push({ label: "Búsqueda de cliente y pago", href: WORKFLOW_ROUTES.SEARCH });
      if (customerId) {
        breadcrumbs.push({
          label: "Información del Cliente",
          href: WORKFLOW_ROUTES.CUSTOMER_DETAIL(customerId),
        });
      }
      breadcrumbs.push({ label: "Gestión de tarjetas" });
      break;
    case "payment":
      breadcrumbs.push({ label: "Búsqueda de cliente y pago", href: WORKFLOW_ROUTES.SEARCH });
      if (customerId) {
        breadcrumbs.push({
          label: "Gestión de tarjetas",
          href: WORKFLOW_ROUTES.CARD_MANAGEMENT(customerId),
        });
      }
      breadcrumbs.push({ label: "Procesamiento de pago" });
      break;
  }
  
  return breadcrumbs;
}
