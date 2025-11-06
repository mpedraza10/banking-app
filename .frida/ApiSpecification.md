# Customer Search and Payment API Specification

## 1. API Overview
- **Authentication:** JWT token in Authorization header (inherited from Corporate Cashier session)
- **Purpose:** Provide endpoints for customer search, selection, and associated card management operations

## 2. Endpoints by Resource

#### Customers

---

##### GET /customers/search
**Description:** Search for customers using multiple filter criteria with minimum two filter requirement

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| firstName | string | No | - | Customer's first name (partial match) |
| lastName | string | No | - | Customer's last name (partial match) |
| middleName | string | No | - | Customer's middle name (partial match) |
| phoneNumber | string | No | - | Phone number (10 digits) |
| rfcNumber | string | No | - | RFC identification (13 characters) |
| ifeNumber | string | No | - | IFE identification (20 digits) |
| passportNumber | string | No | - | Passport identification |
| postalCode | string | No | - | Address postal code (5 digits) |
| stateId | string | No | - | State identifier for address filtering |
| municipalityId | string | No | - | Municipality identifier for address filtering |
| neighborhoodId | string | No | - | Neighborhood identifier for address filtering |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<CustomerSearchResultDTO> | List of matching customers |
| totalCount | integer | Total number of search results |

**CustomerSearchResultDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Customer identifier |
| firstName | string | Customer's first name |
| lastName | string | Customer's last name |
| middleName | string | Customer's middle name |
| status | string | Customer status (active/inactive) |
| primaryPhone | string | Primary phone number (masked) |
| primaryAddress | string | Primary address summary |

**Business Rules:**
- Minimum two search filters required
- Only returns active customers
- Phone number validation: exactly 10 digits
- RFC validation: 13 alphanumeric characters
- IFE validation: 20 digits
- Postal code validation: 5 digits
- Address hierarchy enforced (State → Municipality → Neighborhood)

---

##### GET /customers/{customerId}
**Description:** Retrieve complete customer information including personal details, addresses, phones, and government IDs

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | Customer identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Customer identifier |
| firstName | string | Customer's first name |
| lastName | string | Customer's last name |
| middleName | string | Customer's middle name |
| status | string | Customer status |
| registrationDate | date | Account registration date |
| addresses | array<AddressDTO> | Customer addresses |
| phones | array<PhoneDTO> | Customer phone numbers |
| governmentIds | array<GovernmentIdDTO> | Government identification documents |

**AddressDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Address identifier |
| street | string | Street address |
| postalCode | string | Postal code |
| stateName | string | State name |
| municipalityName | string | Municipality name |
| neighborhoodName | string | Neighborhood name |
| isPrimary | boolean | Primary address flag |

**PhoneDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Phone identifier |
| number | string | Phone number |
| type | string | Phone type (mobile/home/work) |

**GovernmentIdDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Government ID identifier |
| type | string | ID type (RFC/IFE/Passport) |
| number | string | ID number |

**Business Rules:**
- Only accessible for active customers
- Customer must exist in Cliente Único database
- Returns complete customer profile for verification

---

##### GET /customers/{customerId}/cards
**Description:** Retrieve all payment cards associated with a selected customer

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | Customer identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<CardDTO> | List of customer cards |
| totalCount | integer | Total number of cards |

**CardDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Card identifier |
| maskedNumber | string | Card number (showing only last 4 digits) |
| type | string | Card type (debit/credit/prepaid) |
| status | string | Card status (active/inactive/expired) |
| issuanceDate | date | Card issuance date |
| expirationDate | date | Card expiration date |

**Business Rules:**
- Card numbers masked showing only last 4 digits
- Returns all cards regardless of status for selection purposes
- PCI DSS compliance for card information display
- Customer must exist and be active

---

#### Address Hierarchy

---

##### GET /states
**Description:** Retrieve list of all states for address filtering

**Authentication:** Required

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<StateDTO> | List of states |

**StateDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | State identifier |
| name | string | State name |
| code | string | State code |

**Business Rules:**
- Returns all available states for filter selection
- Used for address hierarchy navigation

---

##### GET /states/{stateId}/municipalities
**Description:** Retrieve municipalities within a specific state

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| stateId | string | Yes | State identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<MunicipalityDTO> | List of municipalities |

**MunicipalityDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Municipality identifier |
| name | string | Municipality name |
| stateId | string | Parent state identifier |

**Business Rules:**
- Returns municipalities for specified state only
- Maintains address hierarchy integrity

---

##### GET /municipalities/{municipalityId}/neighborhoods
**Description:** Retrieve neighborhoods within a specific municipality

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| municipalityId | string | Yes | Municipality identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<NeighborhoodDTO> | List of neighborhoods |

**NeighborhoodDTO:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Neighborhood identifier |
| name | string | Neighborhood name |
| municipalityId | string | Parent municipality identifier |

**Business Rules:**
- Returns neighborhoods for specified municipality only
- Optional level in address hierarchy

---

#### Audit

---

##### POST /audit/search-log
**Description:** Create audit log entry for customer search operations

**Authentication:** Required

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| searchCriteria | object | Yes | Valid JSON | Search filters used |
| resultsCount | integer | Yes | Min: 0 | Number of results returned |
| selectedCustomerId | string | No | Valid customer ID | Customer selected (if any) |
| actionType | string | Yes | Enum: search, select, view_cards | Type of action performed |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Audit log identifier |
| timestamp | datetime | Log creation timestamp |
| cashierId | string | Cashier who performed action |

**Business Rules:**
- All search operations must be logged
- Cashier ID automatically captured from session
- Required for compliance and audit purposes

---

#### System

---

##### GET /system/health
**Description:** Validate online operation mode and system connectivity

**Authentication:** Required

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| status | string | System status (online/offline) |
| clienteUnicoConnected | boolean | Cliente Único database connectivity |
| iibBrokerConnected | boolean | IIB Broker connectivity |
| timestamp | datetime | Health check timestamp |

**Business Rules:**
- Must validate online mode before allowing search operations
- Returns connectivity status for all critical integrations
- System prevents operations if not in online mode