# Data Model for Customer Search and Payment System

## 1. Entities Overview
- **Customer**: Represents individuals in the unified customer database with personal identification and contact information
- **Address**: Represents customer addresses with hierarchical location data
- **State**: Represents geographical states/provinces in the address hierarchy
- **Municipality**: Represents municipalities within states
- **Neighborhood**: Represents neighborhoods within municipalities
- **Phone**: Represents customer phone numbers with type classification
- **GovernmentId**: Represents government-issued identification documents (RFC, IFE, Passport)
- **Card**: Represents payment cards associated with customers
- **SearchAuditLog**: Represents audit trail records for search operations and user interactions
- **Cashier**: Represents bank cashiers who perform customer searches and transactions

## 2. Entity Definitions

#### Customer
**Description:** Represents individuals in the Cliente Único database with personal identification, contact information, and account status

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique customer identifier |
| firstName | string | Yes | Max 100 chars | Customer's first name |
| lastName | string | Yes | Max 100 chars | Customer's last name |
| middleName | string | No | Max 100 chars | Customer's middle name |
| status | enum | Yes | Values: active, inactive | Customer account status |
| registrationDate | date | Yes | | Account registration date |

**Business Rules:**
- Only active customers can be used for transaction processing
- Customer information must remain synchronized with Cliente Único database

---

#### Address
**Description:** Represents customer addresses with hierarchical geographical location data

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique address identifier |
| customerId | identifier | Yes | Foreign Key → Customer | Address owner |
| street | string | Yes | Max 200 chars | Street address |
| postalCode | string | No | 5 digits | Postal code |
| stateId | identifier | Yes | Foreign Key → State | State/province |
| municipalityId | identifier | Yes | Foreign Key → Municipality | Municipality |
| neighborhoodId | identifier | No | Foreign Key → Neighborhood | Neighborhood |
| isPrimary | boolean | Yes | Default: false | Primary address flag |

**Business Rules:**
- Postal code must be 5 digits when provided
- Address hierarchy must be enforced (State → Municipality → Neighborhood)

---

#### State
**Description:** Represents geographical states/provinces in the address hierarchy system

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique state identifier |
| name | string | Yes | Max 100 chars | State name |
| code | string | No | Max 10 chars | State code |

---

#### Municipality
**Description:** Represents municipalities within states in the address hierarchy

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique municipality identifier |
| name | string | Yes | Max 100 chars | Municipality name |
| stateId | identifier | Yes | Foreign Key → State | Parent state |

---

#### Neighborhood
**Description:** Represents neighborhoods within municipalities in the address hierarchy

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique neighborhood identifier |
| name | string | Yes | Max 100 chars | Neighborhood name |
| municipalityId | identifier | Yes | Foreign Key → Municipality | Parent municipality |

---

#### Phone
**Description:** Represents customer phone numbers with type classification

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique phone identifier |
| customerId | identifier | Yes | Foreign Key → Customer | Phone owner |
| number | string | Yes | 10 digits | Phone number |
| type | enum | Yes | Values: mobile, home, work | Phone type |

**Business Rules:**
- Phone numbers must be exactly 10 digits
- Customers can have multiple phone numbers of different types

---

#### GovernmentId
**Description:** Represents government-issued identification documents for customers

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique government ID identifier |
| customerId | identifier | Yes | Foreign Key → Customer | ID owner |
| type | enum | Yes | Values: RFC, IFE, Passport | ID document type |
| number | string | Yes | Type-specific format | ID number |

**Business Rules:**
- RFC numbers must be 13 characters alphanumeric
- IFE numbers must be 20 digits
- Each customer can have multiple government IDs of different types

---

#### Card
**Description:** Represents payment cards associated with customer accounts

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique card identifier |
| customerId | identifier | Yes | Foreign Key → Customer | Card owner |
| number | string | Yes | Encrypted, display last 4 | Card number |
| type | enum | Yes | Values: debit, credit, prepaid | Card type |
| status | enum | Yes | Values: active, inactive, expired | Card status |
| issuanceDate | date | Yes | | Card issuance date |
| expirationDate | date | No | | Card expiration date |

**Business Rules:**
- Card numbers must be masked in UI displays (showing only last 4 digits)
- Only active cards can be used for payment processing
- Card information must follow PCI DSS compliance requirements

---

#### SearchAuditLog
**Description:** Represents audit trail records for search operations and user interactions for compliance purposes

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique audit log identifier |
| cashierId | identifier | Yes | Foreign Key → Cashier | Cashier performing search |
| searchTimestamp | datetime | Yes | | When search was performed |
| searchCriteria | json | Yes | | Search filters used |
| resultsCount | integer | Yes | Min: 0 | Number of results returned |
| selectedCustomerId | identifier | No | Foreign Key → Customer | Customer selected (if any) |
| actionType | enum | Yes | Values: search, select, view_cards | Type of action performed |

**Business Rules:**
- All search operations must be logged for audit and compliance purposes
- Search criteria must be stored to enable compliance reporting

---

#### Cashier
**Description:** Represents bank cashiers who perform customer searches and transactions

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique cashier identifier |
| employeeId | string | Yes | Unique | Employee identification |
| name | string | Yes | Max 100 chars | Cashier name |
| role | enum | Yes | Values: teller_window, junior_cashier, principal_teller | Cashier role |
| isActive | boolean | Yes | Default: true | Active status |

**Business Rules:**
- Cashiers must authenticate through existing Corporate Cashier session management
- Only active cashiers can perform search operations

---

## 3. Relationships

#### Customer ↔ Address
**Type:** One-to-Many

**Description:** A customer can have multiple addresses (home, work, etc.), but each address belongs to exactly one customer

