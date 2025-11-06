"use server";

import { db } from "@/lib/db";
import { cards, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLastFourDigits } from "@/lib/utils/card-security.utils";

/**
 * Card data type returned by server actions
 * Includes only non-sensitive information suitable for client display
 */
export interface CustomerCardData {
  id: string;
  cardNumber: string; // Full number for masking on client
  cardType: string;
  expirationDate: string; // Formatted as MM/YY
  cardholderName: string;
  status: 'active' | 'inactive' | 'blocked';
  issuer: string;
  lastFourDigits: string;
}

/**
 * Retrieves all cards associated with a customer
 * Returns card data suitable for display (with security considerations)
 * 
 * @param customerId - UUID of the customer
 * @returns Array of customer cards
 * @throws Error if customer ID is invalid or database error occurs
 * 
 * @example
 * const cards = await getCustomerCards('customer-uuid-here');
 */
export async function getCustomerCards(
  customerId: string
): Promise<CustomerCardData[]> {
  try {
    if (!customerId || customerId.trim() === "") {
      throw new Error("Customer ID is required");
    }

    // Verify customer exists
    const customerResult = await db
      .select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        middleName: customers.middleName,
      })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customerResult.length === 0) {
      console.warn(`Customer not found with ID: ${customerId}`);
      return [];
    }

    const customer = customerResult[0];

    // Get all cards for the customer
    const customerCards = await db
      .select({
        id: cards.id,
        number: cards.number,
        type: cards.type,
        status: cards.status,
        expirationDate: cards.expirationDate,
        issuanceDate: cards.issuanceDate,
      })
      .from(cards)
      .where(eq(cards.customerId, customerId));

    // Map to customer card data format with security measures
    const cardData: CustomerCardData[] = customerCards.map((card) => {
      // Format expiration date as MM/YY
      const expDate = card.expirationDate 
        ? new Date(card.expirationDate)
        : null;
      
      const formattedExpDate = expDate
        ? `${String(expDate.getMonth() + 1).padStart(2, '0')}/${String(expDate.getFullYear()).slice(-2)}`
        : 'N/A';

      // Build cardholder name
      const cardholderName = `${customer.firstName} ${customer.middleName || ''} ${customer.lastName}`.trim();

      // Map status to expected type
      let mappedStatus: 'active' | 'inactive' | 'blocked' = 'inactive';
      if (card.status === 'active') {
        mappedStatus = 'active';
      } else if (card.status === 'expired') {
        mappedStatus = 'blocked';
      }

      return {
        id: card.id,
        cardNumber: card.number, // Full number (will be masked on client)
        cardType: card.type, // debit, credit, prepaid
        expirationDate: formattedExpDate,
        cardholderName,
        status: mappedStatus,
        issuer: 'Banco Nacional', // TODO: Add issuer to schema or derive from card number
        lastFourDigits: getLastFourDigits(card.number),
      };
    });

    return cardData;
  } catch (error) {
    console.error("Error fetching customer cards:", error);
    throw new Error("Failed to fetch customer cards");
  }
}

/**
 * Retrieves a specific card by ID
 * Used for card selection and verification
 * 
 * @param cardId - UUID of the card
 * @returns Card data or null if not found
 * @throws Error if card ID is invalid or database error occurs
 */
export async function getCardById(
  cardId: string
): Promise<CustomerCardData | null> {
  try {
    if (!cardId || cardId.trim() === "") {
      throw new Error("Card ID is required");
    }

    // Get card with customer information
    const cardResult = await db
      .select({
        cardId: cards.id,
        cardNumber: cards.number,
        cardType: cards.type,
        cardStatus: cards.status,
        expirationDate: cards.expirationDate,
        customerId: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        middleName: customers.middleName,
      })
      .from(cards)
      .innerJoin(customers, eq(cards.customerId, customers.id))
      .where(eq(cards.id, cardId))
      .limit(1);

    if (cardResult.length === 0) {
      console.warn(`Card not found with ID: ${cardId}`);
      return null;
    }

    const result = cardResult[0];

    // Format expiration date as MM/YY
    const expDate = result.expirationDate 
      ? new Date(result.expirationDate)
      : null;
    
    const formattedExpDate = expDate
      ? `${String(expDate.getMonth() + 1).padStart(2, '0')}/${String(expDate.getFullYear()).slice(-2)}`
      : 'N/A';

    // Build cardholder name
    const cardholderName = `${result.firstName} ${result.middleName || ''} ${result.lastName}`.trim();

    // Map status to expected type
    let mappedStatus: 'active' | 'inactive' | 'blocked' = 'inactive';
    if (result.cardStatus === 'active') {
      mappedStatus = 'active';
    } else if (result.cardStatus === 'expired') {
      mappedStatus = 'blocked';
    }

    return {
      id: result.cardId,
      cardNumber: result.cardNumber,
      cardType: result.cardType,
      expirationDate: formattedExpDate,
      cardholderName,
      status: mappedStatus,
      issuer: 'Banco Nacional', // TODO: Add issuer to schema or derive from card number
      lastFourDigits: getLastFourDigits(result.cardNumber),
    };
  } catch (error) {
    console.error("Error fetching card by ID:", error);
    throw new Error("Failed to fetch card");
  }
}

/**
 * Counts the number of active cards for a customer
 * Used for quick validation and UI display
 * 
 * @param customerId - UUID of the customer
 * @returns Number of active cards
 */
export async function getActiveCardCount(
  customerId: string
): Promise<number> {
  try {
    if (!customerId || customerId.trim() === "") {
      throw new Error("Customer ID is required");
    }

    const result = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.customerId, customerId));

    // Filter for active cards
    const activeCards = result.filter((card) => card.id !== null);
    
    return activeCards.length;
  } catch (error) {
    console.error("Error counting active cards:", error);
    return 0;
  }
}
