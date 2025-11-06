/**
 * Performance monitoring utilities for customer search system
 * Tracks response times and ensures 3-second search requirement
 */

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceThresholds {
  customerSearch: number; // 3 seconds
  customerDetail: number; // 2 seconds
  cardRetrieval: number; // 2 seconds
  navigation: number; // 1 second
}

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  customerSearch: 3000, // 3 seconds
  customerDetail: 2000, // 2 seconds
  cardRetrieval: 2000, // 2 seconds
  navigation: 1000, // 1 second
};

const performanceMetrics: PerformanceMetric[] = [];

/**
 * Starts tracking performance for an operation
 */
export function startPerformanceTracking(
  operation: string,
  metadata?: Record<string, unknown>
): PerformanceMetric {
  const metric: PerformanceMetric = {
    operation,
    startTime: performance.now(),
    metadata,
  };

  performanceMetrics.push(metric);
  
  return metric;
}

/**
 * Ends tracking and calculates duration
 */
export function endPerformanceTracking(metric: PerformanceMetric): number {
  metric.endTime = performance.now();
  metric.duration = metric.endTime - metric.startTime;

  // Check if operation exceeded threshold
  const threshold = getThreshold(metric.operation);
  if (threshold && metric.duration > threshold) {
    console.warn(
      `Performance threshold exceeded for ${metric.operation}: ${metric.duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  }

  return metric.duration;
}

/**
 * Gets the performance threshold for an operation
 */
function getThreshold(operation: string): number | null {
  const operationLower = operation.toLowerCase();
  
  if (operationLower.includes('search')) {
    return PERFORMANCE_THRESHOLDS.customerSearch;
  }
  if (operationLower.includes('detail') || operationLower.includes('customer')) {
    return PERFORMANCE_THRESHOLDS.customerDetail;
  }
  if (operationLower.includes('card')) {
    return PERFORMANCE_THRESHOLDS.cardRetrieval;
  }
  if (operationLower.includes('nav') || operationLower.includes('route')) {
    return PERFORMANCE_THRESHOLDS.navigation;
  }
  
  return null;
}

/**
 * Convenience function to track an async operation
 */
export async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const metric = startPerformanceTracking(operation, metadata);
  
  try {
    const result = await fn();
    endPerformanceTracking(metric);
    return result;
  } catch (error) {
    endPerformanceTracking(metric);
    throw error;
  }
}

/**
 * Gets all performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...performanceMetrics];
}

/**
 * Gets performance metrics for a specific operation
 */
export function getMetricsForOperation(operation: string): PerformanceMetric[] {
  return performanceMetrics.filter(m => m.operation === operation);
}

/**
 * Calculates average duration for an operation
 */
export function getAverageDuration(operation: string): number | null {
  const metrics = getMetricsForOperation(operation).filter(m => m.duration !== undefined);
  
  if (metrics.length === 0) {
    return null;
  }
  
  const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
  return totalDuration / metrics.length;
}

/**
 * Checks if an operation is meeting performance requirements
 */
export function isPerformanceWithinThreshold(operation: string): boolean {
  const threshold = getThreshold(operation);
  if (!threshold) {
    return true; // No threshold defined
  }
  
  const avgDuration = getAverageDuration(operation);
  if (avgDuration === null) {
    return true; // No data yet
  }
  
  return avgDuration <= threshold;
}

/**
 * Generates a performance report
 */
export function generatePerformanceReport(): {
  operation: string;
  count: number;
  avgDuration: number;
  threshold: number | null;
  withinThreshold: boolean;
}[] {
  const operations = [...new Set(performanceMetrics.map(m => m.operation))];
  
  return operations.map(operation => {
    const metrics = getMetricsForOperation(operation);
    const avgDuration = getAverageDuration(operation) || 0;
    const threshold = getThreshold(operation);
    
    return {
      operation,
      count: metrics.length,
      avgDuration,
      threshold,
      withinThreshold: threshold ? avgDuration <= threshold : true,
    };
  });
}

/**
 * Clears all performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

/**
 * Logs performance metrics to console (for debugging)
 */
export function logPerformanceReport(): void {
  const report = generatePerformanceReport();
  
  console.group('Performance Report');
  report.forEach(r => {
    const statusIcon = r.withinThreshold ? '✓' : '✗';
    console.log(
      `${statusIcon} ${r.operation}: ${r.avgDuration.toFixed(2)}ms avg (${r.count} samples) ${r.threshold ? `[threshold: ${r.threshold}ms]` : ''}`
    );
  });
  console.groupEnd();
}
