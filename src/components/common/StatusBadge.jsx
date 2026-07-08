const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/40',
  paid: 'bg-green-500/20 text-green-400 border-green-500/40',
  failed: 'bg-red-500/20 text-red-400 border-red-500/40',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  completed: 'bg-green-500/20 text-green-400 border-green-500/40',
};

const normalizeLabel = (status) => {
  const map = {
    processing: 'shipped',
    completed: 'delivered',
  };
  return map[status] || status;
};

const StatusBadge = ({ status, label }) => {
  const key = normalizeLabel(status || 'pending');
  const style = STATUS_STYLES[key] || STATUS_STYLES.pending;
  const text = label || key;

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
