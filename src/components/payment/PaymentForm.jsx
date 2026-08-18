import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPayments, savePayments, getInvoices, saveInvoices, getCustomers } from "../../services/storage";
import dummyInvoices from "../../data/dummyInvoices";

function PaymentForm({ onPaymentAdded }) {
  const location = useLocation();
  const [selectedInvoice, setSelectedInvoice] = useState(location.state?.invoiceId || "");
  const [amount, setAmount] = useState(location.state?.amount || "");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [allInvoices, setAllInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const savedInvoices = getInvoices();
    const savedCustomers = getCustomers();
    const savedPayments = getPayments();
    
    const combined = [...dummyInvoices, ...savedInvoices];
    // Deduplicate by ID to prevent React key collision if localStorage has duplicates
    const uniqueInvoices = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // Filter out fully paid invoices so they don't appear in the dropdown
    const unpaidInvoices = uniqueInvoices.filter(invoice => {
      if (invoice.status === "PAID") return false;
      
      // Calculate exact paid amount just to be 100% bulletproof
      let totalPaid = 0;
      for (let i = 0; i < savedPayments.length; i++) {
        if (savedPayments[i].invoiceId === invoice.id) {
          totalPaid += savedPayments[i].amount;
        }
      }
      return totalPaid < invoice.total;
    });

    setAllInvoices(unpaidInvoices);
    setCustomers(savedCustomers);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!selectedInvoice) {
      setError("Please select an invoice.");
      return;
    }

    const numericAmount = Number(amount);

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    const invoice = allInvoices.find((inv) => inv.id === selectedInvoice);
    const existingPayments = getPayments();

    let alreadyPaid = 0;
    for (let i = 0; i < existingPayments.length; i++) {
      if (existingPayments[i].invoiceId === selectedInvoice) {
        alreadyPaid += existingPayments[i].amount;
      }
    }

    const remaining = invoice.total - alreadyPaid;

    if (numericAmount > remaining) {
      setError(`Amount exceeds remaining balance of ₹${remaining}.`);
      return;
    }

    if (!date) {
      setError("Please select a payment date.");
      return;
    }

    const newPayment = {
      id: "PAY" + Date.now(),
      invoiceId: selectedInvoice,
      amount: numericAmount,
      method: method,
      date: date,
    };

    const updatedPayments = [...existingPayments, newPayment];
    savePayments(updatedPayments);

    // Update the invoice status based on new payments
    const savedInvoices = getInvoices();
    const invoiceIndex = savedInvoices.findIndex(inv => inv.id === selectedInvoice);
    const invoiceToUpdate = { ...invoice };
    const newTotalPaid = alreadyPaid + numericAmount;

    // Strict status calculation based on total payments
    if (newTotalPaid === invoiceToUpdate.total) {
      invoiceToUpdate.status = "PAID";
    } else if (newTotalPaid < invoiceToUpdate.total) {
      invoiceToUpdate.status = "PARTIALLY PAID";
    }

    if (invoiceIndex !== -1) {
      savedInvoices[invoiceIndex] = invoiceToUpdate;
      saveInvoices(savedInvoices);
    } else {
      saveInvoices([...savedInvoices, invoiceToUpdate]);
    }

    setSelectedInvoice("");
    setAmount("");
    setMethod("Cash");
    setDate("");

    if (onPaymentAdded) {
      onPaymentAdded();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "16px" }}>Record Payment</h2>

      {error && (
        <p style={{ color: "rgb(229, 72, 77)", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      <div className="form-field">
        <label>Invoice</label>
        <select
          value={selectedInvoice}
          onChange={(e) => setSelectedInvoice(e.target.value)}
        >
          <option value="">-- Select an invoice --</option>
          {allInvoices.map((invoice) => {
            const customer = customers.find(c => c.id === invoice.customerId);
            const custName = invoice.customerName || (customer ? customer.name : "Unknown");
            return (
              <option key={invoice.id} value={invoice.id}>
                {invoice.id} - {custName} - ₹{invoice.total}
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="form-field">
          <label>Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Payment Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Record Payment
        </button>
      </div>
    </form>
  );
}

export default PaymentForm;