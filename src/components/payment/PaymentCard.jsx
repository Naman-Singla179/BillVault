function PaymentCard({ payment }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
      {payment.id} — Invoice {payment.invoiceId} — ₹{payment.amount} — {payment.method} — {payment.date}
    </div>
  );
}

export default PaymentCard;