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
import { eq, and, or, like, sql } from "drizzle-orm";
import type {
  CustomerSearchFilters,
  CustomerSearchResponse,
  CustomerSearchResult,
} from "@/lib/types/customer";

/**
 * Search for customers using multiple filter criteria
 * Minimum two filters required (validation handled client-side)
 */
export async function searchCustomers(
  filters: CustomerSearchFilters
): Promise<CustomerSearchResponse> {
  try {
    // Build the query conditions based on provided filters
    const conditions = [];

    // Customer name filters
    if (filters.firstName) {
      conditions.push(like(customers.firstName, `%${filters.firstName}%`));
    }
    if (filters.lastName) {
      conditions.push(like(customers.lastName, `%${filters.lastName}%`));
    }
    if (filters.secondLastName) {
      conditions.push(like(customers.middleName, `%${filters.secondLastName}%`));
    }

    // Date of birth filter
    if (filters.dateOfBirth) {
      // Note: This assumes dateOfBirth is stored in customers table
      // If it's in a separate table, adjust accordingly
      // conditions.push(eq(customers.dateOfBirth, filters.dateOfBirth));
    }

    // Build the base query
    const query = db
      .select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        middleName: customers.middleName,
        status: customers.status,
      })
      .from(customers)
      .where(and(...(conditions.length > 0 ? conditions : [sql`1=1`])));

    // Execute base query
    let results = await query;

    // Filter by phone numbers if provided
    if (filters.primaryPhone || filters.secondaryPhone) {
      const phoneConditions = [];
      if (filters.primaryPhone) {
        phoneConditions.push(eq(phones.number, filters.primaryPhone));
      }
      if (filters.secondaryPhone) {
        phoneConditions.push(eq(phones.number, filters.secondaryPhone));
      }

      const customersWithPhones = await db
        .select({ customerId: phones.customerId })
        .from(phones)
        .where(or(...phoneConditions));

      const customerIdsWithPhones = customersWithPhones.map((p) => p.customerId);
      results = results.filter((r) => customerIdsWithPhones.includes(r.id));
    }

    // Filter by government IDs if provided
    if (filters.rfc || filters.ife || filters.passport) {
      const govIdConditions = [];
      if (filters.rfc) {
        govIdConditions.push(
          and(eq(governmentIds.type, "RFC"), eq(governmentIds.number, filters.rfc))
        );
      }
      if (filters.ife) {
        govIdConditions.push(
          and(eq(governmentIds.type, "IFE"), eq(governmentIds.number, filters.ife))
        );
      }
      if (filters.passport) {
        govIdConditions.push(
          and(eq(governmentIds.type, "Passport"), eq(governmentIds.number, filters.passport))
        );
      }

      const customersWithGovIds = await db
        .select({ customerId: governmentIds.customerId })
        .from(governmentIds)
        .where(or(...govIdConditions));

      const customerIdsWithGovIds = customersWithGovIds.map((g) => g.customerId);
      results = results.filter((r) => customerIdsWithGovIds.includes(r.id));
    }

    // Filter by address if provided
    if (filters.stateId || filters.municipalityId || filters.neighborhoodId || filters.postalCode) {
      const addressConditions = [];
      if (filters.stateId) {
        addressConditions.push(eq(addresses.stateId, filters.stateId));
      }
      if (filters.municipalityId) {
        addressConditions.push(eq(addresses.municipalityId, filters.municipalityId));
      }
      if (filters.neighborhoodId) {
        addressConditions.push(eq(addresses.neighborhoodId, filters.neighborhoodId));
      }
      if (filters.postalCode) {
        addressConditions.push(eq(addresses.postalCode, filters.postalCode));
      }

      const customersWithAddresses = await db
        .select({ customerId: addresses.customerId })
        .from(addresses)
        .where(and(...addressConditions));

      const customerIdsWithAddresses = customersWithAddresses.map((a) => a.customerId);
      results = results.filter((r) => customerIdsWithAddresses.includes(r.id));
    }

    // For each result, get primary phone, address, and RFC
    const enrichedResults: CustomerSearchResult[] = await Promise.all(
      results.map(async (customer) => {
        // Get primary phone
        const primaryPhones = await db
          .select({ number: phones.number })
          .from(phones)
          .where(eq(phones.customerId, customer.id))
          .limit(1);

        // Get RFC
        const rfcRecords = await db
          .select({ number: governmentIds.number })
          .from(governmentIds)
          .where(and(eq(governmentIds.customerId, customer.id), eq(governmentIds.type, "RFC")))
          .limit(1);

        // Get primary address with location details
        const primaryAddresses = await db
          .select({
            street: addresses.street,
            postalCode: addresses.postalCode,
            stateName: states.name,
            municipalityName: municipalities.name,
            neighborhoodName: neighborhoods.name,
          })
          .from(addresses)
          .leftJoin(states, eq(addresses.stateId, states.id))
          .leftJoin(municipalities, eq(addresses.municipalityId, municipalities.id))
          .leftJoin(neighborhoods, eq(addresses.neighborhoodId, neighborhoods.id))
          .where(and(eq(addresses.customerId, customer.id), eq(addresses.isPrimary, true)))
          .limit(1);

        const primaryPhone = primaryPhones[0]?.number || "";
        const rfc = rfcRecords[0]?.number || null;
        const primaryAddress = primaryAddresses[0]
          ? `${primaryAddresses[0].street}, ${primaryAddresses[0].neighborhoodName || ""}, ${primaryAddresses[0].municipalityName}, ${primaryAddresses[0].stateName} ${primaryAddresses[0].postalCode}`.trim()
          : "";

        return {
          id: customer.id,
          customerNumber: customer.id.slice(0, 10), // Using first 10 chars of ID as customer number
          firstName: customer.firstName,
          lastName: customer.lastName,
          secondLastName: customer.middleName,
          rfc,
          status: customer.status,
          primaryPhone,
          primaryAddress,
        };
      })
    );

    return {
      data: enrichedResults,
      totalCount: enrichedResults.length,
    };
  } catch (error) {
    console.error("Error searching customers:", error);
    throw new Error("Failed to search customers");
  }
}
