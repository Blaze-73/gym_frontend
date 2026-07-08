import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Crown, Star, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsAPI, subscriptionsAPI, plansAPI } from '@/services/api';
import { enrichPlanFromApi, isUpgradePlan, isDowngradePlan } from '@/config/planUi';
import { DEFAULT_PLANS } from '@/config/planDefaults';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import CheckoutForm, { emptyCheckoutForm } from '@/components/common/CheckoutForm';

const Plans = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requireSubscription = Boolean(location.state?.requireSubscription);
  const isWelcome = Boolean(location.state?.welcome);
  const isUpgradeFlow = Boolean(location.state?.upgrade);
  const isDowngradeFlow = Boolean(location.state?.downgrade);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutForm);
  const [checkoutFormKey, setCheckoutFormKey] = useState(0);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const loadPlans = (rawList) => {
    const list = (Array.isArray(rawList) ? rawList : [])
      .filter((p) => [1, 2, 3].includes(Number(p.id)))
      .map(enrichPlanFromApi)
      .sort((a, b) => a.id - b.id);
    setPlans(list.length ? list : DEFAULT_PLANS.map(enrichPlanFromApi));
  };

  useEffect(() => {
    plansAPI.getAll()
      .then((res) => loadPlans(res.data))
      .catch(() => loadPlans(DEFAULT_PLANS))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveSubscription(null);
      return;
    }
    subscriptionsAPI.getMe()
      .then((res) => setActiveSubscription(res.data))
      .catch(() => setActiveSubscription(null));
  }, [isAuthenticated]);

  const subscribedPlanId = activeSubscription?.plan?.id ?? activeSubscription?.plan_id ?? null;

  const isCurrentPlan = (planId) => subscribedPlanId != null && Number(subscribedPlanId) === Number(planId);
  const canUpgradeTo = (planId) => isUpgradePlan(subscribedPlanId, planId);
  const canDowngradeTo = (planId) => isDowngradePlan(subscribedPlanId, planId);
  const downgradeUnlocked = !activeSubscription || Boolean(activeSubscription.downgrade_unlocked);
  const downgradeWindowDays = activeSubscription?.downgrade_window_days ?? 5;

  useEffect(() => {
    if (isAuthenticated) {
      setCheckoutForm(emptyCheckoutForm());
    }
  }, [isAuthenticated, user?.id]);

  const handleJoinPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isCurrentPlan(plan.id)) {
      navigate('/subscription');
      return;
    }
    if (canDowngradeTo(plan.id) && !downgradeUnlocked) {
      return;
    }
    setSelectedPlan(plan);
    setCheckoutError('');
    setCheckoutForm(emptyCheckoutForm());
    setCheckoutFormKey((key) => key + 1);
    setShowModal(true);
  };

  const handleConfirmRequest = async () => {
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

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary-fixed selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-fixed/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-primary-fixed/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-fixed text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Zap className="w-3 h-3" /> Evolution Starts Here
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black font-headline mb-6 tracking-tighter leading-none"
          >
            SELECT YOUR <br /> <span className="text-primary-fixed italic">PROTOCOLS.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed"
          >
            Stop settling for average. Choose a membership tier designed to push your biology to its absolute limit.
          </motion.p>

          {isDowngradeFlow && activeSubscription && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-white/5 border border-white/20 text-left"
            >
              <p className="text-gray-300 font-headline font-black uppercase text-sm tracking-wider">
                Downgrade from {activeSubscription.plan?.name}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Choose a lower tier below. Your saved workouts and nutrition history stay on your account.
              </p>
            </motion.div>
          )}

          {isUpgradeFlow && activeSubscription && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-primary-fixed/10 border border-primary-fixed/30 text-left"
            >
              <p className="text-primary-fixed font-headline font-black uppercase text-sm tracking-wider">
                Upgrade from {activeSubscription.plan?.name}
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Pick a higher tier below. Your workouts, nutrition, and progress stay on your account.
              </p>
            </motion.div>
          )}

          {requireSubscription && !activeSubscription && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-primary-fixed/10 border border-primary-fixed/30 text-left"
            >
              <p className="text-primary-fixed font-headline font-black uppercase text-sm tracking-wider">
                {isWelcome ? 'Account created — choose your plan' : 'Subscription required'}
              </p>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                {isWelcome
                  ? 'Welcome to Alien Fitness. Pick a membership plan and complete checkout to unlock your dashboard, workouts, and member features.'
                  : 'You need an active membership plan before you can access the athlete dashboard.'}
              </p>
            </motion.div>
          )}

          {activeSubscription && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed/10 border border-primary-fixed/30 text-primary-fixed text-sm font-bold"
            >
              <CheckCircle className="w-4 h-4" />
              {activeSubscription.subscription_message || `Subscribed to ${activeSubscription.plan?.name}`}
              <Link to="/dashboard" className="text-black/70 hover:text-black ml-2 underline text-xs uppercase">
                Dashboard
              </Link>
              <Link to="/subscription" className="text-black/70 hover:text-black ml-1 underline text-xs uppercase">
                Manage
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {plansLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const PlanIcon = plan.Icon || Zap;
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group rounded-3xl p-8 flex flex-col border transition-all duration-500 
                ${plan.popular 
                  ? 'bg-gradient-to-b ' + plan.color + ' border-primary-fixed shadow-[0_0_40px_rgba(218,249,0,0.15)] scale-105 z-10' 
                  : 'bg-zinc-900/50 border-white/10 hover:border-white/30'
                }`}
            >
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-fixed text-black text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" /> Your plan
                </div>
              )}
              {plan.popular && !isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-fixed text-black text-[10px] font-black uppercase rounded-full tracking-widest">
                  Elite Choice
                </div>
              )}

              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-2xl ${plan.popular ? 'bg-primary-fixed text-black' : 'bg-white/5 text-primary-fixed'}`}>
                  <PlanIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{plan.tag}</span>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black font-headline text-white uppercase mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black font-headline text-white">${plan.price}</span>
                  <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 group/item">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${plan.popular ? 'bg-primary-fixed text-black' : 'bg-white/10 text-gray-400 group-hover/item:bg-primary-fixed group-hover/item:text-black'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-300 group-hover/item:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleJoinPlan(plan)}
                disabled={
                  isCurrentPlan(plan.id)
                  || (canDowngradeTo(plan.id) && !downgradeUnlocked)
                  || (subscribedPlanId != null && !canUpgradeTo(plan.id) && !canDowngradeTo(plan.id))
                }
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2
                  ${isCurrentPlan(plan.id)
                    ? 'bg-primary-fixed text-black cursor-default border border-primary-fixed shadow-[0_0_20px_rgba(218,249,0,0.25)]'
                    : canDowngradeTo(plan.id) && !downgradeUnlocked
                      ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed opacity-60'
                    : canDowngradeTo(plan.id)
                      ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/20'
                    : plan.popular
                      ? 'bg-black text-primary-fixed hover:bg-zinc-900 shadow-xl'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
              >
                {isCurrentPlan(plan.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Subscribed
                  </>
                ) : canUpgradeTo(plan.id) ? (
                  <>Upgrade <ArrowRight className="w-4 h-4" /></>
                ) : canDowngradeTo(plan.id) && !downgradeUnlocked ? (
                  <>
                    <Lock className="w-4 h-4" /> Downgrade locked
                  </>
                ) : canDowngradeTo(plan.id) ? (
                  <>Downgrade <ArrowRight className="w-4 h-4" /></>
                ) : (
                  plan.popular ? 'Begin Transformation' : 'Join Plan'
                )}
              </button>
            </motion.div>
            );
          })}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-fixed/5 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col items-center">
             <Shield className="w-12 h-12 text-primary-fixed mb-6" />
             <h3 className="text-2xl font-black font-headline uppercase mb-4">Secure Protocol</h3>
             <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
               All membership requests are reviewed by our Head Architect to ensure optimal placement in our training zones.
             </p>
          </div>
        </div>
      </section>

      {/* Modal Redesign */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Protocol Confirmation" size="lg">
        {selectedPlan && (
          <div className="space-y-6 py-4">
            <div className="bg-black border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Crown className="w-8 h-8 text-primary-fixed" />
              </div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black font-headline text-white uppercase">{selectedPlan.name}</h4>
                <span className="text-2xl font-black text-primary-fixed">${selectedPlan.price}</span>
              </div>
              <div className="space-y-3">
                {selectedPlan.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-primary-fixed" /> {f}
                  </div>
                ))}
              </div>
            </div>

            <CheckoutForm
              key={`checkout-${selectedPlan.id}-${checkoutFormKey}`}
              form={checkoutForm}
              onChange={setCheckoutForm}
            />

            <div className="p-4 bg-primary-fixed/10 border border-primary-fixed/20 rounded-2xl flex gap-4">
              <div className="p-2 bg-primary-fixed/20 rounded-lg h-fit">
                <Shield className="w-5 h-5 text-primary-fixed" />
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                You will be redirected to PayPal to complete your subscription. Your plan activates immediately after successful payment.
              </p>
            </div>

            {checkoutError && (
              <div className="text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3 space-y-2">
                <p>{checkoutError}</p>
                {checkoutError.includes('credentials missing') && (
                  <Link to="/paypal-setup" className="inline-block text-primary-fixed font-bold underline text-xs uppercase">
                    → Set up PayPal Sandbox now
                  </Link>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1 py-4">Cancel</Button>
              <Button variant="primary" onClick={handleConfirmRequest} disabled={processing} className="flex-1 py-4 flex items-center justify-center gap-2">
                {processing ? 'Redirecting…' : 'Pay with PayPal'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Plans;
