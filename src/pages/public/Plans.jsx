import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Crown, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { membershipsAPI } from '@/services/api';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const Plans = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Modernized plan data with "tiers"
  const plans = [
    {
      id: 1,
      name: 'S-TIER PULSE',
      price: '49',
      period: 'month',
      tag: 'Essential',
      popular: false,
      features: ['24/7 Gym Access', 'Standard Equipment', 'Locker Room Access', 'Weekly Progress Track'],
      color: 'from-zinc-700 to-zinc-900',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 2,
      name: 'INTERSTELLAR',
      price: '399',
      period: 'year',
      tag: 'Most Popular',
      popular: true,
      features: ['VIP Priority Access', 'All Premium Equipment', 'Sauna & Cryotherapy', '12 Personal Training Sessions', 'Custom Nutrition Protocol', 'Priority Booking', 'Guest Passes (2/mo)'],
      color: 'from-primary-fixed/20 via-primary-fixed/10 to-black',
      icon: <Crown className="w-5 h-5" />,
    },
    {
      id: 3,
      name: 'ALPHA ORBIT',
      price: '129',
      period: 'month',
      tag: 'Advanced',
      popular: false,
      features: ['24/7 Gym Access', 'Premium Equipment', 'Recovery Zone Access', '3 Guest Passes / month', 'Monthly Assessment'],
      color: 'from-zinc-700 to-zinc-900',
      icon: <Star className="w-5 h-5" />,
    },
  ];

  const handleJoinPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleConfirmRequest = async () => {
    try {
      // Clean payload - backend now handles user_id automatically
      await membershipsAPI.create({
        plan_id: selectedPlan.id,
        start_date: new Date().toISOString().split('T')[0],
      });
      setShowModal(false);
      alert('Your request has been transmitted to the Architect. Notification will follow upon approval.');
    } catch (err) {
      alert('Transmission failed: ' + (err.response?.data?.message || 'System error'));
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
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
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
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-fixed text-black text-[10px] font-black uppercase rounded-full tracking-widest">
                  Elite Choice
                </div>
              )}

              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-2xl ${plan.popular ? 'bg-primary-fixed text-black' : 'bg-white/5 text-primary-fixed'}`}>
                  {plan.icon}
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
                onClick={() => handleJoinPlan(plan)}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 
                  ${plan.popular 
                    ? 'bg-black text-primary-fixed hover:bg-zinc-900 shadow-xl' 
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {plan.popular ? 'Begin Transformation' : 'Join Plan'}
              </button>
            </motion.div>
          ))}
        </div>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Protocol Confirmation" size="md">
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

            <div className="p-4 bg-primary-fixed/10 border border-primary-fixed/20 rounded-2xl flex gap-4">
              <div className="p-2 bg-primary-fixed/20 rounded-lg h-fit">
                <Shield className="w-5 h-5 text-primary-fixed" />
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                By submitting this request, you agree to the Alien Performance terms. Our admin will review your profile and activate your access within 24 hours.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1 py-4">Cancel</Button>
              <Button variant="primary" onClick={handleConfirmRequest} className="flex-1 py-4 flex items-center justify-center gap-2">
                Submit Request <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Plans;
