"use server";

import { db } from "@/lib/db";
import { states, municipalities, neighborhoods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { AddressHierarchyResponse, State, Municipality, Neighborhood } from "@/lib/types/customer";

/**
 * Retrieve all states for address filtering
 */
export async function getStates(): Promise<AddressHierarchyResponse<State>> {
  try {
    const results = await db
      .select({
        id: states.id,
        name: states.name,
        code: states.code,
      })
      .from(states)
      .orderBy(states.name);

    return {
      data: results,
    };
  } catch (error) {
    console.error("Error fetching states:", error);
    throw new Error("Failed to fetch states");
  }
}

/**
 * Retrieve municipalities within a specific state
 */
export async function getMunicipalities(
  stateId: string
): Promise<AddressHierarchyResponse<Municipality>> {
  if (!stateId) {
    return { data: [] };
  }

  try {
    const results = await db
      .select({
        id: municipalities.id,
        name: municipalities.name,
        stateId: municipalities.stateId,
      })
      .from(municipalities)
      .where(eq(municipalities.stateId, stateId))
      .orderBy(municipalities.name);

    return {
      data: results,
    };
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    throw new Error("Failed to fetch municipalities");
  }
}

/**
 * Retrieve neighborhoods within a specific municipality
 */
export async function getNeighborhoods(
  municipalityId: string
): Promise<AddressHierarchyResponse<Neighborhood>> {
  if (!municipalityId) {
    return { data: [] };
  }

  try {
    const results = await db
      .select({
        id: neighborhoods.id,
        name: neighborhoods.name,
        municipalityId: neighborhoods.municipalityId,
      })
      .from(neighborhoods)
      .where(eq(neighborhoods.municipalityId, municipalityId))
      .orderBy(neighborhoods.name);

    return {
      data: results,
    };
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
    throw new Error("Failed to fetch neighborhoods");
  }
}