**Cardinality:**
- Customer: 1..1 (each address has exactly one owner)
- Address: 0..* (customer can have zero or more addresses)

**Implementation Notes:**
- Foreign key: Address.customerId → Customer.id
- One address can be marked as primary per customer

---

#### Customer ↔ Phone
**Type:** One-to-Many

**Description:** A customer can have multiple phone numbers of different types, but each phone number belongs to exactly one customer

**Cardinality:**
- Customer: 1..1 (each phone has exactly one owner)
- Phone: 0..* (customer can have zero or more phones)

**Implementation Notes:**
- Foreign key: Phone.customerId → Customer.id
- Multiple phones of same type allowed per customer

---

#### Customer ↔ GovernmentId
**Type:** One-to-Many

**Description:** A customer can have multiple government-issued identification documents, but each ID belongs to exactly one customer

**Cardinality:**
- Customer: 1..1 (each government ID has exactly one owner)
- GovernmentId: 0..* (customer can have zero or more government IDs)

**Implementation Notes:**
- Foreign key: GovernmentId.customerId → Customer.id
- Multiple IDs of different types allowed per customer

---

#### Customer ↔ Card
**Type:** One-to-Many

**Description:** A customer can have multiple payment cards associated with their account, but each card belongs to exactly one customer

**Cardinality:**
- Customer: 1..1 (each card has exactly one owner)
- Card: 0..* (customer can have zero or more cards)

**Implementation Notes:**
- Foreign key: Card.customerId → Customer.id
- Cards can exist without active status

---

#### State ↔ Municipality
**Type:** One-to-Many

**Description:** A state contains multiple municipalities, but each municipality belongs to exactly one state

**Cardinality:**
- State: 1..1 (each municipality belongs to exactly one state)
- Municipality: 1..* (state must have at least one municipality)

**Implementation Notes:**
- Foreign key: Municipality.stateId → State.id
- Hierarchical relationship for address validation

---

#### Municipality ↔ Neighborhood
**Type:** One-to-Many

**Description:** A municipality contains multiple neighborhoods, but each neighborhood belongs to exactly one municipality

**Cardinality:**
- Municipality: 1..1 (each neighborhood belongs to exactly one municipality)
- Neighborhood: 0..* (municipality can have zero or more neighborhoods)

**Implementation Notes:**
- Foreign key: Neighborhood.municipalityId → Municipality.id
- Optional relationship as neighborhoods may not be catalogued for all municipalities

---

#### Address ↔ State
**Type:** Many-to-One

**Description:** Multiple addresses can be in the same state, but each address is in exactly one state

**Cardinality:**
- State: 0..* (state can have zero or more addresses)
- Address: 1..1 (each address must be in exactly one state)

**Implementation Notes:**
- Foreign key: Address.stateId → State.id
- Required for address hierarchy validation

---

#### Address ↔ Municipality
**Type:** Many-to-One

**Description:** Multiple addresses can be in the same municipality, but each address is in exactly one municipality

**Cardinality:**
- Municipality: 0..* (municipality can have zero or more addresses)
- Address: 1..1 (each address must be in exactly one municipality)

**Implementation Notes:**
- Foreign key: Address.municipalityId → Municipality.id
- Required for address hierarchy validation

---

#### Address ↔ Neighborhood
**Type:** Many-to-One

**Description:** Multiple addresses can be in the same neighborhood, but each address is in at most one neighborhood

**Cardinality:**
- Neighborhood: 0..* (neighborhood can have zero or more addresses)
- Address: 0..1 (each address can optionally be in one neighborhood)

**Implementation Notes:**
- Foreign key: Address.neighborhoodId → Neighborhood.id
- Optional relationship as not all addresses specify neighborhood

---

#### Cashier ↔ SearchAuditLog
**Type:** One-to-Many

**Description:** A cashier can perform multiple search operations, but each audit log entry is associated with exactly one cashier

**Cardinality:**
- Cashier: 1..1 (each search is performed by exactly one cashier)
- SearchAuditLog: 0..* (cashier can have zero or more search audit entries)

**Implementation Notes:**
- Foreign key: SearchAuditLog.cashierId → Cashier.id
- Required for audit trail and compliance

---

#### Customer ↔ SearchAuditLog
**Type:** One-to-Many

**Description:** A customer can be selected in multiple search operations, but each audit log entry can reference at most one selected customer

**Cardinality:**
- Customer: 0..* (customer can appear in zero or more audit logs)
- SearchAuditLog: 0..1 (each audit log can optionally reference one selected customer)

**Implementation Notes:**
- Foreign key: SearchAuditLog.selectedCustomerId → Customer.id
- Optional relationship as not all searches result in customer selection

---

## 4. Enumerations and Constants

#### CustomerStatus
**Values:** active, inactive
**Used by:** Customer.status
**Description:** Customer account status for transaction eligibility

#### PhoneType
**Values:** mobile, home, work
**Used by:** Phone.type
**Description:** Classification of customer phone numbers

#### GovernmentIdType
**Values:** RFC, IFE, Passport
**Used by:** GovernmentId.type
**Description:** Types of government-issued identification documents

#### CardType
**Values:** debit, credit, prepaid
**Used by:** Card.type
**Description:** Payment card product types

#### CardStatus
**Values:** active, inactive, expired
**Used by:** Card.status
**Description:** Payment card availability status

#### CashierRole
**Values:** teller_window, junior_cashier, principal_teller
**Used by:** Cashier.role
**Description:** Cashier role types for access control

#### AuditActionType
**Values:** search, select, view_cards
**Used by:** SearchAuditLog.actionType
**Description:** Types of user actions that generate audit log entries