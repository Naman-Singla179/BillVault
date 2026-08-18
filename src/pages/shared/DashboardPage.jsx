import React, { useState, useEffect } from 'react';
import { getInvoices, getPayments } from '../../services/storage';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    paid: 0,
    pending: 0,
    overdueCount: 0
  });

  useEffect(() => {
    const invoices = getInvoices();
    const payments = getPayments();

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    const totalPaid = payments.reduce((sum, pay) => sum + Number(pay.amount), 0);

    const totalPending = totalRevenue - totalPaid;

    const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE').length;

    setStats({
      revenue: totalRevenue,
      paid: totalPaid,
      pending: totalPending,
      overdueCount: overdueInvoices
    });
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">Total Revenue: ₹{stats.revenue.toFixed(2)}</div>
        <div className="stat-card">Amount Paid: ₹{stats.paid.toFixed(2)}</div>
        <div className="stat-card">Pending Balance: ₹{stats.pending.toFixed(2)}</div>
        <div className="stat-card">Overdue Invoices: {stats.overdueCount}</div>
      </div>
    </div>
  );
}