import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { paymentsAPI } from '@/services/api';
import Button from '@/components/common/Button';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      paymentsAPI.cancel({ payment_id: Number(paymentId) }).catch(() => {});
    }
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-10 text-center"
      >
        <XCircle className="w-14 h-14 text-gray-500 mx-auto mb-4" />
        <h1 className="text-xl font-black font-headline uppercase">Payment Cancelled</h1>
        <p className="text-gray-400 text-sm mt-2">No charge was made. You can try again anytime.</p>
        <div className="flex flex-col gap-3 mt-8">
          <Link to="/plans">
            <Button variant="primary" className="w-full">View Plans</Button>
          </Link>
          <Link to="/store">
            <Button variant="secondary" className="w-full">Back to Store</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
