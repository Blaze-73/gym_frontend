import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, Save, Lock, 
  Trash2, AlertCircle, CheckCircle, 
  Smartphone, Mail, Globe, LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/api';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form States
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '', new_password: '', password_confirmation: '',
  });
  const [prefsForm, setPrefsForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
    systemUpdates: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // --- HANDLERS ---

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profileAPI.update(profileForm);
      updateUser(res.data.user || res.data);
      showMsg('success', 'Identity synchronized successfully.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileAPI.updatePassword(passwordForm);
      showMsg('success', 'Security credentials updated.');
      setPasswordForm({ current_password: '', new_password: '', password_confirmation: '' });
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileAPI.updateSettings(prefsForm);
      showMsg('success', 'System preferences updated.');
    } catch (err) {
      showMsg('error', 'Preference sync failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline text-white uppercase italic tracking-tighter">
            SYSTEM <span className="text-primary-fixed">COMMAND</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">
            Administrator Control Panel & Account Security
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-400 uppercase tracking-widest">
            Role: <span className="text-primary-fixed">System Architect</span>
          </div>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              message.type === 'success' ? 'bg-primary-fixed/10 border-primary-fixed/20 text-primary-fixed' : 'bg-error/10 border-error/20 text-error'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold uppercase tracking-wider">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: IDENTITY */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary-fixed/10 rounded-2xl text-primary-fixed">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black font-headline uppercase text-white">Identity Profile</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text" value={profileForm.name} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-primary-fixed outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="email" value={profileForm.email} 
                    onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-primary-fixed outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text" value={profileForm.phone} 
                    onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-primary-fixed outline-none transition-all"
                  />
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" loading={loading} variant="primary" className="w-full py-4">
                  Update Identity
                </Button>
              </div>
            </form>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary-fixed/10 rounded-2xl text-primary-fixed">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black font-headline uppercase text-white">Security Protocol</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                  <input 
                    type="password" value={passwordForm.current_password} 
                    onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-fixed outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" value={passwordForm.new_password} 
                    onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-fixed outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password" value={passwordForm.password_confirmation} 
                    onChange={e => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-fixed outline-none transition-all"
                  />
                </div>
              </div>
              <Button type="submit" loading={loading} variant="outline" className="w-full py-4">
                Reset Access Key
              </Button>
            </form>
          </section>
        </motion.div>

        {/* COLUMN 2: PREFERENCES & DANGER */}
        <div className="space-y-8">
          <motion.section 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary-fixed/10 rounded-2xl text-primary-fixed">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black font-headline uppercase text-white">Preferences</h2>
            </div>

            <form onSubmit={handlePrefsUpdate} className="space-y-6">
              {[
                { key: 'emailNotifications', label: 'Email Alerts', sub: 'Critical system updates via email' },
                { key: 'pushNotifications', label: 'Push Notifications', sub: 'Instant browser notifications' },
                { key: 'systemUpdates', label: 'Automatic Updates', sub: 'Sync preferences on all devices' },
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-white uppercase">{pref.label}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{pref.sub}</p>
                  </div>
                  <input 
                    type="checkbox" checked={prefsForm[pref.key]} 
                    onChange={e => setPrefsForm({...prefsForm, [pref.key]: e.target.checked})}
                    className="w-5 h-5 accent-primary-fixed bg-transparent border-white/20 rounded"
                  />
                </div>
              ))}
              <Button type="submit" loading={loading} variant="ghost" className="w-full py-3">
                Save Preferences
              </Button>
            </form>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-error/5 border border-error/20 rounded-3xl p-8 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-error/10 rounded-2xl text-error">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black font-headline uppercase text-error">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Permanently erase this administrator account and all associated security tokens.
                </p>
                <Button variant="danger" className="w-full py-3 text-[10px]">
                  Delete My Account
                </Button>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Wipe all member and financial data from the global database.
                </p>
                <Button variant="danger" className="w-full py-3 text-[10px]">
                  System Hard Reset
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
