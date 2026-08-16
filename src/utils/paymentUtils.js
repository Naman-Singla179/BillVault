export function calculateTotalPaid(payments, invoiceId) {
  let total = 0;

  for (let i = 0; i < payments.length; i++) {
    if (payments[i].invoiceId === invoiceId) {
      total = total + payments[i].amount;
    }
  }

  return total;
}

export function calculateRemaining(invoiceTotal, totalPaid) {
  let remaining = invoiceTotal - totalPaid;

  if (remaining < 0) {
    remaining = 0;
  }

  return remaining;
}

export function isOverdue(invoice) {
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);

  return today > dueDate;
}

export function calculatePaymentStatus(invoice, totalPaid) {
  if (totalPaid >= invoice.total) {
    return "PAID";
  }

  if (totalPaid > 0) {
    return "PARTIALLY PAID";
  }

  if (isOverdue(invoice)) {
    return "OVERDUE";
  }

  return "PENDING";
}