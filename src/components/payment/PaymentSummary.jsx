// src/components/payment/PaymentSummary.jsx

import { calculateTotalPaid, calculateRemaining, calculatePaymentStatus } from '../../utils/paymentUtils';
import dummyInvoices from '../../data/dummyInvoices';
import { getInvoices } from '../../services/storage';

function PaymentSummary({ payments }) {
  let totalRevenue = 0;
  let totalBilled = 0;
  let pendingPayments = 0;
  let overdueAmount = 0;

  const savedInvoices = getInvoices();
  const combined = [...dummyInvoices, ...savedInvoices];
  const uniqueInvoices = Array.from(new Map(combined.map(item => [item.id, item])).values());

  for (let i = 0; i < uniqueInvoices.length; i++) {
    const invoice = uniqueInvoices[i];
    const totalPaid = calculateTotalPaid(payments, invoice.id);
    const remaining = calculateRemaining(invoice.total, totalPaid);
    const status = calculatePaymentStatus(invoice, totalPaid);

    totalRevenue += totalPaid;
    totalBilled += invoice.total;

    if (status === "OVERDUE") {
      overdueAmount += remaining;
    } else {
      pendingPayments += remaining;
    }
  }

  const cardStyle = { padding: '16px', minWidth: '160px' };

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <div className="card" style={cardStyle}>
        <p>Total Revenue</p>
        <h2 style={{ color: 'rgb(63, 182, 127)' }}>₹{totalRevenue}</h2>
      </div>

      <div className="card" style={cardStyle}>
        <p>Total Billed</p>
        <h2>₹{totalBilled}</h2>
      </div>

      <div className="card" style={cardStyle}>
        <p>Pending Payments</p>
        <h2 style={{ color: 'rgb(217, 164, 65)' }}>₹{pendingPayments}</h2>
      </div>

      <div className="card" style={cardStyle}>
        <p>Overdue Amount</p>
        <h2 style={{ color: 'rgb(229, 72, 77)' }}>₹{overdueAmount}</h2>
      </div>
    </div>
  );
}

export default PaymentSummary;