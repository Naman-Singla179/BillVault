// src/components/payment/PaymentStatus.jsx

function PaymentStatus({ status }) {
  const colors = {
    "PAID": "rgb(63, 182, 127)",
    "PARTIALLY PAID": "rgb(217, 164, 65)",
    "OVERDUE": "rgb(229, 72, 77)",
    "PENDING": "rgb(154, 161, 175)",
  };

  return (
    <span style={{ color: colors[status], fontWeight: "bold" }}>
      {status}
    </span>
  );
}

export default PaymentStatus;