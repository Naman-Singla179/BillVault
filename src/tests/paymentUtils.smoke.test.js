import {
  calculateTotalPaid,
  calculatePaymentStatus,
  reconcileInvoices,
} from '../utils/paymentUtils';

describe('paymentUtils smoke tests', () => {
  describe('calculateTotalPaid', () => {
    test('calculates total for matching invoiceId', () => {
      const payments = [
        { invoiceId: 'INV-101', amount: 500 },
        { invoiceId: 'INV-101', amount: 300 },
        { invoiceId: 'INV-102', amount: 200 },
      ];
      expect(calculateTotalPaid(payments, 'INV-101')).toBe(800);
      expect(calculateTotalPaid(payments, 'INV-999')).toBe(0);
    });

    test('handles empty or null payment list', () => {
      expect(calculateTotalPaid([], 'INV-101')).toBe(0);
      expect(calculateTotalPaid(null, 'INV-101')).toBe(0);
    });
  });

  describe('calculatePaymentStatus', () => {
    test('PAID wins over OVERDUE when invoice is fully paid past due date', () => {
      const overdueInvoice = {
        total: 1000,
        dueDate: '2020-01-01',
      };
      // Overdue with no payments -> OVERDUE
      expect(calculatePaymentStatus(overdueInvoice, 0)).toBe('OVERDUE');
      // Overdue with full payment -> PAID (PAID wins over OVERDUE)
      expect(calculatePaymentStatus(overdueInvoice, 1000)).toBe('PAID');
      // Overdue with excess payment -> PAID
      expect(calculatePaymentStatus(overdueInvoice, 1200)).toBe('PAID');
    });

    test('returns PARTIALLY PAID when partially paid even if past due date', () => {
      const overdueInvoice = {
        total: 1000,
        dueDate: '2020-01-01',
      };
      expect(calculatePaymentStatus(overdueInvoice, 500)).toBe('PARTIALLY PAID');
    });
  });

  describe('reconcileInvoices', () => {
    test('skips DRAFT invoices even if they have payments or are overdue', () => {
      const invoices = [
        { id: 'INV-DRAFT-1', status: 'DRAFT', total: 1000, dueDate: '2020-01-01' },
        { id: 'INV-DRAFT-2', status: 'draft', total: 500 },
        { id: 'INV-ACTIVE', status: 'PENDING', total: 500 },
      ];
      const payments = [
        { invoiceId: 'INV-DRAFT-1', amount: 1000 },
        { invoiceId: 'INV-ACTIVE', amount: 500 },
      ];

      const diffs = reconcileInvoices(invoices, payments);

      // Only INV-ACTIVE should produce a diff because DRAFT invoices are skipped
      expect(diffs).toEqual([
        { id: 'INV-ACTIVE', status: 'PAID' },
      ]);
    });
  });
});

