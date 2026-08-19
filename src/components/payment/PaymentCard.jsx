import { calculateTotalPaid, calculatePaymentStatus } from '../../utils/paymentUtils';
import dummyInvoices from '../../data/dummyInvoices';
import { getInvoices } from '../../services/storage';
import PaymentStatus from './PaymentStatus';

function PaymentCard({ payment, allPayments }) {
  const allSavedInvoices = getInvoices();
  const combined = [...dummyInvoices, ...allSavedInvoices];
  const invoice = combined.find((inv) => inv.id === payment.invoiceId);
  const totalPaid = calculateTotalPaid(allPayments, payment.invoiceId);
  const status = calculatePaymentStatus(invoice, totalPaid);

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
      {payment.id} — Invoice {payment.invoiceId} — ₹{payment.amount} — {payment.method} — {payment.date} — <PaymentStatus status={status} />
    </div>
  );
}

export default PaymentCard;