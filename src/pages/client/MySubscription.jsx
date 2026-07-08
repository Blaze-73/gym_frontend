import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Calendar, Shield, Zap, ArrowRight, AlertTriangle, XCircle, CheckCircle, TrendingUp, TrendingDown, RefreshCw, Check, Lock } from 'lucide-react';
import { subscriptionsAPI, paymentsAPI, plansAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { enrichPlanFromApi } from '@/config/planUi';
import CheckoutForm, { emptyCheckoutForm } from '@/components/common/CheckoutForm';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import PlanBenefits from '@/components/plan/PlanBenefits';

const MySubscription = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [changeType, setChangeType] = useState('upgrade');
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutForm);

  const fetchSubscription = async () => {
    try {
      const res = await subscriptionsAPI.getMe();
      setSubscription(res.data);
      setError('');
    } catch (err) {
      setSubscription(null);
      if (err.response?.status !== 404) {
        setError('Could not load subscription.');
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchSubscription(),
        plansAPI.getAll()
          .then((res) => {
            const list = (Array.isArray(res.data) ? res.data : [])
              .filter((p) => [1, 2, 3].includes(Number(p.id)))
              .map(enrichPlanFromApi);
            setPlans(list);
          })
          .catch(() => setPlans([])),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const upgradePlans = plans.filter((p) => subscription?.upgrade_plan_ids?.includes(Number(p.id)));
  const downgradePlans = plans.filter((p) => subscription?.downgrade_plan_ids?.includes(Number(p.id)));
  const downgradeUnlocked = Boolean(subscription?.downgrade_unlocked);
  const downgradeWindowDays = subscription?.downgrade_window_days ?? 5;

  const openPlanChange = (plan, type) => {
    if (type === 'downgrade' && !downgradeUnlocked) return;
    setSelectedPlan(plan);
    setChangeType(type);
    setCheckoutError('');
    setCheckoutForm(emptyCheckoutForm());
    setShowChangeModal(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    if (!checkoutForm.customer_name?.trim() || !checkoutForm.customer_email?.trim()
      || !checkoutForm.customer_phone?.trim() || !checkoutForm.customer_address?.trim()) {
      setCheckoutError('Please fill in all contact fields.');
      return;
    }
    setProcessing(true);
    setCheckoutError('');
    try {
      const res = await paymentsAPI.checkoutPlan({
        plan_id: selectedPlan.id,
        ...checkoutForm,
      });
      const approvalUrl = res.data?.approval_url;
      if (approvalUrl) {
        window.location.href = approvalUrl;
        return;
      }
      setCheckoutError('Could not start PayPal checkout.');
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Payment could not be started.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysRemaining = subscription?.days_remaining;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  const handleCancelSubscription = async () => {
    setCancelling(true);
    setCancelMsg('');
    try {
      const res = await subscriptionsAPI.cancel();
      setShowCancelModal(false);
      await logout();
      navigate('/login', {
        replace: true,
        state: {
          message: res.data?.message || 'Subscription terminated. Your data has been saved.',
        },
      });
    } catch (err) {
      setCancelMsg(err.response?.data?.message || 'Could not cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 lg:p-10">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-fixed text-[10px] font-black uppercase tracking-widest mb-4">
          <Crown className="w-3 h-3" /> Active Protocol
        </div>
        <h1 className="text-3xl md:text-4xl font-black font-headline uppercase tracking-tight">
          My Subscription
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Current plan and expiration</p>
      </motion.header>

      {error && <p className="text-error text-sm mb-6">{error}</p>}
      {cancelMsg && !subscription && (
        <p className="text-primary-fixed text-sm mb-6 bg-primary-fixed/10 border border-primary-fixed/30 rounded-xl p-4">{cancelMsg}</p>
      )}

      {!subscription ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg bg-zinc-900/50 border border-white/10 rounded-3xl p-10 text-center"
        >
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-black font-headline uppercase mb-2">No Active Subscription</h2>
          <p className="text-gray-400 text-sm mb-6">
            Choose one of our three plans to unlock full gym access.
          </p>
          <Link to="/plans">
            <Button variant="primary" className="inline-flex items-center gap-2">
              View Plans <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl bg-zinc-900/50 border border-primary-fixed/20 rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-fixed/10 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-primary-fixed/10 border border-primary-fixed/30 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-primary-fixed shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-fixed">Status</p>
                <p className="text-xl sm:text-2xl font-black font-headline text-white uppercase">
                  {subscription.subscription_message || `Subscribed to ${subscription.plan?.name || 'your plan'}`}
                </p>
              </div>
            </div>

            {isExpiringSoon && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-bold text-sm uppercase">Ending Soon</p>
                  <p className="text-gray-300 text-sm mt-1">
                    {daysRemaining === 0
                      ? 'Your subscription expires today. Renew to keep access.'
                      : `Your plan expires in ${daysRemaining} day(s) on ${formatDate(subscription.end_date)}.`}
                  </p>
                  <Link to="/plans" className="inline-block mt-2 text-primary-fixed text-xs font-bold uppercase hover:underline">
                    Renew plan →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Current Plan</p>
                <h2 className="text-2xl font-black font-headline text-white uppercase">
                  {subscription.plan?.name || 'Plan'}
                </h2>
              </div>
              <StatusBadge status={subscription.payment_status} label={subscription.payment_status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-2">
                  <Calendar className="w-4 h-4 text-primary-fixed" /> Started
                </div>
                <p className="font-headline font-bold">{formatDate(subscription.start_date)}</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold mb-2">
                  <Shield className="w-4 h-4 text-primary-fixed" /> Expires
                </div>
                <p className="font-headline font-bold">{formatDate(subscription.end_date)}</p>
              </div>
            </div>

            {subscription.plan?.price != null && (
              <p className="text-gray-400 text-sm">
                Plan value: <span className="text-white font-black">${subscription.plan.price}</span>
              </p>
            )}

            <PlanBenefits
              features={subscription.features || subscription.plan?.features || []}
              title="Your plan benefits"
            />

            {(subscription.can_change_plan || upgradePlans.length > 0 || downgradePlans.length > 0) && (
              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-5">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary-fixed" />
                  <p className="text-sm font-headline font-black uppercase text-white tracking-wider">Change your plan</p>
                </div>
                <p className="text-gray-400 text-sm">
                  Upgrade anytime. Downgrade unlocks within {downgradeWindowDays} days of your plan end date. Your history stays saved.
                </p>

                {upgradePlans.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-fixed flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Upgrade
                    </p>
                    {upgradePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-primary-fixed/20 bg-primary-fixed/5"
                      >
                        <div>
                          <p className="font-headline font-black uppercase text-white">{plan.name}</p>
                          <p className="text-gray-400 text-xs mt-1">${plan.price}/{plan.period}</p>
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => openPlanChange(plan, 'upgrade')}
                          className="inline-flex items-center gap-2 shrink-0"
                        >
                          Upgrade <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {downgradePlans.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Downgrade
                    </p>
                    {!downgradeUnlocked && (
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        Unlocks when {downgradeWindowDays} days or less remain
                        {daysRemaining != null && daysRemaining >= 0 && (
                          <span className="text-gray-600">({daysRemaining} day{daysRemaining === 1 ? '' : 's'} left)</span>
                        )}
                      </p>
                    )}
                    {downgradePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                          downgradeUnlocked
                            ? 'border-white/10 bg-white/[0.02]'
                            : 'border-white/5 bg-black/30 opacity-80'
                        }`}
                      >
                        <div>
                          <p className="font-headline font-black uppercase text-white">{plan.name}</p>
                          <p className="text-gray-400 text-xs mt-1">${plan.price}/{plan.period}</p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => openPlanChange(plan, 'downgrade')}
                          disabled={!downgradeUnlocked}
                          className={`inline-flex items-center gap-2 shrink-0 ${
                            !downgradeUnlocked ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title={
                            downgradeUnlocked
                              ? `Downgrade to ${plan.name}`
                              : `Locked until ${downgradeWindowDays} days before plan ends`
                          }
                        >
                          {downgradeUnlocked ? (
                            <>Downgrade <ArrowRight className="w-4 h-4" /></>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" /> Downgrade
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {upgradePlans.length === 0 && downgradePlans.length === 0 && (
                  <p className="text-gray-500 text-sm">You are on the only available tier for your account.</p>
                )}
              </div>
            )}

            {(subscription.customer_phone || subscription.billing_address) && (
              <div className="text-sm text-gray-400 border-t border-white/10 pt-4 space-y-1">
                {subscription.customer_phone && <p>Phone: {subscription.customer_phone}</p>}
                {subscription.billing_address && <p>Address: {subscription.billing_address}</p>}
              </div>
            )}

            <div className="border-t border-white/10 pt-6">
              <p className="text-xs text-gray-500 mb-3">
                Terminating ends access immediately and logs you out. Your workouts, nutrition logs, and history stay on your account if you rejoin later.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Terminate Subscription
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Terminate Subscription" size="sm">
        <div className="text-center space-y-6 py-4">
          <XCircle className="w-14 h-14 text-error mx-auto" />
          <p className="text-gray-400 text-sm">
            Are you sure you want to end your <strong className="text-white">{subscription?.plan?.name}</strong> subscription?
            <br />
            <span className="text-xs mt-2 block text-gray-500">You will be logged out. All your data will be kept if you subscribe again.</span>
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="flex-1">Keep Plan</Button>
            <Button variant="danger" onClick={handleCancelSubscription} loading={cancelling} className="flex-1">
              Yes, Terminate
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        title={changeType === 'upgrade' ? 'Confirm Upgrade' : 'Confirm Downgrade'}
        size="lg"
      >
        {selectedPlan && (
          <div className="space-y-6 py-2">
            <div className="bg-black border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-black font-headline text-white uppercase">{selectedPlan.name}</h4>
                <span className="text-xl font-black text-primary-fixed">${selectedPlan.price}</span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                {changeType === 'upgrade' ? 'Moving to a higher tier' : 'Moving to a lower tier'}
              </p>
              <div className="space-y-2">
                {(selectedPlan.features || []).slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-primary-fixed shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>

            <CheckoutForm
              key={selectedPlan ? `change-${selectedPlan.id}-${changeType}` : 'change'}
              form={checkoutForm}
              onChange={setCheckoutForm}
            />

            <p className="text-xs text-gray-500">
              Complete PayPal checkout to switch plans. Your current plan ends when the new one activates. All saved data stays on your account.
            </p>

            {checkoutError && (
              <p className="text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3">{checkoutError}</p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowChangeModal(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleConfirmPlanChange} loading={processing} className="flex-1">
                Pay with PayPal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MySubscription;
