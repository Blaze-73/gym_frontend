import { useState, useEffect } from 'react';
import { adminOrdersAPI } from '@/services/api';
import { Package, CreditCard } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import Select from '@/components/common/Select';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

const AdminOrders = () => {
  const [tab, setTab] = useState('store');
  const [storeOrders, setStoreOrders] = useState([]);
  const [planPayments, setPlanPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, plansRes] = await Promise.all([
        adminOrdersAPI.getStoreOrders(),
        adminOrdersAPI.getPlanPayments(),
      ]);
      setStoreOrders(ordersRes.data?.data || ordersRes.data || []);
      setPlanPayments(Array.isArray(plansRes.data) ? plansRes.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await adminOrdersAPI.updateStoreOrderStatus(orderId, { status });
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const displayStatus = (s) => {
    if (s === 'processing') return 'shipped';
    if (s === 'completed') return 'delivered';
    return s;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 md:p-0">
      <div>
        <h1 className="text-4xl font-black font-headline text-white uppercase italic tracking-tighter">
          ORDERS & <span className="text-primary-fixed">PAYMENTS</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">Store fulfillment & plan subscriptions</p>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setTab('store')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline font-bold text-sm uppercase ${tab === 'store' ? 'bg-primary-fixed/20 text-primary-fixed' : 'text-gray-500'}`}
        >
          <Package className="w-4 h-4" /> Store Orders
        </button>
        <button
          onClick={() => setTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline font-bold text-sm uppercase ${tab === 'plans' ? 'bg-primary-fixed/20 text-primary-fixed' : 'text-gray-500'}`}
        >
          <CreditCard className="w-4 h-4" /> Plan Payments
        </button>
      </div>

      {tab === 'store' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Address</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {storeOrders.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No store orders yet</td></tr>
              ) : storeOrders.map((order) => (
                <tr key={order.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 font-mono text-primary-fixed">{order.order_number || `#${order.id}`}</td>
                  <td className="p-4 text-white">{order.customer_name || order.user?.name}</td>
                  <td className="p-4 text-gray-400">{order.customer_phone || '—'}</td>
                  <td className="p-4 text-gray-400 max-w-[180px] truncate" title={order.shipping_address}>{order.shipping_address || '—'}</td>
                  <td className="p-4 font-black text-white">${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="p-4"><StatusBadge status={order.payment_status || 'paid'} /></td>
                  <td className="p-4"><StatusBadge status={displayStatus(order.status)} /></td>
                  <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Select
                      size="sm"
                      disabled={updatingId === order.id}
                      value={displayStatus(order.status)}
                      onChange={(status) => updateOrderStatus(order.id, status)}
                      options={ORDER_STATUS_OPTIONS}
                      className="min-w-[120px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'plans' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Start</th>
                <th className="p-4">Expires</th>
              </tr>
            </thead>
            <tbody>
              {planPayments.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No plan payments yet</td></tr>
              ) : planPayments.map((row, i) => (
                <tr key={row.subscription?.id || i} className="border-t border-white/5">
                  <td className="p-4 text-white">{row.user_name}</td>
                  <td className="p-4 text-primary-fixed font-bold">{row.plan_name}</td>
                  <td className="p-4 text-white">${row.amount ? parseFloat(row.amount).toFixed(2) : '—'}</td>
                  <td className="p-4"><StatusBadge status={row.payment_status} /></td>
                  <td className="p-4 text-gray-400">{row.start_date ? new Date(row.start_date).toLocaleDateString() : '—'}</td>
                  <td className="p-4 text-gray-400">{row.end_date ? new Date(row.end_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
