import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, Save, Upload, ToggleRight, ToggleLeft, Crown, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI, subscriptionsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', birth_date: '', fitness_goal: '', measurement_unit: 'metric', height_cm: '', weight_kg: '', workout_reminders: true, nutrition_alerts: true, system_updates: false,
  });

    useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        birth_date: user.birth_date || '', 
        fitness_goal: user.fitness_goal || '', 
        measurement_unit: user.measurement_unit || 'metric', 
        height_cm: user.height_cm || '', 
        weight_kg: user.weight_kg || '', 
        workout_reminders: user.workout_reminders ?? true, 
        nutrition_alerts: user.nutrition_alerts ?? true, 
        system_updates: user.system_updates ?? false,
      });
      
      fetchMembership();

      // Poll every 30 seconds to check if Admin approved the membership
      const interval = setInterval(fetchMembership, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchMembership = async () => {
    try {
      const res = await subscriptionsAPI.getMe();
      setMembership(res.data);
    } catch {
      setMembership(null);
    }
  };


  const handleCancelMembership = async () => {
    if (!window.confirm('Terminate your membership? You will be logged out. Your workout and nutrition history will be saved.')) return;
    try {
      const res = await subscriptionsAPI.cancel();
      await logout();
      navigate('/login', {
        replace: true,
        state: { message: res.data?.message || 'Membership terminated.' },
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel membership.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await profileAPI.update(formData);
      updateUser(response.data.user || response.data);
      setMessage({ type: 'success', text: 'Profile synchronized successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-black font-headline text-white uppercase italic tracking-tighter">
            SYSTEM <span className="text-primary-fixed">SETTINGS</span>
          </h1>
        </div >
      </motion.header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Toast Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 rounded-2xl border mb-8 flex items-center gap-3 ${
                message.type === 'success' 
                ? 'bg-primary-fixed/10 border-primary-fixed/20 text-primary-fixed' 
                : 'bg-error/10 border-error/20 text-error'
              }`}
            >
              {message.type === 'success' ? <Shield className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold uppercase tracking-wider">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Management */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary-fixed/10 rounded-lg text-primary-fixed">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-headline font-bold uppercase tracking-wider">Profile Management</h2>
              </div >
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-headline text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-fixed/50 transition-all" 
                    />
                  </div >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-headline text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-fixed/50 transition-all" 
                    />
                  </div >
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-10 py-3 bg-primary-fixed text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Synchronizing...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.section>
          </div >

          {/* Right Column: Membership Protocol Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary-fixed/20 via-zinc-900 to-black border border-primary-fixed/30 rounded-3xl p-8 relative overflow-hidden group shadow-2xl"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed/20 blur-[80px] rounded-full group-hover:bg-primary-fixed/40 transition-all duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3 bg-primary-fixed/10 rounded-2xl border border-primary-fixed/20 text-primary-fixed">
                    <Crown className="w-8 h-8" />
                  </div>
                  <span className={`px-4 py-1 text-[10px] font-black uppercase rounded-full tracking-widest border ${
                    membership?.payment_status === 'paid'
                      ? 'bg-primary-fixed text-black border-primary-fixed shadow-[0_0_15px_rgba(218,249,0,0.3)]'
                      : 'bg-white/5 text-gray-500 border-white/10'
                  }`}>
                    {membership?.payment_status === 'paid' ? 'Subscribed' : (membership?.payment_status || 'Guest')}
                  </span>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-3xl font-black font-headline text-white uppercase italic leading-tight">
                    {membership?.plan?.name || 'No Protocol Assigned'}
                  </h3>
                  <p className="text-gray-400 text-sm font-light">
                    {membership 
                      ? `Expiration: ${new Date(membership.end_date).toLocaleDateString()}` 
                      : 'Limited access profile.'}
                  </p>
                </div>

                {membership?.payment_status === 'paid' && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelMembership}
                      className="w-full py-3 bg-error/10 text-error border border-error/20 font-headline font-bold uppercase text-xs rounded-xl hover:bg-error hover:text-white transition-all"
                    >
                      Terminate Membership
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
