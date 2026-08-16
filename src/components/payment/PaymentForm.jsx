// src/components/payment/PaymentForm.jsx

import { useState } from "react";
import { getPayments, savePayments } from "../../services/storage";

const dummyInvoices = [
  { id: "INV001", customerName: "Rahul Sharma", total: 50000 },
  { id: "INV002", customerName: "ABC Ltd", total: 30000 },
  { id: "INV003", customerName: "Priya Singh", total: 20000 },
];

function PaymentForm({ onPaymentAdded }) {
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

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

    const invoice = dummyInvoices.find((inv) => inv.id === selectedInvoice);
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
          {dummyInvoices.map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.id} - {invoice.customerName} - ₹{invoice.total}
            </option>
          ))}
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