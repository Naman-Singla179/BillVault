import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, getCustomers } from '../../services/storage'; 

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices] = useState(() => getInvoices());
  const [customers] = useState(() => getCustomers()); 

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id || c.id === Number(id));
    return customer ? customer.name : 'Unknown Customer';
  };

  return (
    <div className="invoices-page page" style={{ padding: '20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Invoices</h1>
          <p>Manage all your created invoices</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
          + Create Invoice
        </button>
      </div>
      <table className="invoice-table card" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', padding: '20px', display: 'table' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Customer</th>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px' }}>Total</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr><td colSpan="5">No invoices found. Create one!</td></tr>
          ) : (
            invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px 0' }}>{inv.id}</td>
                <td>{getCustomerName(inv.customerId)}</td> 
                <td>{inv.date}</td>
                <td>₹{inv.total.toFixed(2)}</td>
                <td style={{ color: inv.status === 'PENDING' ? 'orange' : 'green' }}>{inv.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}