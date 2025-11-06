import { NextRequest, NextResponse } from 'next/server';
import { searchCustomers } from '@/lib/actions/customer-search';
import type { CustomerSearchFilters } from '@/lib/types/customer';

export interface CustomerSearchResultDTO {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  status: string;
  primaryPhone: string | null;
  primaryAddress: string | null;
}

export interface CustomerSearchResponse {
  data: CustomerSearchResultDTO[];
  totalCount: number;
}

/**
 * GET /api/customers/search
 * Search for customers using multiple filter criteria
 * Requires minimum two search filters
 */
export async function GET(request: NextRequest) {
  try {
    // Extract search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    
    const filters: CustomerSearchFilters = {
      primaryPhone: searchParams.get('phoneNumber') || "",
      secondaryPhone: "",
      clientNumber: "",
      firstName: searchParams.get('firstName') || "",
      lastName: searchParams.get('lastName') || "",
      secondLastName: searchParams.get('middleName') || "",
      dateOfBirth: "",
      rfc: searchParams.get('rfcNumber') || "",
      stateId: searchParams.get('stateId') || "",
      municipalityId: searchParams.get('municipalityId') || "",
      neighborhoodId: searchParams.get('neighborhoodId') || "",
      postalCode: searchParams.get('postalCode') || "",
      ife: searchParams.get('ifeNumber') || "",
      passport: searchParams.get('passportNumber') || "",
    };

    // Validate minimum two filters requirement
    const activeFilters = Object.values(filters).filter(
      (value) => value !== undefined && value !== ''
    );

    if (activeFilters.length < 2) {
      return NextResponse.json(
        {
          error: 'Campos necesarios faltantes',
          message: 'Se requieren al menos dos filtros de búsqueda',
        },
        { status: 400 }
      );
    }

    // Validate phone number format (10 digits)
    if (filters.primaryPhone && !/^\d{10}$/.test(filters.primaryPhone)) {
      return NextResponse.json(
        {
          error: 'Formato inválido',
          message: 'El número de teléfono debe tener exactamente 10 dígitos',
        },
        { status: 400 }
      );
    }

    // Validate RFC format (13 alphanumeric characters)
    if (filters.rfc && !/^[A-Z0-9]{13}$/i.test(filters.rfc)) {
      return NextResponse.json(
        {
          error: 'Formato inválido',
          message: 'El RFC debe tener exactamente 13 caracteres alfanuméricos',
        },
        { status: 400 }
      );
    }

    // Validate IFE format (20 digits)
    if (filters.ife && !/^\d{20}$/.test(filters.ife)) {
      return NextResponse.json(
        {
          error: 'Formato inválido',
          message: 'El IFE debe tener exactamente 20 dígitos',
        },
        { status: 400 }
      );
    }

    // Validate postal code format (5 digits)
    if (filters.postalCode && !/^\d{5}$/.test(filters.postalCode)) {
      return NextResponse.json(
        {
          error: 'Formato inválido',
          message: 'El código postal debe tener exactamente 5 dígitos',
        },
        { status: 400 }
      );
    }

    // Execute search using server action
    const searchResponse = await searchCustomers(filters);

    const response: CustomerSearchResponse = {
      data: searchResponse.data.map((customer) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        middleName: customer.secondLastName,
        status: customer.status,
        primaryPhone: customer.primaryPhone,
        primaryAddress: customer.primaryAddress,
      })),
      totalCount: searchResponse.totalCount,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in customer search API:', error);
    
    return NextResponse.json(
      {
        error: 'Error del servidor',
        message: 'Error al buscar clientes. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
