import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCustomerCards, getCardById, getActiveCardCount } from './cards';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('Card Management Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCustomerCards', () => {
    it('should throw error when customer ID is empty', async () => {
      await expect(getCustomerCards('')).rejects.toThrow('Failed to fetch customer cards');
      await expect(getCustomerCards('   ')).rejects.toThrow('Failed to fetch customer cards');
    });

    it('should return empty array when customer is not found', async () => {
      // Mock customer lookup returning empty result
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      const result = await getCustomerCards('non-existent-customer-id');
      expect(result).toEqual([]);
    });

    it('should return empty array when customer has no cards', async () => {
      // Mock customer exists
      const customerMock = {
        id: 'customer-1',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'M',
      };

      let callCount = 0;
      const mockSelect = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: customer lookup
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([customerMock]),
              }),
            }),
          };
        } else {
          // Second call: cards lookup
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]), // No cards
            }),
          };
        }
      });

      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getCustomerCards('customer-1');
      expect(result).toEqual([]);
    });

    it('should return formatted card data when customer has cards', async () => {
      const customerMock = {
        id: 'customer-1',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'M',
      };

      const cardsMock = [
        {
          id: 'card-1',
          number: '4532123456789012',
          type: 'debit',
          status: 'active',
          expirationDate: new Date('2025-12-31'),
          issuanceDate: new Date('2020-01-01'),
        },
        {
          id: 'card-2',
          number: '5555123456789012',
          type: 'credit',
          status: 'expired',
          expirationDate: new Date('2026-08-31'),
          issuanceDate: new Date('2021-01-01'),
        },
      ];

      let callCount = 0;
      const mockSelect = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([customerMock]),
              }),
            }),
          };
        } else {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(cardsMock),
            }),
          };
        }
      });

      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getCustomerCards('customer-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'card-1',
        cardType: 'debit',
        status: 'active',
        lastFourDigits: '9012',
        cardholderName: 'John M Doe',
      });
      expect(result[0].expirationDate).toMatch(/\d{2}\/\d{2}/); // MM/YY format
      expect(result[1].status).toBe('blocked'); // expired mapped to blocked
    });

    it('should handle database errors gracefully', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      await expect(getCustomerCards('customer-1')).rejects.toThrow('Failed to fetch customer cards');
    });
  });

  describe('getCardById', () => {
    it('should throw error when card ID is empty', async () => {
      await expect(getCardById('')).rejects.toThrow('Failed to fetch card');
      await expect(getCardById('   ')).rejects.toThrow('Failed to fetch card');
    });

    it('should return null when card is not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      const result = await getCardById('non-existent-card-id');
      expect(result).toBeNull();
    });

    it('should return formatted card data when card is found', async () => {
      const cardWithCustomerMock = {
        cardId: 'card-1',
        cardNumber: '4532123456789012',
        cardType: 'credit',
        cardStatus: 'active',
        expirationDate: new Date('2025-12-31'),
        customerId: 'customer-1',
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: 'A',
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([cardWithCustomerMock]),
            }),
          }),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      const result = await getCardById('card-1');

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        id: 'card-1',
        cardType: 'credit',
        status: 'active',
        lastFourDigits: '9012',
        cardholderName: 'Jane A Smith',
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error('Database error')),
            }),
          }),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      await expect(getCardById('card-1')).rejects.toThrow('Failed to fetch card');
    });
  });

  describe('getActiveCardCount', () => {
    it('should return 0 when customer ID is empty', async () => {
      const count = await getActiveCardCount('');
      expect(count).toBe(0);
    });

    it('should return 0 when customer has no cards', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      const count = await getActiveCardCount('customer-1');
      expect(count).toBe(0);
    });

    it('should return correct count when customer has cards', async () => {
      const cardsMock = [
        { id: 'card-1' },
        { id: 'card-2' },
        { id: 'card-3' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(cardsMock),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      const count = await getActiveCardCount('customer-1');
      expect(count).toBe(3);
    });

    it('should return 0 on database errors', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect());

      const count = await getActiveCardCount('customer-1');
      expect(count).toBe(0);
    });
  });
});
