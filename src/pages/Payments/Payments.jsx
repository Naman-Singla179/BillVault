import { useState } from 'react';
import PaymentForm from '../../components/payment/PaymentForm';
import PaymentHistory from '../../components/payment/PaymentHistory';
import PaymentMethodChart from '../../components/payment/PaymentMethodChart';
import { useApp } from '../../context/AppContext';

function Payments() {
  const { payments: rawPayments, invoices, customers } = useApp();
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Most-recent-first, matching the original sorted order
  const payments = [...rawPayments].reverse();

  const displayedPayments = showAllPayments ? payments : payments.slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Record and track your incoming payments.</p>
        </div>
      </div>
      <PaymentForm />

      <PaymentMethodChart />

      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>{showAllPayments ? "All Transactions" : "Recent Transactions"}</h2>
          {payments.length > 5 && (
            <button className="btn-link" onClick={() => setShowAllPayments(!showAllPayments)}>
              {showAllPayments ? "Show Less ←" : "View More →"}
            </button>
          )}
        </div>

        <PaymentHistory
          payments={displayedPayments}
          invoices={invoices}
          customers={customers}
        />
      </section>
    </div>
  );
}

export default Payments;
