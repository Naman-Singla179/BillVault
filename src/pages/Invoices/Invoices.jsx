import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { getInvoices, getCustomers } from '../../services/storage'; 

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]); 

  useEffect(() => {
    setInvoices(getInvoices());
    setCustomers(getCustomers());
  }, []);

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id || c.id === Number(id));
    return customer ? customer.name : 'Unknown Customer';
  };

  return (
    <div className="invoices-page" style={{ padding: '20px' }}>
      <table className="invoice-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
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