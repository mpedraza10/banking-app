"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export interface SystemHealthStatus {
  status: 'online' | 'offline';
  clienteUnicoConnected: boolean;
  iibBrokerConnected: boolean;
  timestamp: string;
}

/**
 * Fetches system health status from the API
 */
async function fetchSystemHealth(): Promise<SystemHealthStatus> {
  const response = await fetch('/api/system/health', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch system health');
  }

  return response.json();
}

/**
 * React hook to check and monitor online mode status
 * Polls the health endpoint periodically to detect connectivity changes
 */
export function useOnlineMode(options?: {
  refetchInterval?: number; // How often to check (in ms), default 30000 (30 seconds)
  onOffline?: () => void; // Callback when system goes offline
  onOnline?: () => void; // Callback when system comes back online
}) {
  const queryClient = useQueryClient();
  const refetchInterval = options?.refetchInterval || 30000; // 30 seconds default

  const {
    data: healthStatus,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchSystemHealth,
    refetchInterval, // Auto-refresh every interval
    refetchOnWindowFocus: true, // Recheck when window gets focus
    retry: 2, // Retry twice if failed
  });

  const isOnline = healthStatus?.status === 'online';
  const isOffline = healthStatus?.status === 'offline' || !!error;

  // Handle offline/online callbacks
  useEffect(() => {
    if (isOffline && options?.onOffline) {
      options.onOffline();
    }
    if (isOnline && options?.onOnline) {
      options.onOnline();
    }
  }, [isOnline, isOffline, options]);

  /**
   * Forces an immediate recheck of online status
   */
  const recheckStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['system-health'] });
    refetch();
  };

  return {
    isOnline,
    isOffline,
    isLoading,
    healthStatus,
    error,
    recheckStatus,
  };
}
