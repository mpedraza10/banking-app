import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface SystemHealthResponse {
  status: 'online' | 'offline';
  clienteUnicoConnected: boolean;
  iibBrokerConnected: boolean;
  timestamp: string;
}

/**
 * Check database connectivity
 */
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to verify database connectivity
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Check IIB Broker connectivity
 * This is a placeholder - actual implementation would check real IIB Broker endpoint
 */
async function checkIIBBrokerConnection(): Promise<boolean> {
  try {
    // TODO: Implement actual IIB Broker connectivity check
    // For now, returning true as placeholder
    return true;
  } catch (error) {
    console.error('IIB Broker connection check failed:', error);
    return false;
  }
}

/**
 * GET /api/system/health
 * Validate online operation mode and system connectivity
 */
export async function GET() {
  try {
    const timestamp = new Date().toISOString();

    // Check Cliente Único database connectivity
    const dbConnected = await checkDatabaseConnection();

    // Check IIB Broker connectivity
    const iibConnected = await checkIIBBrokerConnection();

    // Determine overall system status
    const systemStatus = dbConnected && iibConnected ? 'online' : 'offline';

    const response: SystemHealthResponse = {
      status: systemStatus,
      clienteUnicoConnected: dbConnected,
      iibBrokerConnected: iibConnected,
      timestamp,
    };

    // Return 200 if online, 503 if offline
    const statusCode = systemStatus === 'online' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Error in system health check:', error);
    
    // Return offline status if health check itself fails
    const response: SystemHealthResponse = {
      status: 'offline',
      clienteUnicoConnected: false,
      iibBrokerConnected: false,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 503 });
  }
}
