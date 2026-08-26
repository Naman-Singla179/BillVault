export function calculateTotalPaid(payments, invoiceId) {
  return payments.reduce((sum, payment) => {
    return payment.invoiceId === invoiceId ? sum + payment.amount : sum;
  }, 0);
}

export function calculateRemaining(invoiceTotal, totalPaid) {
  return Math.max(0, invoiceTotal - totalPaid);
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

export function formatInvoiceId(id) {
  if (!id) return '';
  const match = String(id).match(/^INV-(\d+)$/);
  if (match) {
    return `INV-${match[1].padStart(4, '0')}`;
  }
  return id;
}