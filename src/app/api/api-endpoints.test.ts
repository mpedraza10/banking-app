import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as customerSearchGET } from '@/app/api/customers/search/route';
import { GET as customerDetailGET } from '@/app/api/customers/[customerId]/route';
import { GET as customerCardsGET } from '@/app/api/customers/[customerId]/cards/route';
import { GET as statesGET } from '@/app/api/states/route';
import { GET as healthGET } from '@/app/api/system/health/route';
import { NextRequest } from 'next/server';

// Mock the server actions
vi.mock('@/lib/actions/customer-search', () => ({
  searchCustomers: vi.fn(),
}));

vi.mock('@/lib/actions/customer-detail', () => ({
  getCustomerById: vi.fn(),
}));

vi.mock('@/lib/actions/cards', () => ({
  getCustomerCards: vi.fn(),
}));

vi.mock('@/lib/actions/address-hierarchy', () => ({
  getStates: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    execute: vi.fn(),
  },
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Search Endpoint', () => {
    it('should require minimum two filters', async () => {
      const url = new URL('http://localhost:3000/api/customers/search?firstName=John');
      const request = new NextRequest(url);

      const response = await customerSearchGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Campos necesarios faltantes');
    });

    it('should validate phone number format', async () => {
      const url = new URL('http://localhost:3000/api/customers/search?firstName=John&phoneNumber=123');
      const request = new NextRequest(url);

      const response = await customerSearchGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Formato inválido');
    });

    it('should validate RFC format', async () => {
      const url = new URL('http://localhost:3000/api/customers/search?firstName=John&rfcNumber=ABC');
      const request = new NextRequest(url);

      const response = await customerSearchGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Formato inválido');
    });

    it('should validate postal code format', async () => {
      const url = new URL('http://localhost:3000/api/customers/search?firstName=John&postalCode=123');
      const request = new NextRequest(url);

      const response = await customerSearchGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Formato inválido');
    });
  });

  describe('Customer Detail Endpoint', () => {
    it('should require customer ID', async () => {
      const params = Promise.resolve({ customerId: '' });
      const request = new NextRequest('http://localhost:3000/api/customers/');

      const response = await customerDetailGET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID requerido');
    });
  });

  describe('System Health Endpoint', () => {
    it('should return health status', async () => {
      const response = await healthGET();
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('clienteUnicoConnected');
      expect(data).toHaveProperty('iibBrokerConnected');
      expect(data).toHaveProperty('timestamp');
    });
  });
});
