import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoods } from '@/lib/actions/address-hierarchy';

export interface NeighborhoodDTO {
  id: string;
  name: string;
  municipalityId: string;
}

export interface NeighborhoodsResponse {
  data: NeighborhoodDTO[];
}

/**
 * GET /api/municipalities/[municipalityId]/neighborhoods
 * Retrieve neighborhoods within a specific municipality
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ municipalityId: string }> }
) {
  try {
    const { municipalityId } = await params;

    if (!municipalityId) {
      return NextResponse.json(
        {
          error: 'ID requerido',
          message: 'El ID del municipio es requerido',
        },
        { status: 400 }
      );
    }

    // Fetch neighborhoods using server action
    const neighborhoodsResponse = await getNeighborhoods(municipalityId);

    // Map to DTO format
    const neighborhoodDTOs: NeighborhoodDTO[] = neighborhoodsResponse.data.map((neighborhood) => ({
      id: neighborhood.id,
      name: neighborhood.name,
      municipalityId: neighborhood.municipalityId,
    }));

    const response: NeighborhoodsResponse = {
      data: neighborhoodDTOs,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in neighborhoods API:', error);
    
    return NextResponse.json(
      {
        error: 'Error del servidor',
        message: 'Error al obtener colonias. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
