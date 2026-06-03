import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, DollarSign, Activity, AlertTriangle,
  TrendingUp, Download, Plus, CheckCircle,
} from 'lucide-react';
import { dashboardAPI, attendanceAPI } from '@/services/api';
import { Link } from 'react-router-dom';

/* ── tiny CSV export helper ── */
const exportCSV = (rows, filename) => {
  const headers = Object.keys(rows[0] || {}).join(',');
  const body = rows.map(r => Object.values(r).join(',')).join('\n');
  const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeStreams, setActiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchActiveStreams();
    const interval = setInterval(fetchActiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.get();
      setDashboardData(response.data.stats);
    } catch {
      setDashboardData({ total_users: 0, total_clients: 0, active_memberships: 0, total_revenue: 0, monthly_revenue: 0, expiring_soon: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveStreams = async () => {
    try {
      const response = await attendanceAPI.getActive();
      setActiveStreams(response.data.active_users || []);
    } catch {
      setActiveStreams([]);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = [
        { metric: 'Total Members',      value: dashboardData?.total_clients || 0 },
        { metric: 'Active Memberships', value: dashboardData?.active_memberships || 0 },
        { metric: 'Monthly Revenue',    value: dashboardData?.monthly_revenue || 0 },
        { metric: 'Expiring Soon',      value: dashboardData?.expiring_soon || 0 },
        { metric: 'Export Date',        value: new Date().toISOString() },
      ];
      exportCSV(rows, `alien-report-${new Date().toISOString().split('T')[0]}.csv`);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    { title: 'TOTAL MEMBERS',      value: dashboardData?.total_clients       || 0,  change: '+12%',   positive: true,  icon: Users,         color: 'text-primary-fixed' },
    { title: 'MONTHLY REVENUE',    value: `$${(dashboardData?.monthly_revenue || 0).toLocaleString()}`, change: '+8.4%', positive: true, icon: DollarSign, color: 'text-primary-fixed' },
    { title: 'ACTIVE MEMBERSHIPS', value: dashboardData?.active_memberships  || 0,  change: 'Today',  positive: null,  icon: Activity,      color: 'text-white' },
    { title: 'EXPIRING SOON',      value: dashboardData?.expiring_soon       || 0,  change: 'Review', positive: false, icon: AlertTriangle, color: 'text-error' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic">
            OPERATIONS <span className="text-primary-fixed">OVERVIEW</span>
          </h1>
          <p className="text-gray-400 mt-1">Real-time performance metrics.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Export Report — downloads CSV */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-headline font-bold uppercase transition-all
              ${exportDone
                ? 'bg-primary-fixed/10 border-primary-fixed/40 text-primary-fixed'
                : 'bg-surface-container-high border-white/10 text-white hover:border-white/30'
              } disabled:opacity-60`}
          >
            {exporting
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Download className="w-4 h-4" />
            }
            {exportDone ? 'Exported!' : 'Export Report'}
          </button>

          {/* New Product */}
          <Link to="/admin/products/add">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-fixed text-black rounded-xl text-sm font-headline font-black uppercase hover:scale-105 transition-transform shadow-[0_0_15px_rgba(218,249,0,0.2)]">
              <Plus className="w-4 h-4" /> New Product
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-surface-container-high border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                <p className={`text-3xl font-black font-headline ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color} opacity-40`} />
            </div>
            <div className="flex items-center gap-2">
              {stat.positive !== null && (
                <TrendingUp className={`w-3.5 h-3.5 ${stat.positive ? 'text-primary-fixed' : 'text-error'}`} />
              )}
              <span className={`text-xs font-headline font-bold ${stat.positive === true ? 'text-primary-fixed' : stat.positive === false ? 'text-error' : 'text-gray-500'}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active check-ins */}
      <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headline font-black uppercase tracking-wider">Active Stream</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Live member activity</p>
          </div>
          <Link to="/admin/members" className="text-primary-fixed text-xs font-headline font-bold uppercase hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {activeStreams.length > 0 ? (
            activeStreams.slice(0, 6).map((stream, i) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-primary-fixed" />
                  </div>
                  <div>
                    <p className="text-sm font-headline font-bold">{stream.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">Checked In</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-headline">
                  {new Date(stream.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-600">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-headline uppercase">No active check-ins</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;