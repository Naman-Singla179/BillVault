import React from 'react';

function PaymentStatus({ status }) {
  const colors = {
    "PAID": "rgb(63, 182, 127)",
    "PARTIALLY PAID": "orange",
    "OVERDUE": "red",
    "PENDING": "gray",
  };

  return (
    <span style={{ color: colors[status], fontWeight: "bold" }}>
      {status}
    </span>
  );
}

export default PaymentStatus;