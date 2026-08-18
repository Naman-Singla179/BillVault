import React, { useState, useEffect } from 'react';

export default function CreateInvoice() {
  const [invoice, setInvoice] = useState({
    id: `INV-${Date.now()}`,
    customerId: '', 
    date: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    status: 'PENDING'
  });

  useEffect(() => {
    const newSubtotal = invoice.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    // Calculate total: Subtotal + Tax - Discount
    const taxAmount = newSubtotal * (invoice.tax / 100);
    const newTotal = newSubtotal + taxAmount - invoice.discount;

    setInvoice(prev => ({
      ...prev,
      subtotal: newSubtotal,
      total: newTotal
    }));
  }, [invoice.items, invoice.tax, invoice.discount]);

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('invoices')) || [];
    localStorage.setItem('invoices', JSON.stringify([...existing, invoice]));
    alert("Invoice Saved!");
  };

  return (
    <div className="create-invoice">
      <h2>Create Invoice</h2>
      
      <div className="totals-display">
        <p>Subtotal: ₹{invoice.subtotal}</p>
        <p>Total: ₹{invoice.total}</p>
      </div>
      
      <button onClick={handleSave}>Save Invoice</button>
    </div>
  );
}