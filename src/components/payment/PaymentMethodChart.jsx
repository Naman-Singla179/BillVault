import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './PaymentMethodChart.css';

const DEFAULT_METHODS = [
  { name: 'Cash', color: 'rgb(56, 189, 248)' },
  { name: 'UPI', color: 'rgb(217, 164, 65)' },
  { name: 'Card', color: 'rgb(63, 182, 127)' },
  { name: 'Bank Transfer', color: 'rgb(167, 139, 250)' },
];

const OTHER_COLOR = 'rgb(148, 163, 184)';

const RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 22;

function roundMoney(num) {
  return Math.round((Number(num) || 0) * 100) / 100;
}

function normalizeMethod(raw) {
  const clean = String(raw || '').trim().toLowerCase();
  if (clean === 'cash') return 'Cash';
  if (clean === 'upi') return 'UPI';
  if (clean === 'card') return 'Card';
  if (clean === 'bank transfer' || clean === 'banktransfer') return 'Bank Transfer';
  return 'Other';
}

function PaymentMethodChart({ payments: propPayments }) {
  const { payments: ctxPayments } = useApp();

  const { breakdown, totalCollected, totalPayments, ariaLabel, segments } = useMemo(() => {
    const rawPayments = propPayments ?? ctxPayments ?? [];

    const methodTotals = {
      Cash: { method: 'Cash', amount: 0, count: 0, color: 'rgb(56, 189, 248)' },
      UPI: { method: 'UPI', amount: 0, count: 0, color: 'rgb(217, 164, 65)' },
      Card: { method: 'Card', amount: 0, count: 0, color: 'rgb(63, 182, 127)' },
      'Bank Transfer': { method: 'Bank Transfer', amount: 0, count: 0, color: 'rgb(167, 139, 250)' },
      Other: { method: 'Other', amount: 0, count: 0, color: OTHER_COLOR },
    };

    let totalAmt = 0;
    let totalCount = 0;

    rawPayments.forEach((p) => {
      if (!p) return;
      const key = normalizeMethod(p.method);
      const val = roundMoney(p.amount);

      methodTotals[key].amount = roundMoney(methodTotals[key].amount + val);
      methodTotals[key].count += 1;

      totalAmt = roundMoney(totalAmt + val);
      totalCount += 1;
    });

    const list = DEFAULT_METHODS.map((m) => methodTotals[m.name]);

    if (methodTotals.Other.count > 0 || methodTotals.Other.amount > 0) {
      list.push(methodTotals.Other);
    }

    const computedBreakdown = list.map((item) => {
      const percentage = totalAmt > 0
        ? Math.round((item.amount / totalAmt) * 1000) / 10
        : 0;
      return {
        ...item,
        percentage,
      };
    });

    let description;
    if (totalCount === 0) {
      description = 'Payment method breakdown: No payments recorded. Total collected: ₹0.00.';
    } else {
      const summaryItems = computedBreakdown
        .filter((item) => item.count > 0)
        .map((item) => `${item.method}: ₹${item.amount.toFixed(2)} (${item.percentage.toFixed(1)}%, ${item.count} ${item.count === 1 ? 'payment' : 'payments'})`);
      description = `Payment method breakdown: ${summaryItems.join(', ')}. Total collected: ₹${totalAmt.toFixed(2)} across ${totalCount} ${totalCount === 1 ? 'payment' : 'payments'}.`;
    }

    const computedSegments = [];
    let accumulatedStroke = 0;
    const eligibleItems = computedBreakdown.filter((item) => item.amount > 0 && totalAmt > 0);
    for (let i = 0; i < eligibleItems.length; i += 1) {
      const item = eligibleItems[i];
      const fraction = item.amount / totalAmt;
      const strokeLength = fraction * CIRCUMFERENCE;
      computedSegments.push({
        ...item,
        strokeLength,
        strokeOffset: accumulatedStroke,
      });
      accumulatedStroke += strokeLength;
    }

    return {
      breakdown: computedBreakdown,
      totalCollected: totalAmt,
      totalPayments: totalCount,
      ariaLabel: description,
      segments: computedSegments,
    };
  }, [propPayments, ctxPayments]);

  return (
    <div className="card payment-methods-card">
      <h2 className="payment-methods-title">Payment Methods</h2>

      <div className="payment-methods-body">
        <div className="payment-methods-chart-pane">
          {totalPayments === 0 ? (
            <div className="empty-state payment-chart-empty">
              <p>No payments yet</p>
            </div>
          ) : (
            <svg
              role="img"
              aria-label={ariaLabel}
              viewBox="0 0 200 200"
              className="payment-donut-svg"
            >
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke="rgb(38, 43, 54)"
                strokeWidth={STROKE_WIDTH}
              />

              <g transform="rotate(-90 100 100)">
                {segments.map((seg) => (
                  <circle
                    key={seg.method}
                    cx="100"
                    cy="100"
                    r={RADIUS}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={
                      segments.length === 1
                        ? `${CIRCUMFERENCE + 1} ${CIRCUMFERENCE}`
                        : `${seg.strokeLength} ${CIRCUMFERENCE}`
                    }
                    strokeDashoffset={-seg.strokeOffset}
                  >
                    <title>
                      {`${seg.method}: ₹${seg.amount.toFixed(2)} (${seg.percentage.toFixed(1)}%)`}
                    </title>
                  </circle>
                ))}
              </g>

              <text x="100" y="94" textAnchor="middle" className="payment-donut-total">
                ₹{totalCollected.toFixed(2)}
              </text>
              <text x="100" y="114" textAnchor="middle" className="payment-donut-label">
                Collected
              </text>
            </svg>
          )}
        </div>

        <ul className="payment-legend" aria-label="Payment methods legend">
          {breakdown.map((item) => {
            const isMuted = item.count === 0;
            return (
              <li
                key={item.method}
                className={`payment-legend-row ${isMuted ? 'payment-legend-row-muted' : ''}`}
              >
                <div className="payment-legend-item-header">
                  <span
                    className="payment-legend-dot"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="payment-legend-name">{item.method}</span>
                </div>
                <div className="payment-legend-item-data">
                  <span className="payment-legend-amount">
                    ₹{item.amount.toFixed(2)}
                  </span>
                  <span className="payment-legend-count">
                    {item.count} {item.count === 1 ? 'payment' : 'payments'}
                  </span>
                  <span className="payment-legend-percentage">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default PaymentMethodChart;
