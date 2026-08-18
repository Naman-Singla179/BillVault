import { calculateTotalPaid, calculatePaymentStatus } from '../../utils/paymentUtils';
import PaymentStatus from './PaymentStatus';

import { getInvoices } from '../../services/storage';

function PaymentCard({ payment, allPayments }) {
  const savedInvoices = getInvoices();
  const invoice = savedInvoices.find((inv) => String(inv.id) === String(payment.invoiceId));
  const totalPaid = calculateTotalPaid(allPayments, payment.invoiceId);
  const status = invoice ? calculatePaymentStatus(invoice, totalPaid) : "UNKNOWN";

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
      {payment.id} — Invoice {payment.invoiceId} — ₹{payment.amount} — {payment.method} — {payment.date} — <PaymentStatus status={status} />
    </div>
  );
}

export default PaymentCard;