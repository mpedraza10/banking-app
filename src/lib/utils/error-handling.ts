/**
 * Error handling utilities for customer search system
 * Provides consistent error messages and user feedback
 */

export interface UserFeedbackMessage {
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  action?: () => void;
}

/**
 * Maps technical errors to user-friendly messages
 */
export function mapErrorToUserMessage(error: unknown): UserFeedbackMessage {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Network connectivity errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    return {
      type: 'error',
      title: 'Error de conectividad',
      message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
      actionLabel: 'Reintentar',
    };
  }

  // Online mode errors
  if (errorMessage.includes('fuera de línea') || errorMessage.includes('offline')) {
    return {
      type: 'error',
      title: 'Sistema fuera de línea',
      message: 'El sistema no está en modo en línea. Por favor, verifica la conectividad con Cliente Único y el IIB Broker.',
      actionLabel: 'Verificar estado',
    };
  }

  // Validation errors
  if (errorMessage.includes('Campos necesarios faltantes')) {
    return {
      type: 'warning',
      title: 'Campos necesarios faltantes',
      message: 'Se requieren al menos dos filtros de búsqueda. Por favor, completa más campos para continuar.',
    };
  }

  if (errorMessage.includes('Formato inválido')) {
    return {
      type: 'warning',
      title: 'Formato inválido',
      message: errorMessage,
    };
  }

  // No results errors
  if (errorMessage.includes('No hay información de búsqueda')) {
    return {
      type: 'info',
      title: 'No hay información de búsqueda',
      message: 'No se encontraron clientes que coincidan con los criterios de búsqueda. Por favor, intenta con diferentes filtros.',
    };
  }

  // Card loading errors
  if (errorMessage.includes('No se pudieron cargar las Tarjetas')) {
    return {
      type: 'error',
      title: 'Error al cargar tarjetas',
      message: 'No se pudieron cargar las tarjetas del cliente. Por favor, intenta nuevamente.',
      actionLabel: 'Reintentar',
    };
  }

  // Customer not found
  if (errorMessage.includes('Cliente no encontrado') || errorMessage.includes('not found')) {
    return {
      type: 'error',
      title: 'Cliente no encontrado',
      message: 'No se encontró el cliente solicitado. Por favor, verifica el identificador e intenta nuevamente.',
    };
  }

  // Authentication errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('No autorizado')) {
    return {
      type: 'error',
      title: 'Sesión expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      actionLabel: 'Iniciar sesión',
    };
  }

  // Database errors
  if (errorMessage.includes('database') || errorMessage.includes('query failed')) {
    return {
      type: 'error',
      title: 'Error del sistema',
      message: 'Ocurrió un error al acceder a la base de datos. Por favor, intenta nuevamente en unos momentos.',
      actionLabel: 'Reintentar',
    };
  }

  // Generic error
  return {
    type: 'error',
    title: 'Error inesperado',
    message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta al soporte técnico si el problema persiste.',
    actionLabel: 'Reintentar',
  };
}

/**
 * Specific error messages defined in requirements
 */
export const REQUIRED_ERROR_MESSAGES = {
  MISSING_FILTERS: 'Campos necesarios faltantes',
  NO_RESULTS: 'No hay información de búsqueda',
  CARD_LOAD_FAILED: 'No se pudieron cargar las Tarjetas',
  OFFLINE_MODE: 'Sistema en modo fuera de línea',
  NETWORK_ERROR: 'Error de conectividad de red',
  SESSION_EXPIRED: 'Sesión expirada',
  CUSTOMER_NOT_FOUND: 'Cliente no encontrado',
  INVALID_FORMAT: 'Formato inválido',
} as const;

/**
 * Creates a user-friendly error message for missing filters
 */
export function createMissingFiltersMessage(filledCount: number, requiredCount: number = 2): UserFeedbackMessage {
  return {
    type: 'warning',
    title: REQUIRED_ERROR_MESSAGES.MISSING_FILTERS,
    message: `Se requieren al menos ${requiredCount} filtros de búsqueda. Actualmente has completado ${filledCount}.`,
  };
}

/**
 * Creates a user-friendly error message for no search results
 */
export function createNoResultsMessage(searchCriteria: Record<string, string>): UserFeedbackMessage {
  const criteriaCount = Object.values(searchCriteria).filter(v => v && v.trim() !== '').length;
  
  return {
    type: 'info',
    title: REQUIRED_ERROR_MESSAGES.NO_RESULTS,
    message: `No se encontraron clientes que coincidan con los ${criteriaCount} criterios de búsqueda. Por favor, intenta con filtros diferentes o menos restrictivos.`,
  };
}

/**
 * Creates a user-friendly error message for card loading failures
 */
export function createCardLoadFailureMessage(customerId: string): UserFeedbackMessage {
  return {
    type: 'error',
    title: REQUIRED_ERROR_MESSAGES.CARD_LOAD_FAILED,
    message: 'No se pudieron cargar las tarjetas asociadas a este cliente. Por favor, verifica la conectividad e intenta nuevamente.',
    actionLabel: 'Reintentar',
  };
}

/**
 * Creates a user-friendly error message for offline mode
 */
export function createOfflineModeMessage(reasons: string[]): UserFeedbackMessage {
  const reasonsText = reasons.length > 0 ? reasons.join(', ') : 'Sin conexión';
  
  return {
    type: 'error',
    title: REQUIRED_ERROR_MESSAGES.OFFLINE_MODE,
    message: `El sistema no puede realizar operaciones en este momento. ${reasonsText}. Por favor, verifica la conectividad de red.`,
    actionLabel: 'Verificar estado',
  };
}

/**
 * Handles async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (message: UserFeedbackMessage) => void
): Promise<{ data: T | null; error: UserFeedbackMessage | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const userMessage = mapErrorToUserMessage(error);
    
    if (onError) {
      onError(userMessage);
    }
    
    return { data: null, error: userMessage };
  }
}
