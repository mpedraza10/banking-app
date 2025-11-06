"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export type AlertType = "info" | "success" | "warning" | "error";

export interface WorkflowAlertProps {
  /** Alert type */
  type: AlertType;
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Show alert */
  show?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Workflow Alert Component
 * Provides consistent alert messages across workflow screens
 * 
 * Features:
 * - Info, Success, Warning, Error variants
 * - Consistent styling matching Corporate Cashier design
 * - Icon support for visual recognition
 * 
 * @example
 * <WorkflowAlert
 *   type="info"
 *   message="Llena alguno de los campos solicitados para iniciar la búsqueda del cliente."
 * />
 */
export function WorkflowAlert({
  type,
  title,
  message,
  show = true,
  className = "",
}: WorkflowAlertProps) {
  if (!show) return null;

  const config = getAlertConfig(type);

  return (
    <Alert className={`${config.bgColor} ${config.borderColor} border ${className}`}>
      <div className="flex items-start gap-3">
        <config.icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0`} />
        <div className="flex-1">
          {title && (
            <AlertTitle className={`${config.textColor} font-semibold mb-1`}>
              {title}
            </AlertTitle>
          )}
          <AlertDescription className={config.textColor}>
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

function getAlertConfig(type: AlertType) {
  switch (type) {
    case "info":
      return {
        icon: Info,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
        textColor: "text-blue-800",
      };
    case "success":
      return {
        icon: CheckCircle,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconColor: "text-green-600",
        textColor: "text-green-800",
      };
    case "warning":
      return {
        icon: AlertCircle,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-800",
      };
    case "error":
      return {
        icon: XCircle,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
        textColor: "text-red-800",
      };
  }
}

/**
 * Info Banner Component
 * Displays informational messages in a light blue banner
 * Matches the Corporate Cashier design from prototypes
 */
export interface InfoBannerProps {
  message: string;
  className?: string;
}

export function InfoBanner({ message, className = "" }: InfoBannerProps) {
  return (
    <div className={`bg-blue-100 border-l-4 border-blue-500 p-4 ${className}`}>
      <div className="flex items-center">
        <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
        <p className="text-blue-800 text-sm">{message}</p>
      </div>
    </div>
  );
}
