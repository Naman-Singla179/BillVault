export function calculateTotalPaid(payments, invoiceId) {
  return (payments || []).reduce((sum, payment) => {
    return payment.invoiceId === invoiceId || String(payment.invoiceId) === String(invoiceId)
      ? sum + Number(payment.amount || 0)
      : sum;
  }, 0);
}

export function calculateRemaining(invoiceTotal, totalPaid) {
  const totalPaise = Math.round((Number(invoiceTotal) || 0) * 100);
  const paidPaise = Math.round((Number(totalPaid) || 0) * 100);
  const remainingPaise = Math.max(0, totalPaise - paidPaise);
  return remainingPaise / 100;
}

export function isOverdue(invoice) {
  if (!invoice || !invoice.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);

  return today > dueDate;
}

export function calculatePaymentStatus(invoice, totalPaid) {
  if (!invoice || invoice.total === undefined || invoice.total === null) {
    return "PENDING";
  }

  const totalPaise = Math.round((Number(invoice.total) || 0) * 100);
  const paidPaise = Math.round((Number(totalPaid) || 0) * 100);

  if (paidPaise >= totalPaise) {
    return "PAID";
  }

  if (paidPaise > 0) {
    return "PARTIALLY PAID";
  }

  if (isOverdue(invoice)) {
    return "OVERDUE";
  }

  return "PENDING";
}

export function reconcileInvoices(invoices, payments) {
  if (!Array.isArray(invoices)) {
    return [];
  }

  const safePayments = Array.isArray(payments) ? payments : [];
  const diffs = [];

  for (const invoice of invoices) {
    if (!invoice || !invoice.id) continue;

    if (typeof invoice.status === "string" && invoice.status.trim().toUpperCase() === "DRAFT") {
      continue;
    }

    const totalPaid = calculateTotalPaid(safePayments, invoice.id);
    const expectedStatus = calculatePaymentStatus(invoice, totalPaid);

    if (invoice.status !== expectedStatus) {
      diffs.push({
        id: invoice.id,
        status: expectedStatus,
      });
    }
  }

  return diffs;
}

export function formatInvoiceId(id) {
  if (!id) return '';
  const match = String(id).match(/^INV-(\d+)$/);
  if (match) {
    return `INV-${match[1].padStart(4, '0')}`;
  }
  return id;
}