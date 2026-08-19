import PaymentCard from './PaymentCard';

function PaymentHistory({ payments }) {
  if (payments.length === 0) {
    return <p>No payments recorded yet.</p>;
  }

  return (
    <div>
      {payments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} allPayments={payments} />
      ))}
    </div>
  );
}

export default PaymentHistory;