// Customer Search Filter Types
export interface CustomerSearchFilters {
  primaryPhone: string;
  secondaryPhone: string;
  clientNumber: string;
  firstName: string;
  lastName: string;
  secondLastName: string;
  dateOfBirth: string;
  rfc: string;
  stateId: string;
  municipalityId: string;
  neighborhoodId: string;
  postalCode: string;
  ife: string;
  passport: string;
}

// Customer Search Result Types (from API)
export interface CustomerSearchResult {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  secondLastName: string | null;
  rfc: string | null;
  status: string;
  primaryPhone: string;
  primaryAddress: string;
}

export interface CustomerSearchResponse {
  data: CustomerSearchResult[];
  totalCount: number;
}

// Customer Detail Types
export interface CustomerDetail {
  id: string;
  firstName: string;
  lastName: string;
  secondLastName: string | null;
  status: string;
  registrationDate: string;
  addresses: CustomerAddress[];
  phones: CustomerPhone[];
  governmentIds: GovernmentId[];
}

export interface CustomerAddress {
  id: string;
  street: string;
  postalCode: string;
  stateName: string;
  municipalityName: string;
  neighborhoodName: string;
  isPrimary: boolean;
}

export interface CustomerPhone {
  id: string;
  number: string;
  type: string;
}

export interface GovernmentId {
  id: string;
  type: string;
  number: string;
}

// Address Hierarchy Types
export interface State {
  id: string;
  name: string;
  code: string | null;
}

export interface Municipality {
  id: string;
  name: string;
  stateId: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  municipalityId: string;
}

export interface AddressHierarchyResponse<T> {
  data: T[];
}
