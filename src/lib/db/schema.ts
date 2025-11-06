import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  date,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, relations } from "drizzle-orm";

// ===== ENUMS =====
export const customerStatusEnum = pgEnum("customer_status", ["active", "inactive"]);
export const phoneTypeEnum = pgEnum("phone_type", ["mobile", "home", "work"]);
export const governmentIdTypeEnum = pgEnum("government_id_type", ["RFC", "IFE", "Passport"]);
export const cardTypeEnum = pgEnum("card_type", ["debit", "credit", "prepaid"]);
export const cardStatusEnum = pgEnum("card_status", ["active", "inactive", "expired"]);
export const cashierRoleEnum = pgEnum("cashier_role", [
  "teller_window",
  "junior_cashier",
  "principal_teller",
]);
export const auditActionTypeEnum = pgEnum("audit_action_type", [
  "search",
  "select",
  "view_cards",
]);

// ===== EXISTING USERS TABLE (Supabase Auth Integration) =====
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // UUID from Supabase Auth
  email: text("email").notNull().unique(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow(),
});

// ===== CUSTOMER ENTITY =====
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  status: customerStatusEnum("status").notNull().default("active"),
  registrationDate: date("registration_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== ADDRESS REFERENCE TABLES =====
export const states = pgTable("states", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const municipalities = pgTable("municipalities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  stateId: uuid("state_id")
    .notNull()
    .references(() => states.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const neighborhoods = pgTable("neighborhoods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  municipalityId: uuid("municipality_id")
    .notNull()
    .references(() => municipalities.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== ADDRESS ENTITY =====
export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  street: varchar("street", { length: 200 }).notNull(),
  postalCode: varchar("postal_code", { length: 5 }),
  stateId: uuid("state_id")
    .notNull()
    .references(() => states.id),
  municipalityId: uuid("municipality_id")
    .notNull()
    .references(() => municipalities.id),
  neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== PHONE ENTITY =====
export const phones = pgTable("phones", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  number: varchar("number", { length: 10 }).notNull(),
  type: phoneTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== GOVERNMENT ID ENTITY =====
export const governmentIds = pgTable("government_ids", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  type: governmentIdTypeEnum("type").notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== CARD ENTITY =====
export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  number: text("number").notNull(), // Encrypted, display last 4 only
  type: cardTypeEnum("type").notNull(),
  status: cardStatusEnum("status").notNull().default("active"),
  issuanceDate: date("issuance_date").notNull(),
  expirationDate: date("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== CASHIER ENTITY =====
export const cashiers = pgTable("cashiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  role: cashierRoleEnum("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== SEARCH AUDIT LOG ENTITY =====
export const searchAuditLogs = pgTable("search_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  cashierId: uuid("cashier_id")
    .notNull()
    .references(() => cashiers.id),
  searchTimestamp: timestamp("search_timestamp").notNull().defaultNow(),
  searchCriteria: json("search_criteria").notNull(),
  resultsCount: integer("results_count").notNull().default(0),
  selectedCustomerId: uuid("selected_customer_id").references(() => customers.id),
  actionType: auditActionTypeEnum("action_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== RELATIONS =====
export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  phones: many(phones),
  governmentIds: many(governmentIds),
  cards: many(cards),
  searchAuditLogs: many(searchAuditLogs),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
  state: one(states, {
    fields: [addresses.stateId],
    references: [states.id],
  }),
  municipality: one(municipalities, {
    fields: [addresses.municipalityId],
    references: [municipalities.id],
  }),
  neighborhood: one(neighborhoods, {
    fields: [addresses.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));

export const statesRelations = relations(states, ({ many }) => ({
  municipalities: many(municipalities),
  addresses: many(addresses),
}));

export const municipalitiesRelations = relations(municipalities, ({ one, many }) => ({
  state: one(states, {
    fields: [municipalities.stateId],
    references: [states.id],
  }),
  neighborhoods: many(neighborhoods),
  addresses: many(addresses),
}));

export const neighborhoodsRelations = relations(neighborhoods, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [neighborhoods.municipalityId],
    references: [municipalities.id],
  }),
  addresses: many(addresses),
}));

export const phonesRelations = relations(phones, ({ one }) => ({
  customer: one(customers, {
    fields: [phones.customerId],
    references: [customers.id],
  }),
}));

export const governmentIdsRelations = relations(governmentIds, ({ one }) => ({
  customer: one(customers, {
    fields: [governmentIds.customerId],
    references: [customers.id],
  }),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  customer: one(customers, {
    fields: [cards.customerId],
    references: [customers.id],
  }),
}));

export const cashiersRelations = relations(cashiers, ({ many }) => ({
  searchAuditLogs: many(searchAuditLogs),
}));

export const searchAuditLogsRelations = relations(searchAuditLogs, ({ one }) => ({
  cashier: one(cashiers, {
    fields: [searchAuditLogs.cashierId],
    references: [cashiers.id],
  }),
  selectedCustomer: one(customers, {
    fields: [searchAuditLogs.selectedCustomerId],
    references: [customers.id],
  }),
}));

// ===== TYPE EXPORTS =====

// User types (existing)
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Customer types
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;

// Address reference types
export type State = InferSelectModel<typeof states>;
export type NewState = InferInsertModel<typeof states>;

export type Municipality = InferSelectModel<typeof municipalities>;
export type NewMunicipality = InferInsertModel<typeof municipalities>;

export type Neighborhood = InferSelectModel<typeof neighborhoods>;
export type NewNeighborhood = InferInsertModel<typeof neighborhoods>;

// Address types
export type Address = InferSelectModel<typeof addresses>;
export type NewAddress = InferInsertModel<typeof addresses>;

// Phone types
export type Phone = InferSelectModel<typeof phones>;
export type NewPhone = InferInsertModel<typeof phones>;

// Government ID types
export type GovernmentId = InferSelectModel<typeof governmentIds>;
export type NewGovernmentId = InferInsertModel<typeof governmentIds>;

// Card types
export type Card = InferSelectModel<typeof cards>;
export type NewCard = InferInsertModel<typeof cards>;

// Cashier types
export type Cashier = InferSelectModel<typeof cashiers>;
export type NewCashier = InferInsertModel<typeof cashiers>;

// Search audit log types
export type SearchAuditLog = InferSelectModel<typeof searchAuditLogs>;
export type NewSearchAuditLog = InferInsertModel<typeof searchAuditLogs>;
