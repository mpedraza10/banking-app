import { NextResponse } from 'next/server';
import { getStates } from '@/lib/actions/address-hierarchy';

export interface StateDTO {
  id: string;
  name: string;
  code: string;
}

export interface StatesResponse {
  data: StateDTO[];
}

/**
 * GET /api/states
 * Retrieve list of all states for address filtering
 */
export async function GET() {
  try {
    // Fetch states using server action
    const statesResponse = await getStates();

    // Map to DTO format
    const stateDTOs: StateDTO[] = statesResponse.data.map((state) => ({
      id: state.id,
      name: state.name,
      code: state.code || '',
    }));

    const response: StatesResponse = {
      data: stateDTOs,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in states API:', error);
    
    return NextResponse.json(
      {
        error: 'Error del servidor',
        message: 'Error al obtener estados. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
