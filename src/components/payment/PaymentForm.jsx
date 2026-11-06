import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { formatInvoiceId, calculateTotalPaid } from "../../utils/paymentUtils";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import UpiQrCode from "./UpiQrCode";

function PaymentForm({ onPaymentAdded }) {
  const location = useLocation();
  const toast = useToast();
  const { invoices: allInvoices, customers, payments, addPayment } = useApp();

  const prefillInvoiceId = location.state?.invoiceId || "";
  const prefillAmount    = location.state?.amount    || "";

  // Warn once if the prefilled invoice id doesn't exist in the list.
  const warnedMissingRef = useRef(false);
  useEffect(() => {
    if (
      prefillInvoiceId &&
      !warnedMissingRef.current &&
      allInvoices.length > 0 &&
      !allInvoices.find((inv) => String(inv.id) === String(prefillInvoiceId))
    ) {
      warnedMissingRef.current = true;
      toast.info("That invoice couldn't be found.");
    }
  }, [prefillInvoiceId, allInvoices, toast]);

  // If the prefill id exists, start with it; otherwise start empty.
  const resolvedPrefill =
    prefillInvoiceId &&
    allInvoices.find((inv) => String(inv.id) === String(prefillInvoiceId))
      ? prefillInvoiceId
      : "";

  const [selectedInvoice, setSelectedInvoice] = useState(resolvedPrefill);
  const [amount, setAmount] = useState(resolvedPrefill ? prefillAmount : "");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  // ── Invoice availability checks ──────────────────────────────────────────
  const hasAnyInvoices = allInvoices.length > 0;
  const invoicesWithBalance = allInvoices.filter((inv) => {
    const paid = calculateTotalPaid(payments, inv.id);
    return Number(inv.total) - paid > 0;
  });
  const hasOutstanding = invoicesWithBalance.length > 0;

  // ── Submission ───────────────────────────────────────────────────────────
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

    const alreadyPaid = calculateTotalPaid(payments, selectedInvoice);

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

    addPayment(newPayment);
    toast.success("Payment recorded");

    setSelectedInvoice("");
    setAmount("");
    setMethod("Cash");
    setDate("");

    if (onPaymentAdded) {
      onPaymentAdded();
    }
  }

  // ── Derived display values ───────────────────────────────────────────────
  const currentInvoice = allInvoices.find((inv) => String(inv.id) === String(selectedInvoice));
  const currentInvoicePaid = currentInvoice ? calculateTotalPaid(payments, currentInvoice.id) : 0;
  const invoiceRemaining = currentInvoice ? Math.max(0, Number(currentInvoice.total) - currentInvoicePaid) : 0;

  const enteredAmount = parseFloat(amount);
  const isAmountWithinBalance =
    amount !== "" &&
    !isNaN(enteredAmount) &&
    enteredAmount > 0 &&
    enteredAmount <= invoiceRemaining;

  const qrAmount = isAmountWithinBalance ? enteredAmount : invoiceRemaining;
  const qrInvoiceId = currentInvoice ? formatInvoiceId(currentInvoice.id) : "";

  // ── Friendly empty states ────────────────────────────────────────────────
  if (!hasAnyInvoices) {
    return (
      <div className="card empty-state" style={{ padding: "40px 24px" }}>
        <h3>No invoices yet</h3>
        <p style={{ marginBottom: "20px" }}>
          Create an invoice first before recording a payment.
        </p>
        <Link to="/invoices" className="btn btn-primary">
          Go to Invoices
        </Link>
      </div>
    );
  }

  if (!hasOutstanding) {
    return (
      <div className="card empty-state" style={{ padding: "40px 24px" }}>
        <h3>All invoices are fully paid</h3>
        <p>There are no outstanding balances to record a payment against.</p>
      </div>
    );
  }

  // ── Normal form ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "16px" }}>Record Payment</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      <div className="form-row">
        <div className="form-field">
          <label>Invoice</label>
          <select
            value={selectedInvoice}
            onChange={(e) => setSelectedInvoice(e.target.value)}
          >
            <option value="">-- Select an invoice --</option>
            {allInvoices.map((invoice) => {
              const customer = customers.find(c => String(c.id) === String(invoice.customerId));
              const custName = customer ? customer.name : (invoice.customerName || invoice.customerId || "Unknown");

              const alreadyPaid = calculateTotalPaid(payments, invoice.id);
              const remaining = Number(invoice.total) - alreadyPaid;

              if (remaining <= 0) return null;

              return (
                <option key={invoice.id} value={invoice.id}>
                  {formatInvoiceId(invoice.id)} - {custName} - ₹{remaining.toFixed(2)} remaining
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-field">
          <label>Payment Date</label>
          <input
            type="date"
            min="2000-01-01"
            max="2099-12-31"
            value={date}
            onChange={(e) => {
              let val = e.target.value;
              if (val) {
                const parts = val.split('-');
                if (parts[0] && parts[0].length > 4) {
                  parts[0] = parts[0].slice(0, 4);
                  val = parts.join('-');
                }
              }
              setDate(val);
            }}
          />
        </div>
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

      {method === "UPI" && selectedInvoice && currentInvoice && (
        <div
          className="payment-form-qr-section"
          style={{
            borderTop: "1px solid rgb(38, 43, 54)",
            paddingTop: "16px",
            marginBottom: "20px",
          }}
        >
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "rgb(154, 161, 175)",
            }}
          >
            Scan to pay
          </h4>
          <UpiQrCode amount={qrAmount} invoiceId={qrInvoiceId} />
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Record Payment
        </button>
      </div>

    </form>
  );
}

export default PaymentForm;
