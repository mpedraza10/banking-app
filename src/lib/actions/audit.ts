"use server";

import { db } from "@/lib/db";
import { searchAuditLogs, type NewSearchAuditLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface AuditLogData {
  cashierId: string;
  searchCriteria: Record<string, unknown>;
  resultsCount: number;
  selectedCustomerId?: string;
  actionType: "search" | "select" | "view_cards";
}

export interface AuditLogResult {
  id: string;
  timestamp: Date;
  cashierId: string;
}

/**
 * Create audit log entry for customer search operations
 * Required for compliance and audit purposes
 */
export async function createAuditLog(
  data: AuditLogData
): Promise<AuditLogResult | null> {
  try {
    const newAuditLog: NewSearchAuditLog = {
      cashierId: data.cashierId,
      searchCriteria: data.searchCriteria,
      resultsCount: data.resultsCount,
      selectedCustomerId: data.selectedCustomerId || null,
      actionType: data.actionType,
      searchTimestamp: new Date(),
    };

    const [insertedLog] = await db
      .insert(searchAuditLogs)
      .values(newAuditLog)
      .returning();

    if (!insertedLog) {
      return null;
    }

    return {
      id: insertedLog.id,
      timestamp: insertedLog.searchTimestamp,
      cashierId: insertedLog.cashierId,
    };
  } catch (error) {
    console.error("Error creating audit log:", error);
    return null;
  }
}

/**
 * Get audit logs for a specific cashier
 * Used for monitoring and compliance reporting
 */
export async function getCashierAuditLogs(
  cashierId: string,
  limit: number = 100
): Promise<NewSearchAuditLog[]> {
  try {
    const logs = await db
      .select()
      .from(searchAuditLogs)
      .where(eq(searchAuditLogs.cashierId, cashierId))
      .limit(limit)
      .orderBy(desc(searchAuditLogs.searchTimestamp));

    return logs;
  } catch (error) {
    console.error("Error fetching cashier audit logs:", error);
    return [];
  }
}
