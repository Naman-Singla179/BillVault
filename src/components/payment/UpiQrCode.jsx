import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './UpiQrCode.css';

function UpiQrCode({ amount, invoiceId, size = 200 }) {
  const { businessProfile } = useApp();

  const upiId = (businessProfile?.upiId || '').trim();
  const businessName = (businessProfile?.name || '').trim();

  const numAmount = Number(amount);
  const isAmountValid =
    amount !== '' &&
    amount !== null &&
    amount !== undefined &&
    !isNaN(numAmount) &&
    numAmount > 0;

  const [qrUrl, setQrUrl] = useState('');
  const [qrKey, setQrKey] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const timeoutRef = useRef(null);

  const currentKey = isAmountValid && upiId
    ? `${numAmount.toFixed(2)}_${invoiceId || ''}_${upiId}_${businessName}_${size}_${retryCount}`
    : '';

  // Create the QR code URL
  useEffect(() => {
    if (!upiId || !isAmountValid) return;

    const timer = setTimeout(() => {
      const paymentLink =
        `upi://pay?pa=${encodeURIComponent(upiId)}` +
        `&pn=${encodeURIComponent(businessName)}` +
        `&am=${numAmount.toFixed(2)}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent('Invoice ' + (invoiceId || ''))}`;

      let url =
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentLink)}` +
        `&size=${size}x${size}&margin=10`;

      if (retryCount > 0) {
        url += `&retry=${retryCount}`;
      }

      setQrUrl(url);
      setQrKey(currentKey);
      setIsLoaded(false);
      setHasError(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    upiId,
    businessName,
    numAmount,
    isAmountValid,
    invoiceId,
    size,
    retryCount,
    currentKey
  ]);

  // Show an error if the QR code takes too long to load
  useEffect(() => {
    if (!qrUrl) return;

    timeoutRef.current = setTimeout(() => {
      setHasError(true);
      setIsLoaded(false);
    }, 10000);

    return () => clearTimeout(timeoutRef.current);
  }, [qrUrl]);

  function handleImageLoad() {
    clearTimeout(timeoutRef.current);
    setIsLoaded(true);
    setHasError(false);
  }

  function handleImageError() {
    clearTimeout(timeoutRef.current);
    setHasError(true);
    setIsLoaded(false);
  }

  function handleRetry() {
    clearTimeout(timeoutRef.current);
    setRetryCount(retryCount + 1);
    setIsLoaded(false);
    setHasError(false);
  }

  // Check whether the business has saved a UPI ID
  if (!upiId) {
    return (
      <div className="upi-qr-empty empty-state">
        <p>
          Add your UPI ID in{' '}
          <Link to="/business-profile">Business Profile</Link>
          {' '}to show a payment QR
        </p>
      </div>
    );
  }

  // Check whether there is a valid amount to pay
  if (!isAmountValid) {
    return (
      <div className="upi-qr-empty empty-state">
        <p>No amount due</p>
      </div>
    );
  }

  const isLoading = qrKey !== currentKey || (!isLoaded && !hasError);

  return (
    <div className="upi-qr-container">
      {hasError ? (
        <div className="upi-qr-error" style={{ width: size }}>
          <p>Couldn't load the QR code. Check your internet connection.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="upi-qr-box">
          {isLoading && (
            <div
              className="upi-qr-placeholder"
              style={{ width: size, height: size }}
            >
              <div className="upi-qr-spinner" />
            </div>
          )}

          {qrUrl && qrKey === currentKey && (
            <img
              src={qrUrl}
              alt={`UPI payment QR code for ₹${numAmount.toFixed(2)}`}
              width={size}
              height={size}
              className={`upi-qr-image ${
                isLoaded && !isLoading ? 'visible' : 'hidden'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      )}

      {isLoaded && !isLoading && !hasError && (
        <div className="upi-qr-caption">
          {businessName && (
            <div className="upi-qr-caption-name">{businessName}</div>
          )}
          <div className="upi-qr-caption-upi">{upiId}</div>
          <div className="upi-qr-caption-amount">
            Pay ₹{numAmount.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default UpiQrCode;