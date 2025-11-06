"use server";

export interface SystemHealthStatus {
  status: 'online' | 'offline';
  clienteUnicoConnected: boolean;
  iibBrokerConnected: boolean;
  timestamp: Date;
}

/**
 * Validates that the system is in online mode before allowing operations
 * Required for customer search and payment processing
 */
export async function validateOnlineMode(): Promise<{
  isOnline: boolean;
  status: SystemHealthStatus;
}> {
  try {
    // Call the health check API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/system/health`,
      {
        method: 'GET',
        cache: 'no-store', // Always fetch fresh status
      }
    );

    const healthData: SystemHealthStatus = await response.json();

    const isOnline = healthData.status === 'online';

    return {
      isOnline,
      status: healthData,
    };
  } catch (error) {
    console.error('Error validating online mode:', error);
    
    // If health check fails, assume offline
    return {
      isOnline: false,
      status: {
        status: 'offline',
        clienteUnicoConnected: false,
        iibBrokerConnected: false,
        timestamp: new Date(),
      },
    };
  }
}

/**
 * Validates online mode and throws error if offline
 * Use this before operations that require online mode
 */
export async function requireOnlineMode(): Promise<void> {
  const { isOnline, status } = await validateOnlineMode();

  if (!isOnline) {
    const reasons = [];
    if (!status.clienteUnicoConnected) {
      reasons.push('Cliente Único no disponible');
    }
    if (!status.iibBrokerConnected) {
      reasons.push('IIB Broker no disponible');
    }

    throw new Error(
      `Sistema en modo fuera de línea. ${reasons.join(', ')}. Por favor, verifica la conectividad de red.`
    );
  }
}
