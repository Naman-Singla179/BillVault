import { useState, useEffect } from 'react';
import PaymentForm from '../../components/payment/PaymentForm';
import PaymentHistory from '../../components/payment/PaymentHistory';
import PaymentSummary from '../../components/payment/PaymentSummary';
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

      <PaymentSummary payments={payments} />

      <PaymentForm onPaymentAdded={loadPayments} />

      <h2 style={{ marginTop: '24px' }}>Payment History</h2>
      <PaymentHistory payments={payments} />
    </div>
  );
}

export default Payments;