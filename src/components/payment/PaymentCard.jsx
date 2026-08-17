// src/components/payment/PaymentCard.jsx

import { calculateTotalPaid, calculateRemaining, calculatePaymentStatus } from '../../utils/paymentUtils';
import PaymentStatus from './PaymentStatus';

const dummyInvoices = [
  { id: "INV001", customerName: "Rahul Sharma", total: 50000, dueDate: "2026-08-10" },
  { id: "INV002", customerName: "ABC Ltd", total: 30000, dueDate: "2026-08-20" },
  { id: "INV003", customerName: "Priya Singh", total: 20000, dueDate: "2026-07-01" },
];

function PaymentCard({ payment, allPayments }) {
  const invoice = dummyInvoices.find((inv) => inv.id === payment.invoiceId);
  const totalPaid = calculateTotalPaid(allPayments, payment.invoiceId);
  const status = calculatePaymentStatus(invoice, totalPaid);

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
      {payment.id} — Invoice {payment.invoiceId} — ₹{payment.amount} — {payment.method} — {payment.date} — <PaymentStatus status={status} />
    </div>
  );
}

export default PaymentCard;