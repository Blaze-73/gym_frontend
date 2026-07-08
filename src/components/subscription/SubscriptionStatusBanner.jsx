import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, CheckCircle, ArrowRight, AlertTriangle, GraduationCap } from 'lucide-react';
import { subscriptionsAPI, entitlementsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Compact subscription status — dashboard, sidebar, etc.
 * variant: 'banner' | 'compact' | 'inline'
 */
const SubscriptionStatusBanner = ({ variant = 'banner', className = '' }) => {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [staffPass, setStaffPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      entitlementsAPI.getMe().catch(() => null),
      subscriptionsAPI.getMe().catch(() => null),
    ]).then(([entRes, subRes]) => {
      const ent = entRes?.data;
      if (ent?.subscribed && ent?.is_staff_pass) {
        setStaffPass(ent);
        setSub(null);
      } else {
        setStaffPass(null);
        setSub(subRes?.data || null);
      }
    }).finally(() => setLoading(false));
  }, [user?.role]);

  if (loading) return null;

  if (staffPass) {
    const passName = staffPass.plan_name || 'Coach Pass';
    if (variant === 'inline') {
      return (
        <p className={`text-[10px] text-primary-fixed uppercase tracking-wider flex items-center gap-1 font-bold ${className}`}>
          <GraduationCap className="w-3 h-3 shrink-0" />
          {passName} · Full Access
        </p>
      );
    }
    if (variant === 'compact') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed text-[10px] font-black uppercase">
            <GraduationCap className="w-3 h-3" /> {passName}
          </span>
        </div>
      );
    }
    return null;
  }

  const planName = sub?.plan?.name || 'Membership Plan';
  const daysLeft = sub?.days_remaining;
  const expiringSoon = daysLeft != null && daysLeft <= 7 && daysLeft >= 0;

  if (!sub) {
    if (variant === 'inline') {
      return (
        <Link
          to="/plans"
          className={`text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-primary-fixed transition-colors ${className}`}
        >
          Subscribe to a plan →
        </Link>
      );
    }
    if (variant === 'compact') return null;
    return (
      <div className={`bg-zinc-900/60 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
        <div>
          <p className="text-xs font-headline font-bold uppercase text-gray-500">Membership</p>
          <p className="text-white font-headline font-bold mt-1">You are not subscribed yet</p>
        </div>
        <Link
          to="/plans"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-fixed text-black rounded-xl text-xs font-headline font-black uppercase"
        >
          View plans <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <p className={`text-[10px] text-primary-fixed uppercase tracking-wider flex items-center gap-1 font-bold ${className}`}>
        <CheckCircle className="w-3 h-3 shrink-0" />
        Subscribed · {planName}
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed text-[10px] font-black uppercase">
          <CheckCircle className="w-3 h-3" /> Subscribed
        </span>
        <span className="text-xs text-gray-400 truncate">{planName}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${
        expiringSoon
          ? 'bg-yellow-500/5 border-yellow-500/25'
          : 'bg-gradient-to-r from-primary-fixed/10 via-zinc-900/80 to-zinc-900/80 border-primary-fixed/25'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed/20 border border-primary-fixed/40 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-primary-fixed" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-black text-[10px] font-black uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" /> Subscribed
              </span>
              {expiringSoon && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase border border-yellow-500/30">
                  <AlertTriangle className="w-3 h-3" /> Ending soon
                </span>
              )}
            </div>
            <p className="text-lg sm:text-xl font-black font-headline text-white uppercase">
              {planName}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Active until {formatDate(sub.end_date)}
              {daysLeft != null && daysLeft >= 0 && (
                <span className="text-gray-500"> · {daysLeft === 0 ? 'expires today' : `${daysLeft} day(s) left`}</span>
              )}
            </p>
          </div>
        </div>
        <Link
          to="/subscription"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl text-xs font-headline font-bold uppercase text-gray-300 hover:text-white hover:border-primary-fixed/30 transition-colors shrink-0"
        >
          Manage <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatusBanner;
