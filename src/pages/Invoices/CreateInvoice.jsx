import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, getInvoices, saveInvoices } from '../../services/storage';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  
  const [invoice, setInvoice] = useState({
    id: `INV-${Date.now()}`,
    customerId: '', 
    date: '',
    dueDate: '', // <-- New field for Member 3's logic
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
    if (!invoice.date) return alert("Select an invoice date!");
    if (!invoice.dueDate) return alert("Select a due date!"); 
    
    const existing = getInvoices();
    const isDuplicate = existing.some(inv => inv.id === invoice.id);
    
    if (!isDuplicate) {
      saveInvoices([...existing, invoice]);
    }
    
    alert("Invoice Saved!");
    navigate('/payment', { state: { invoiceId: invoice.id, amount: invoice.total } });
  };

  return (
    <div className="create-invoice" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Create Invoice</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Customer: </label>
          <select 
            value={invoice.customerId} 
            onChange={(e) => setInvoice({...invoice, customerId: e.target.value})}
            style={{ padding: '5px' }}
          >
            <option value="">-- Choose Customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Invoice Date: </label>
          <input 
            type="date" 
            value={invoice.date}
            onChange={(e) => setInvoice({...invoice, date: e.target.value})}
            style={{ padding: '5px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Due Date: </label>
          <input 
            type="date" 
            value={invoice.dueDate}
            onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})}
            style={{ padding: '5px' }}
          />
        </div>
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

      <div className="totals-display" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p>Subtotal: ₹{invoice.subtotal.toFixed(2)}</p>
        <p>
          Tax (%): <input type="number" value={invoice.tax} onChange={e => setInvoice({...invoice, tax: e.target.value})} style={{ width: '60px' }}/>
        </p>
        <p>
          Discount (₹): <input type="number" value={invoice.discount} onChange={e => setInvoice({...invoice, discount: e.target.value})} style={{ width: '80px' }}/>
        </p>
        <h3>Total: ₹{invoice.total.toFixed(2)}</h3>
      </div>
      
      <button onClick={handleSave} style={{ background: 'green', color: 'white', padding: '10px 20px', marginTop: '20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Save Invoice
      </button>
    </div>
  );
}