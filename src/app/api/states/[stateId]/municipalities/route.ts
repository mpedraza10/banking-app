import { NextRequest, NextResponse } from 'next/server';
import { getMunicipalities } from '@/lib/actions/address-hierarchy';

export interface MunicipalityDTO {
  id: string;
  name: string;
  stateId: string;
}

export interface MunicipalitiesResponse {
  data: MunicipalityDTO[];
}

/**
 * GET /api/states/[stateId]/municipalities
 * Retrieve municipalities within a specific state
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stateId: string }> }
) {
  try {
    const { stateId } = await params;

    if (!stateId) {
      return NextResponse.json(
        {
          error: 'ID requerido',
          message: 'El ID del estado es requerido',
        },
        { status: 400 }
      );
    }

    // Fetch municipalities using server action
    const municipalitiesResponse = await getMunicipalities(stateId);

    // Map to DTO format
    const municipalityDTOs: MunicipalityDTO[] = municipalitiesResponse.data.map((municipality) => ({
      id: municipality.id,
      name: municipality.name,
      stateId: municipality.stateId,
    }));

    const response: MunicipalitiesResponse = {
      data: municipalityDTOs,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in municipalities API:', error);
    
    return NextResponse.json(
      {
        error: 'Error del servidor',
        message: 'Error al obtener municipios. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
