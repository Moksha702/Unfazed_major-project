import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import axiosInstance from '../../api/axiosInstance';

const CheckoutForm = ({
  amount,
  sessionId,
  packageId,
  clientId,
  therapistSlug,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  const handlePay = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Create order on backend
      const orderRes = await axiosInstance.post('/payments/create-order', {
        amount,
        sessionId,
        packageId,
        clientId,
        therapistSlug
      });

      const { order, keyId } = orderRes.data;

      // 2. Mock payment confirmation or Razorpay Checkout Modal
      const verifyRes = await axiosInstance.post('/payments/verify', {
        razorpay_order_id: order.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'valid_mock_signature_unfazed',
        sessionId,
        packageId,
        clientId,
        amount,
        therapistSlug
      });

      if (verifyRes.data.success) {
        setPaymentSuccessData(verifyRes.data);
        if (onSuccess) {
          onSuccess(verifyRes.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccessData) {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
        <p className="text-xs text-slate-500">
          Invoice #{paymentSuccessData.invoiceNumber} has been generated. A confirmation message has been queued.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <a
            href={`http://localhost:5000/api/payments/invoice/${paymentSuccessData.payment._id}`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
          >
            Download GST Tax Invoice (PDF)
          </a>
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" size="sm">
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-5">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Consultation Fee</span>
          <span>₹{amount}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>GST (Included @ 18%)</span>
          <span>₹{Math.round(amount - amount / 1.18)}</span>
        </div>
        <div className="flex items-center justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-200">
          <span>Total Payable</span>
          <span className="text-indigo-600">₹{amount}</span>
        </div>
      </div>

      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-900">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
        <span>Secured via Razorpay Payment Gateway (UPI / Cards / NetBanking).</span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button onClick={onCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        )}
        <Button
          onClick={handlePay}
          loading={loading}
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
        >
          Pay ₹{amount} with Razorpay
        </Button>
      </div>
    </div>
  );
};

export default CheckoutForm;
