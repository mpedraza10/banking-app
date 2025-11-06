"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Workflow Navigation Props
 * Defines the configuration for workflow navigation buttons
 */
export interface WorkflowNavigationProps {
  /** Show return button */
  showReturn?: boolean;
  /** Return button label */
  returnLabel?: string;
  /** Return button click handler */
  onReturn?: () => void;
  /** Return button destination (if no handler provided) */
  returnTo?: string;
  
  /** Show clear button */
  showClear?: boolean;
  /** Clear button label */
  clearLabel?: string;
  /** Clear button click handler */
  onClear?: () => void;
  
  /** Show accept button */
  showAccept?: boolean;
  /** Accept button label */
  acceptLabel?: string;
  /** Accept button click handler */
  onAccept?: () => void;
  /** Accept button disabled state */
  acceptDisabled?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Workflow Navigation Component
 * Provides consistent navigation buttons across all workflow screens
 * 
 * Features:
 * - Return button: Navigate back to previous screen
 * - Clear button: Reset current form/state
 * - Accept button: Proceed to next step
 * 
 * @example
 * <WorkflowNavigation
 *   showReturn
 *   returnTo="/customer-search"
 *   showAccept
 *   onAccept={handleAccept}
 *   acceptDisabled={!isValid}
 * />
 */
export function WorkflowNavigation({
  showReturn = false,
  returnLabel = "Regresar",
  onReturn,
  returnTo,
  
  showClear = false,
  clearLabel = "Limpiar",
  onClear,
  
  showAccept = false,
  acceptLabel = "Aceptar",
  onAccept,
  acceptDisabled = false,
  
  className = "",
}: WorkflowNavigationProps) {
  const router = useRouter();

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else if (returnTo) {
      router.push(returnTo);
    } else {
      router.back();
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Left side: Return and Clear buttons */}
      <div className="flex items-center gap-3">
        {showReturn && (
          <Button
            variant="outline"
            onClick={handleReturn}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </Button>
        )}
        
        {showClear && (
          <Button
            variant="outline"
            onClick={onClear}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {clearLabel}
          </Button>
        )}
      </div>

      {/* Right side: Accept button */}
      <div>
        {showAccept && (
          <Button
            onClick={onAccept}
            disabled={acceptDisabled}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {acceptLabel}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Workflow Header Component
 * Provides consistent page headers with breadcrumb navigation
 */
export interface WorkflowHeaderProps {
  /** Page title */
  title: string;
  /** Page subtitle or description */
  subtitle?: string;
  /** Breadcrumb items */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  /** Additional CSS classes */
  className?: string;
}

export function WorkflowHeader({
  title,
  subtitle,
  breadcrumbs = [],
  className = "",
}: WorkflowHeaderProps) {
  const router = useRouter();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">›</span>
                )}
                {crumb.href ? (
                  <button
                    onClick={() => router.push(crumb.href!)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-900">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Workflow Container Component
 * Provides consistent layout wrapper for workflow screens
 */
export interface WorkflowContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

export function WorkflowContainer({
  children,
  maxWidth = "2xl",
  className = "",
}: WorkflowContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}
