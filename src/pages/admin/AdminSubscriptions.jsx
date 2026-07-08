import { useState, useEffect } from 'react';
import { adminSubscriptionsAPI } from '@/services/api';
import { Search, Crown, XCircle } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [terminating, setTerminating] = useState(null);
  const [confirmSub, setConfirmSub] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (statusFilter !== 'all') params.payment_status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await adminSubscriptionsAPI.getAll(params);
      setSubscriptions(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubscriptions();
  };

  const handleTerminate = async () => {
    if (!confirmSub) return;
    setTerminating(confirmSub.id);
    try {
      await adminSubscriptionsAPI.terminate(confirmSub.id);
      setConfirmSub(null);
      await fetchSubscriptions();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to terminate subscription');
    } finally {
      setTerminating(null);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  const isActive = (sub) =>
    sub.payment_status === 'paid' && new Date(sub.end_date) >= new Date(new Date().toDateString());

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
          SUBSCRIPTION <span className="text-primary-fixed">CONTROL</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">
          View and terminate member plans
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary-fixed/50 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'paid', 'pending', 'cancelled', 'failed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                statusFilter === s
                  ? 'bg-primary-fixed text-black border-primary-fixed'
                  : 'text-gray-400 border-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Member</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Start</th>
              <th className="p-4">End</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No subscriptions found</td></tr>
            ) : subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="p-4">
                  <p className="text-white font-bold">{sub.customer_name || sub.user?.name}</p>
                  <p className="text-gray-500 text-xs">{sub.customer_email || sub.user?.email}</p>
                </td>
                <td className="p-4 text-primary-fixed font-bold">{sub.plan?.name}</td>
                <td className="p-4 text-white">
                  ${sub.payment?.amount ? parseFloat(sub.payment.amount).toFixed(2) : '—'}
                </td>
                <td className="p-4">
                  <StatusBadge status={sub.payment_status} />
                  {isActive(sub) && (
                    <span className="ml-2 text-[9px] text-green-400 uppercase font-bold">Active</span>
                  )}
                </td>
                <td className="p-4 text-gray-400">{formatDate(sub.start_date)}</td>
                <td className="p-4 text-gray-400">{formatDate(sub.end_date)}</td>
                <td className="p-4">
                  {sub.payment_status === 'paid' && isActive(sub) ? (
                    <button
                      onClick={() => setConfirmSub(sub)}
                      disabled={terminating === sub.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-error/10 text-error border border-error/30 rounded-lg text-[10px] font-black uppercase hover:bg-error/20"
                    >
                      <XCircle className="w-3 h-3" /> Terminate
                    </button>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!confirmSub} onClose={() => setConfirmSub(null)} title="Terminate Subscription" size="sm">
        {confirmSub && (
          <div className="text-center space-y-6 py-4">
            <Crown className="w-12 h-12 text-error mx-auto" />
            <p className="text-gray-400 text-sm">
              Terminate <strong className="text-white">{confirmSub.user?.name || confirmSub.customer_name}</strong>&apos;s{' '}
              <strong className="text-primary-fixed">{confirmSub.plan?.name}</strong> subscription?
              <br />
              <span className="text-xs mt-2 block text-gray-500">
                Access ends immediately and the member is logged out. Their workouts, nutrition, and history are kept if they rejoin.
              </span>
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirmSub(null)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={handleTerminate} loading={terminating === confirmSub.id} className="flex-1">
                Terminate
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSubscriptions;
