import { useState, useEffect } from 'react';
import PaymentForm from '../../components/payment/PaymentForm';
import { getPayments, getInvoices, getCustomers } from '../../services/storage';
import { formatInvoiceId } from '../../utils/paymentUtils';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAllPayments, setShowAllPayments] = useState(false);

  function loadPayments() {
    const saved = getPayments();
    const sorted = [...saved].reverse();
    setPayments(sorted);
    setInvoices(getInvoices());
    setCustomers(getCustomers());
  }

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Record and track your incoming payments.</p>
        </div>
      </div>
      <PaymentForm onPaymentAdded={loadPayments} />

      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>{showAllPayments ? "All Transactions" : "Recent Transactions"}</h2>
          {payments.length > 5 && (
            <button className="btn-link" onClick={() => setShowAllPayments(!showAllPayments)}>
              {showAllPayments ? "Show Less ←" : "View More →"}
            </button>
          )}
        </div>

        {payments.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(51, 57, 71)' }}>
                  <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Payment ID</th>
                  <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Invoice ID</th>
                  <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Method</th>
                  <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(showAllPayments ? payments : payments.slice(0, 5)).map((payment, index, arr) => {
                  const isLast = index === arr.length - 1;

                  const invoice = invoices.find(inv => String(inv.id) === String(payment.invoiceId));
                  const customer = customers.find(c => String(c.id) === String(invoice?.customerId));
                  const custName = customer ? customer.name : (invoice?.customerName || invoice?.customerId || "Unknown");

                  return (
                    <tr key={payment.id} style={{ borderBottom: isLast ? 'none' : '1px solid rgb(51, 57, 71)' }}>
                      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{payment.id}</td>
                      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{formatInvoiceId(payment.invoiceId)}</td>
                      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{custName}</td>
                      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{payment.date || '—'}</td>
                      <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{payment.method}</td>
                      <td style={{ padding: '16px 20px', color: 'rgb(63, 182, 127)', fontWeight: 600 }}>₹{Number(payment.amount).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'rgb(107, 114, 128)' }}>
            <p style={{ margin: 0 }}>No transactions recorded yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Payments;