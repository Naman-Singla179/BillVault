import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { getInvoices } from '../../services/storage'; 

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  return (
    <div className="invoices-page" style={{ padding: '20px' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Invoices</h2>
        <Link to="/invoices/create" style={{ padding: '10px 15px', background: 'blue', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          + Create New Invoice
        </Link>
      </div>

      <table className="invoice-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black' }}>
            <th>Invoice ID</th>
            <th>Customer ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No invoices found. Create one!</td></tr>
          ) : (
            invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px 0' }}>{inv.id}</td>
                <td>{inv.customerId}</td>
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