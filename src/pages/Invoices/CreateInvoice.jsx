import React, { useState, useEffect } from 'react';
import { getCustomers, getInvoices, saveInvoices } from '../../services/storage';

export default function CreateInvoice() {
  const [customers, setCustomers] = useState([]);
  const [invoice, setInvoice] = useState({
    id: `INV-${Date.now()}`,
    customerId: '', 
    date: '',
    items: [{ id: Date.now(), description: '', quantity: 1, price: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    status: 'PENDING'
  });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  useEffect(() => {
    const newSubtotal = invoice.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.price));
    }, 0);
    
    const taxAmount = newSubtotal * (Number(invoice.tax) / 100);
    const newTotal = newSubtotal + taxAmount - Number(invoice.discount);

    setInvoice(prev => ({ ...prev, subtotal: newSubtotal, total: newTotal }));
  }, [invoice.items, invoice.tax, invoice.discount]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const handleSave = () => {
    if (!invoice.customerId) return alert("Select a customer!");
    const existing = getInvoices();
    saveInvoices([...existing, invoice]);
    alert("Invoice Saved!");
  };

  return (
    <div className="create-invoice" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Create Invoice</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Select Customer: </label>
        <select 
          value={invoice.customerId} 
          onChange={(e) => setInvoice({...invoice, customerId: e.target.value})}
        >
          <option value="">-- Choose Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <h3>Line Items</h3>
      {invoice.items.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" placeholder="Description" value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
          />
          <input 
            type="number" min="1" value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
          />
          <input 
            type="number" min="0" value={item.price}
            onChange={(e) => handleItemChange(index, 'price', e.target.value)} 
          />
        </div>
      ))}
      <button onClick={addItemRow}>+ Add Item</button>

      {/* 3. Totals Display */}
      <div className="totals-display" style={{ marginTop: '20px', borderTop: '1px solid #ccc' }}>
        <p>Subtotal: ₹{invoice.subtotal.toFixed(2)}</p>
        <p>
          Tax (%): <input type="number" value={invoice.tax} onChange={e => setInvoice({...invoice, tax: e.target.value})} />
        </p>
        <p>
          Discount (₹): <input type="number" value={invoice.discount} onChange={e => setInvoice({...invoice, discount: e.target.value})} />
        </p>
        <h3>Total: ₹{invoice.total.toFixed(2)}</h3>
      </div>
      
      <button onClick={handleSave} style={{ background: 'green', color: 'white', padding: '10px' }}>Save Invoice</button>
    </div>
  );
}