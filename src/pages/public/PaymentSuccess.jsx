import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { paymentsAPI, subscriptionsAPI } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/common/Button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const token = searchParams.get('token');
  const { clearCart } = useCart();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [isPlanPayment, setIsPlanPayment] = useState(false);

  useEffect(() => {
    const capture = async () => {
      if (!paymentId || !token) {
        setStatus('error');
        setMessage('Missing payment information from PayPal.');
        return;
      }
      try {
        const res = await paymentsAPI.capture({
          payment_id: Number(paymentId),
          token,
        });
        setStatus('success');
        const planPayment = res.data?.payment?.type === 'plan';
        setIsPlanPayment(planPayment);
        let msg = res.data?.message || 'Payment successful.';
        if (res.data?.payment?.type === 'store') {
          clearCart();
        }
        if (planPayment) {
          try {
            const subRes = await subscriptionsAPI.getMe();
            if (subRes.data?.subscription_message) {
              msg = subRes.data.subscription_message;
            }
          } catch {
            /* subscription may still be activating */
          }
          window.dispatchEvent(new CustomEvent('notifications:refresh'));
        }
        setMessage(msg);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment verification failed.');
      }
    };
    capture();
  }, [paymentId, token, clearCart]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-10 text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary-fixed animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-black font-headline uppercase">Verifying Payment</h1>
            <p className="text-gray-400 text-sm mt-2">Please wait…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-primary-fixed mx-auto mb-4" />
            <h1 className="text-xl font-black font-headline uppercase text-primary-fixed">Payment Complete</h1>
            <p className="text-gray-400 text-sm mt-2">{message}</p>
            {message.toLowerCase().includes('subscribed') && (
              <p className="text-primary-fixed text-xs font-bold uppercase mt-3 tracking-wider">You are now subscribed</p>
            )}
            <div className="flex flex-col gap-3 mt-8">
              {isPlanPayment ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="primary" className="w-full">Go to Dashboard</Button>
                  </Link>
                  <Link to="/subscription">
                    <Button variant="secondary" className="w-full">My Subscription</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/store">
                    <Button variant="primary" className="w-full">Back to Store</Button>
                  </Link>
                  <Link to="/plans">
                    <Button variant="secondary" className="w-full">View Plans</Button>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-black font-headline uppercase text-error">Payment Issue</h1>
            <p className="text-gray-400 text-sm mt-2">{message}</p>
            <Link to="/plans" className="block mt-8">
              <Button variant="secondary" className="w-full">Try Again</Button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
