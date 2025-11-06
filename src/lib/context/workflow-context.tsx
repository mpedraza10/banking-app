"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { CustomerSearchFilters, CustomerSearchResult } from "@/lib/types/customer";

/**
 * Workflow Session State
 * Maintains context throughout the workflow navigation
 */
export interface WorkflowSessionState {
  // Search context
  searchFilters: CustomerSearchFilters | null;
  searchResults: CustomerSearchResult[] | null;
  
  // Selected customer context
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  
  // Selected card context
  selectedCardId: string | null;
  selectedCardType: string | null;
  selectedCardLastFour: string | null;
  
  // Workflow state
  currentStep: "search" | "selection" | "cards" | "payment" | null;
  
  // Navigation history for proper back navigation
  navigationHistory: string[];
}

/**
 * Workflow Context Actions
 */
interface WorkflowContextActions {
  // Search actions
  setSearchFilters: (filters: CustomerSearchFilters) => void;
  setSearchResults: (results: CustomerSearchResult[]) => void;
  clearSearch: () => void;
  
  // Customer selection actions
  selectCustomer: (customerId: string, customerName: string) => void;
  clearCustomerSelection: () => void;
  
  // Card selection actions
  selectCard: (cardId: string, cardType: string, lastFour: string) => void;
  clearCardSelection: () => void;
  
  // Workflow navigation actions
  setCurrentStep: (step: WorkflowSessionState["currentStep"]) => void;
  pushNavigation: (path: string) => void;
  popNavigation: () => string | null;
  
  // Full reset
  resetWorkflow: () => void;
  
  // Get current state
  getState: () => WorkflowSessionState;
}

type WorkflowContextType = WorkflowSessionState & WorkflowContextActions;

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

/**
 * Initial workflow state
 */
const initialState: WorkflowSessionState = {
  searchFilters: null,
  searchResults: null,
  selectedCustomerId: null,
  selectedCustomerName: null,
  selectedCardId: null,
  selectedCardType: null,
  selectedCardLastFour: null,
  currentStep: null,
  navigationHistory: [],
};

/**
 * Workflow Provider Component
 * Provides workflow session state management throughout the application
 * 
 * Features:
 * - Search context preservation
 * - Customer selection state
 * - Card selection state
 * - Navigation history tracking
 * - Complete workflow reset
 * 
 * @example
 * <WorkflowProvider>
 *   <YourApp />
 * </WorkflowProvider>
 */
export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkflowSessionState>(initialState);

  // Search actions
  const setSearchFilters = useCallback((filters: CustomerSearchFilters) => {
    setState((prev) => ({
      ...prev,
      searchFilters: filters,
      currentStep: "search",
    }));
  }, []);

  const setSearchResults = useCallback((results: CustomerSearchResult[]) => {
    setState((prev) => ({
      ...prev,
      searchResults: results,
      currentStep: "selection",
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchFilters: null,
      searchResults: null,
      selectedCustomerId: null,
      selectedCustomerName: null,
      selectedCardId: null,
      selectedCardType: null,
      selectedCardLastFour: null,
      currentStep: "search",
    }));
  }, []);

  // Customer selection actions
  const selectCustomer = useCallback((customerId: string, customerName: string) => {
    setState((prev) => ({
      ...prev,
      selectedCustomerId: customerId,
      selectedCustomerName: customerName,
      currentStep: "cards",
    }));
  }, []);

  const clearCustomerSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCustomerId: null,
      selectedCustomerName: null,
      selectedCardId: null,
      selectedCardType: null,
      selectedCardLastFour: null,
      currentStep: "selection",
    }));
  }, []);

  // Card selection actions
  const selectCard = useCallback((cardId: string, cardType: string, lastFour: string) => {
    setState((prev) => ({
      ...prev,
      selectedCardId: cardId,
      selectedCardType: cardType,
      selectedCardLastFour: lastFour,
      currentStep: "payment",
    }));
  }, []);

  const clearCardSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCardId: null,
      selectedCardType: null,
      selectedCardLastFour: null,
      currentStep: "cards",
    }));
  }, []);

  // Workflow navigation actions
  const setCurrentStep = useCallback((step: WorkflowSessionState["currentStep"]) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const pushNavigation = useCallback((path: string) => {
    setState((prev) => ({
      ...prev,
      navigationHistory: [...prev.navigationHistory, path],
    }));
  }, []);

  const popNavigation = useCallback(() => {
    let poppedPath: string | null = null;
    setState((prev) => {
      const newHistory = [...prev.navigationHistory];
      poppedPath = newHistory.pop() || null;
      return {
        ...prev,
        navigationHistory: newHistory,
      };
    });
    return poppedPath;
  }, []);

  // Full reset
  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  // Get current state
  const getState = useCallback(() => state, [state]);

  const value: WorkflowContextType = {
    ...state,
    setSearchFilters,
    setSearchResults,
    clearSearch,
    selectCustomer,
    clearCustomerSelection,
    selectCard,
    clearCardSelection,
    setCurrentStep,
    pushNavigation,
    popNavigation,
    resetWorkflow,
    getState,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

/**
 * useWorkflow Hook
 * Access workflow session state and actions
 * 
 * @example
 * const { selectedCustomerId, selectCustomer, resetWorkflow } = useWorkflow();
 * 
 * // Select a customer
 * selectCustomer("123", "John Doe");
 * 
 * // Reset entire workflow
 * resetWorkflow();
 */
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  
  return context;
}

/**
 * useWorkflowState Hook
 * Access only the workflow state (no actions)
 * Useful for components that only need to read state
 * 
 * @example
 * const { selectedCustomerId, currentStep } = useWorkflowState();
 */
export function useWorkflowState() {
  const context = useContext(WorkflowContext);
  
  if (context === undefined) {
    throw new Error("useWorkflowState must be used within a WorkflowProvider");
  }
  
  const {
    searchFilters,
    searchResults,
    selectedCustomerId,
    selectedCustomerName,
    selectedCardId,
    selectedCardType,
    selectedCardLastFour,
    currentStep,
    navigationHistory,
  } = context;
  
  return {
    searchFilters,
    searchResults,
    selectedCustomerId,
    selectedCustomerName,
    selectedCardId,
    selectedCardType,
    selectedCardLastFour,
    currentStep,
    navigationHistory,
  };
}
