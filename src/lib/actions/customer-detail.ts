"use server";

import { db } from "@/lib/db";
import {
  customers,
  addresses,
  phones,
  governmentIds,
  states,
  municipalities,
  neighborhoods,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { CustomerDetail } from "@/lib/types/customer";

/**
 * Get detailed customer information by ID
 * Returns complete customer profile with addresses, phones, and government IDs
 * @throws Error if customer not found or database error occurs
 */
export async function getCustomerById(
  customerId: string
): Promise<CustomerDetail | null> {
  try {
    if (!customerId || customerId.trim() === "") {
      throw new Error("Customer ID is required");
    }

    // Get customer basic information
    const customerResult = await db
      .select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        middleName: customers.middleName,
        status: customers.status,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customerResult.length === 0) {
      console.warn(`Customer not found with ID: ${customerId}`);
      return null;
    }

    const customer = customerResult[0];

    // Get customer addresses with location details
    const customerAddresses = await db
      .select({
        id: addresses.id,
        street: addresses.street,
        postalCode: addresses.postalCode,
        isPrimary: addresses.isPrimary,
        stateName: states.name,
        municipalityName: municipalities.name,
        neighborhoodName: neighborhoods.name,
      })
      .from(addresses)
      .leftJoin(states, eq(addresses.stateId, states.id))
      .leftJoin(municipalities, eq(addresses.municipalityId, municipalities.id))
      .leftJoin(neighborhoods, eq(addresses.neighborhoodId, neighborhoods.id))
      .where(eq(addresses.customerId, customerId));

    // Get customer phones
    const customerPhones = await db
      .select({
        id: phones.id,
        number: phones.number,
        type: phones.type,
      })
      .from(phones)
      .where(eq(phones.customerId, customerId));

    // Get customer government IDs
    const customerGovIds = await db
      .select({
        id: governmentIds.id,
        type: governmentIds.type,
        number: governmentIds.number,
      })
      .from(governmentIds)
      .where(eq(governmentIds.customerId, customerId));

    // Build the complete customer detail object
    const customerDetail: CustomerDetail = {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      secondLastName: customer.middleName,
      status: customer.status,
      registrationDate: customer.createdAt?.toISOString() || new Date().toISOString(),
      addresses: customerAddresses.map((addr) => ({
        id: addr.id,
        street: addr.street,
        postalCode: addr.postalCode || "",
        stateName: addr.stateName || "",
        municipalityName: addr.municipalityName || "",
        neighborhoodName: addr.neighborhoodName || "",
        isPrimary: addr.isPrimary,
      })),
      phones: customerPhones.map((phone) => ({
        id: phone.id,
        number: phone.number,
        type: phone.type,
      })),
      governmentIds: customerGovIds.map((govId) => ({
        id: govId.id,
        type: govId.type,
        number: govId.number,
      })),
    };

    return customerDetail;
  } catch (error) {
    console.error("Error fetching customer details:", error);
    throw new Error("Failed to fetch customer details");
  }
}
