import { calculateTotalPaid, calculatePaymentStatus, formatInvoiceId } from '../../utils/paymentUtils';
import PaymentStatus from './PaymentStatus';

function PaymentCard({ payment, invoice, customer, isLast, allPayments }) {
  const custName = customer ? customer.name : (invoice?.customerName || invoice?.customerId || "Unknown");
  const totalPaid = calculateTotalPaid(allPayments, payment.invoiceId);
  const status = calculatePaymentStatus(invoice || {}, totalPaid);

  return (
    <tr style={{ borderBottom: isLast ? 'none' : '1px solid rgb(51, 57, 71)' }}>
      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{payment.id}</td>
      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{formatInvoiceId(payment.invoiceId)}</td>
      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{custName}</td>
      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{payment.date || '—'}</td>
      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{payment.method}</td>
      <td style={{ padding: '16px 20px', color: 'rgb(63, 182, 127)', fontWeight: 600 }}>₹{Number(payment.amount).toFixed(2)}</td>
      <td style={{ padding: '16px 20px' }}><PaymentStatus status={status} /></td>
    </tr>
  );
}

export default PaymentCard;