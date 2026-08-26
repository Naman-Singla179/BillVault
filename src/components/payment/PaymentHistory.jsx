import PaymentCard from './PaymentCard';

function PaymentHistory({ payments, invoices, customers }) {
  if (payments.length === 0) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'rgb(107, 114, 128)' }}>
        <p style={{ margin: 0 }}>No transactions recorded yet.</p>
      </div>
    );
  }

  return (
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
            <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => {
            const invoice = invoices.find(inv => String(inv.id) === String(payment.invoiceId));
            const customer = customers.find(c => String(c.id) === String(invoice?.customerId));
            return (
              <PaymentCard 
                key={payment.id} 
                payment={payment} 
                invoice={invoice} 
                customer={customer}
                isLast={index === payments.length - 1} 
                allPayments={payments} 
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentHistory;