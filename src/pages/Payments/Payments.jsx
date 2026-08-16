import { useState, useEffect } from 'react';
import PaymentForm from '../../components/payment/PaymentForm';
import { getPayments } from '../../services/storage';

function Payments() {
  const [payments, setPayments] = useState([]);

  function loadPayments() {
    const saved = getPayments();
    setPayments(saved);
  }

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Payments</h1>
      <PaymentForm onPaymentAdded={loadPayments} />

      <h2 style={{ marginTop: '24px' }}>Payment History</h2>
      {payments.length === 0 ? (
        <p>No payments recorded yet.</p>
      ) : (
        payments.map((payment) => (
          <div key={payment.id} style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
            {payment.id} — Invoice {payment.invoiceId} — ₹{payment.amount} — {payment.method} — {payment.date}
          </div>
        ))
      )}
    </div>
  );
}

export default Payments;