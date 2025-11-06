import { NextRequest, NextResponse } from 'next/server';
import { getCustomerCards } from '@/lib/actions/cards';
import { maskCardNumber } from '@/lib/utils/card-security.utils';

export interface CardDTO {
  id: string;
  maskedNumber: string;
  type: string;
  status: string;
  issuanceDate: string;
  expirationDate: string;
}

export interface CustomerCardsResponse {
  data: CardDTO[];
  totalCount: number;
}

/**
 * GET /api/customers/[customerId]/cards
 * Retrieve all payment cards associated with a selected customer
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

    // Fetch customer cards using server action
    const cards = await getCustomerCards(customerId);

    if (!cards) {
      return NextResponse.json(
        {
          error: 'No se pudieron cargar las Tarjetas',
          message: 'Error al recuperar las tarjetas del cliente',
        },
        { status: 500 }
      );
    }

    // Map to DTO format with card number masking
    const cardDTOs: CardDTO[] = cards.map((card) => ({
      id: card.id,
      maskedNumber: maskCardNumber(card.cardNumber),
      type: card.cardType,
      status: card.status,
      issuanceDate: new Date().toISOString(), // Using current date as placeholder
      expirationDate: card.expirationDate,
    }));

    const response: CustomerCardsResponse = {
      data: cardDTOs,
      totalCount: cardDTOs.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in customer cards API:', error);
    
    return NextResponse.json(
      {
        error: 'No se pudieron cargar las Tarjetas',
        message: 'Error al recuperar las tarjetas del cliente. Por favor intente nuevamente.',
      },
      { status: 500 }
    );
  }
}
