import React, { useState, useEffect } from 'react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('invoices')) || [];
    setInvoices(savedInvoices);
  }, []);

  return (
    <div className="invoices-page">
      <div className="header">
        <h2>Invoices</h2>
        <button>+ Create New Invoice</button>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr><td colSpan="5">No invoices found. Create one!</td></tr>
          ) : (
            invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.customerId}</td>
                <td>{inv.date}</td>
                <td>₹{inv.total}</td>
                <td>{inv.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}