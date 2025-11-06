import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById } from '@/lib/actions/customer-detail';

export interface AddressDTO {
  id: string;
  street: string;
  postalCode: string | null;
  stateName: string | null;
  municipalityName: string | null;
  neighborhoodName: string | null;
  isPrimary: boolean;
}

export interface PhoneDTO {
  id: string;
  number: string;
  type: string;
}

export interface GovernmentIdDTO {
  id: string;
  type: string;
  number: string;
}

export interface CustomerDetailResponse {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  status: string;
  registrationDate: string;
  addresses: AddressDTO[];
  phones: PhoneDTO[];
  governmentIds: GovernmentIdDTO[];
}

/**
 * GET /api/customers/[customerId]
 * Retrieve complete customer information including personal details, addresses, phones, and government IDs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    if (!customerId) {
      return NextResponse.json(
        {
          error: 'ID requerido',
          message: 'El ID del cliente es requerido',
        },
        { status: 400 }
      );
    }

    // Fetch customer data using server action
    const customerData = await getCustomerById(customerId);

    if (!customerData) {
      return NextResponse.json(
        {
          error: 'Cliente no encontrado',
          message: 'No se encontró un cliente con el ID proporcionado',
        },
        { status: 404 }
      );
    }

    // Check if customer is active
    if (customerData.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Cliente inactivo',
          message: 'Este cliente no está activo en el sistema',
        },
        { status: 403 }
      );
    }

    // Map to DTO format
    const response: CustomerDetailResponse = {
      id: customerData.id,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      middleName: customerData.secondLastName,
      status: customerData.status,
      registrationDate: customerData.registrationDate,
      addresses: customerData.addresses.map((address) => ({
        id: address.id,
        street: address.street,
        postalCode: address.postalCode,
        stateName: address.stateName,
        municipalityName: address.municipalityName,
        neighborhoodName: address.neighborhoodName,
        isPrimary: address.isPrimary,
      })),
      phones: customerData.phones.map((phone) => ({
        id: phone.id,
        number: phone.number,
        type: phone.type,
      })),
      governmentIds: customerData.governmentIds.map((govId) => ({
        id: govId.id,
        type: govId.type,
        number: govId.number,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in customer detail API:', error);
    
    return NextResponse.json(
      {
        error: 'Error del servidor',
        message: 'Error al obtener información del cliente. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
