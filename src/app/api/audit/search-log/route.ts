import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/actions/audit';

export interface AuditLogRequest {
  searchCriteria: Record<string, unknown>;
  resultsCount: number;
  selectedCustomerId?: string;
  actionType: 'search' | 'select' | 'view_cards';
}

export interface AuditLogResponse {
  id: string;
  timestamp: string;
  cashierId: string;
}

/**
 * POST /api/audit/search-log
 * Create audit log entry for customer search operations
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuditLogRequest = await request.json();

    // Validate required fields
    if (!body.searchCriteria || typeof body.searchCriteria !== 'object') {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          message: 'Los criterios de búsqueda son requeridos',
        },
        { status: 400 }
      );
    }

    if (typeof body.resultsCount !== 'number' || body.resultsCount < 0) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          message: 'El número de resultados debe ser un número no negativo',
        },
        { status: 400 }
      );
    }

    if (!body.actionType || !['search', 'select', 'view_cards'].includes(body.actionType)) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          message: 'El tipo de acción es inválido',
        },
        { status: 400 }
      );
    }

    // TODO: Get cashierId from session/authentication context
    // For now, using a placeholder - this will be replaced with actual session data
    const cashierId = 'placeholder-cashier-id';

    // Create audit log
    const auditLog = await createAuditLog({
      cashierId,
      searchCriteria: body.searchCriteria,
      resultsCount: body.resultsCount,
      selectedCustomerId: body.selectedCustomerId,
      actionType: body.actionType,
    });

    if (!auditLog) {
      return NextResponse.json(
        {
          error: 'Error del servidor',
          message: 'Error al crear el registro de auditoría',
        },
        { status: 500 }
      );
    }

    const response: AuditLogResponse = {
      id: auditLog.id,
      timestamp: auditLog.timestamp.toISOString(),
      cashierId: auditLog.cashierId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in audit log API:', error);
    
    return NextResponse.json(
      {
        error: 'Error del servidor',
        message: 'Error al procesar el registro de auditoría. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
