import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { ordersAPI } from '@/services/api';
import StatusBadge from '@/components/common/StatusBadge';

const TRACK_STEPS = [
  { key: 'pending', label: 'Pending', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const normalizeStatus = (status) => {
  if (status === 'processing') return 'shipped';
  if (status === 'completed') return 'delivered';
  return status;
};

const stepIndex = (status) => {
  const s = normalizeStatus(status);
  const i = TRACK_STEPS.findIndex((t) => t.key === s);
  return i >= 0 ? i : 0;
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ordersAPI.getAll();
        const list = res.data?.data || res.data || [];
        setOrders(Array.isArray(list) ? list : []);
        if (list.length > 0) setSelected(list[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-10">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black font-headline uppercase">My Orders</h1>
        <p className="text-gray-400 text-sm mt-2">Track your store purchases</p>
      </motion.header>

      {orders.length === 0 ? (
        <div className="max-w-md bg-zinc-900/50 border border-white/10 rounded-3xl p-10 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No orders yet</p>
          <Link to="/store" className="text-primary-fixed font-bold uppercase text-sm hover:underline">Browse Store</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selected?.id === order.id
                    ? 'border-primary-fixed/50 bg-primary-fixed/5'
                    : 'border-white/10 bg-zinc-900/30 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-mono text-primary-fixed text-sm">{order.order_number || `#${order.id}`}</p>
                    <p className="text-white font-bold mt-1">${parseFloat(order.total_amount).toFixed(2)}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={normalizeStatus(order.status)} />
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8"
            >
              <h2 className="text-xl font-black font-headline uppercase mb-6">Track Order</h2>

              <div className="flex justify-between mb-8 relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-primary-fixed transition-all"
                  style={{ width: `${(stepIndex(selected.status) / (TRACK_STEPS.length - 1)) * 100}%` }}
                />
                {TRACK_STEPS.map((step, i) => {
                  const active = i <= stepIndex(selected.status);
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        active ? 'bg-primary-fixed border-primary-fixed text-black' : 'bg-black border-white/20 text-gray-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase mt-2 ${active ? 'text-primary-fixed' : 'text-gray-600'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-6">
                <StatusBadge status={normalizeStatus(selected.status)} label={normalizeStatus(selected.status)} />
              </div>

              <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                <p className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-primary-fixed flex-shrink-0 mt-0.5" />
                  {selected.shipping_address || 'No address on file'}
                </p>
                <p><span className="text-gray-500">Phone:</span> {selected.customer_phone || '—'}</p>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-xs font-black uppercase text-gray-500">Products</p>
                {selected.items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-white/5">
                    <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                    <span className="text-primary-fixed font-bold">${parseFloat(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
