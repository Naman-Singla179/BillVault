import { useState } from 'react';

import { getCustomers, getInvoices, saveInvoices } from '../../services/storage';

export default function CreateInvoice() {
  const [customers] = useState(() => getCustomers());

  const generateNewInvoiceId = () => {
    const existing = getInvoices();
    let maxId = 0;
    for (const inv of existing) {
      if (inv.id && String(inv.id).startsWith('INV-')) {
        const numStr = String(inv.id).replace('INV-', '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    }
    return `INV-${maxId + 1}`;
  };

  const getInitialInvoiceState = () => ({
    id: generateNewInvoiceId(),
    customerId: '',
    date: '',
    dueDate: '',
    items: [{ id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    status: 'PENDING'
  });

  const [invoice, setInvoice] = useState(getInitialInvoiceState);

  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.price));
  }, 0);

  const taxAmount = subtotal * (Number(invoice.tax) / 100);
  const total = subtotal + taxAmount - Number(invoice.discount);

  const handleItemChange = (index, field, value) => {
    setInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItemRow = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const handleSave = () => {
    if (!invoice.customerId) return alert("Select a customer!");
    if (!invoice.date) return alert("Select an invoice date!");
    if (!invoice.dueDate) return alert("Select a due date!");

    const invoiceToSave = {
      ...invoice,
      subtotal,
      total
    };

    const existing = getInvoices();
    const isDuplicate = existing.some(inv => inv.id === invoice.id);

    if (!isDuplicate) {
      saveInvoices([...existing, invoiceToSave]);
    }

    alert("Invoice Saved!");
    setInvoice(getInitialInvoiceState());
  };

  return (
    <div className="create-invoice" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Create Invoice</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Customer: </label>
          <select
            value={invoice.customerId}
            onChange={(e) => setInvoice(prev => ({ ...prev, customerId: e.target.value }))}
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
            onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
            style={{ padding: '5px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Due Date: </label>
          <input
            type="date"
            value={invoice.dueDate}
            onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
            style={{ padding: '5px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', fontWeight: 'bold' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>Description</div>
        <div style={{ width: '80px' }}>Quantity</div>
        <div style={{ width: '100px' }}>Price (₹)</div>
      </div>
      {invoice.items.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text" placeholder="Description" value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            style={{ flex: 1, minWidth: '150px', padding: '5px' }}
          />
          <input
            type="number" min="1" placeholder="Qty" value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            style={{ width: '80px', padding: '5px' }}
          />
          <input
            type="number" min="0" placeholder="Price" value={item.price}
            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
            style={{ width: '100px', padding: '5px' }}
          />
        </div>
      ))}
      <button onClick={addItemRow}>+ Add Item</button>

      <div className="totals-display" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>
          Tax (%): <input type="number" value={invoice.tax} onChange={e => setInvoice(prev => ({ ...prev, tax: e.target.value }))} style={{ width: '60px' }} />
        </p>
        <p>
          Discount (₹): <input type="number" value={invoice.discount} onChange={e => setInvoice(prev => ({ ...prev, discount: e.target.value }))} style={{ width: '80px' }} />
        </p>
        <h3>Total: ₹{total.toFixed(2)}</h3>
      </div>

      <button onClick={handleSave} style={{ background: 'green', color: 'white', padding: '10px 20px', marginTop: '20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Save Invoice
      </button>
    </div>
  );
}