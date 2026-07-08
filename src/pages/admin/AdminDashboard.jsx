import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, Activity, AlertTriangle,
  TrendingUp, Download, Plus, ChevronDown, FileText,
  CreditCard, ShoppingBag, UserPlus, LogIn,
} from 'lucide-react';
import { dashboardAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { openAdminReport, REPORT_OPTIONS } from '@/utils/generateAdminReport';
import RevenueChart from '@/components/dashboard/RevenueChart';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState('');
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const reportMenuRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    fetchTrends();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onOutside = (e) => {
      if (reportMenuRef.current && !reportMenuRef.current.contains(e.target)) {
        setReportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.get();
      setDashboardData(response.data.stats);
      setRecentActivity(response.data.recent_activity || []);
    } catch {
      setDashboardData({
        total_users: 0, total_clients: 0, active_memberships: 0,
        total_revenue: 0, monthly_revenue: 0, expiring_soon: 0,
        collected_revenue_month: 0, store_revenue_month: 0, plan_revenue_month: 0,
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await dashboardAPI.trends();
      setRevenueTrends(response.data.trends || []);
    } catch {
      setRevenueTrends([]);
    }
  };

  const activityIcon = (kind) => {
    switch (kind) {
      case 'plan_payment': return CreditCard;
      case 'store_payment':
      case 'store_order': return ShoppingBag;
      case 'membership': return UserPlus;
      case 'check_in': return LogIn;
      default: return DollarSign;
    }
  };

  const activityLabel = (item) => {
    switch (item.kind) {
      case 'plan_payment': return 'Plan payment';
      case 'store_payment': return 'Store payment';
      case 'store_order': return 'Store order';
      case 'membership': return 'New membership';
      case 'check_in': return 'Check-in';
      default: return 'Activity';
    }
  };

  const formatMoney = (n) => (n == null ? null : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleExportReport = async (type) => {
    setExporting(true);
    setExportError('');
    setReportMenuOpen(false);
    try {
      const res = await dashboardAPI.exportReport();
      openAdminReport(res.data, type);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setExportError(msg || 'Could not generate report. Allow pop-ups for Print/PDF.');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic">
            OPERATIONS <span className="text-primary-fixed">OVERVIEW</span>
          </h1>
          <p className="text-gray-400 mt-1">Real-time performance metrics.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative" ref={reportMenuRef}>
            <button
              type="button"
              onClick={() => setReportMenuOpen((o) => !o)}
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
              {exportDone ? 'Ready!' : 'Export Report'}
              <ChevronDown className={`w-4 h-4 transition-transform ${reportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {reportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-gray-500">
                      Choose report
                    </p>
                  </div>
                  {REPORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleExportReport(opt.id)}
                      className="w-full text-left px-4 py-3 border-b border-white/5 last:border-0
                                 hover:bg-white/5 transition-colors"
                    >
                      <p className="text-xs font-headline font-bold text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary-fixed shrink-0" />
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 pl-5">{opt.description}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/admin/products/add">
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 bg-primary-fixed text-black rounded-xl text-sm font-headline font-black uppercase hover:scale-105 transition-transform shadow-[0_0_15px_rgba(218,249,0,0.2)]">
              <Plus className="w-4 h-4" /> New Product
            </button>
          </Link>
        </div>
      </div>

      {exportError && (
        <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-4 py-2">{exportError}</p>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart trends={revenueTrends} />
        </div>

        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-headline font-black uppercase tracking-wider">Revenue Breakdown</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider -mt-2">This month</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Collected</span>
              <span className="text-lg font-black font-headline text-primary-fixed">
                {formatMoney(dashboardData?.collected_revenue_month ?? dashboardData?.monthly_revenue ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Plans</span>
              <span className="text-sm font-bold font-headline text-white">
                {formatMoney(dashboardData?.plan_revenue_month ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Store</span>
              <span className="text-sm font-bold font-headline text-white">
                {formatMoney(dashboardData?.store_revenue_month ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider">All-time (plans)</span>
              <span className="text-sm font-bold font-headline text-gray-400">
                {formatMoney(dashboardData?.total_revenue ?? 0)}
              </span>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="block text-center text-primary-fixed text-xs font-headline font-bold uppercase hover:underline pt-1"
          >
            View orders & payments
          </Link>
        </div>
      </div>

      <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headline font-black uppercase tracking-wider">Revenue Stream</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              Payments, orders, memberships & check-ins
            </p>
          </div>
          <Link to="/admin/orders" className="text-primary-fixed text-xs font-headline font-bold uppercase hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 8).map((item, i) => {
              const Icon = activityIcon(item.kind);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary-fixed" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-headline font-bold truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {activityLabel(item)} · {item.detail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {item.amount != null && item.amount > 0 && (
                      <p className="text-sm font-headline font-bold text-primary-fixed">{formatMoney(item.amount)}</p>
                    )}
                    <p className="text-[10px] text-gray-600 font-headline uppercase">{formatTime(item.at)}</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-600">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-headline uppercase">No recent revenue activity</p>
              <p className="text-xs text-gray-600 mt-1">Plan payments and store orders will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
