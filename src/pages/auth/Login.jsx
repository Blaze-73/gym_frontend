import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveClientHomePath } from '@/utils/clientHomePath';
import Logo from '@/components/common/Logo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const sessionMessage = location.state?.message;
  const returnTo = location.state?.returnTo;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const responseData = await login(formData);
      const redirectPath = returnTo || localStorage.getItem('redirectPath');
      localStorage.removeItem('redirectPath');

      if (responseData.user?.role === 'admin') {
        navigate(redirectPath || '/admin');
      } else if (responseData.user?.role === 'coach') {
        navigate(redirectPath || '/coach-portal');
      } else if (returnTo) {
        navigate(returnTo);
      } else {
        const home = await resolveClientHomePath(redirectPath || '/dashboard');
        navigate(home, home === '/plans' ? { state: { requireSubscription: true } } : undefined);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">
      {/* CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80" 
          className="w-full h-full object-cover scale-105"
          alt="Gym Background"
        />
        {/* Gradient Overlay: Creates the "Deep" look and ensures text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-primary-fixed/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* LOGO AREA */}
        <div className="text-center mb-8">
          <Logo
            to="/"
            size="xl"
            className="flex-col items-center justify-center gap-4 mx-auto"
          />
          <div className="h-1 w-12 bg-primary-fixed mx-auto mt-4 rounded-full" />
          <p className="text-gray-400 mt-4 text-xs uppercase tracking-[0.3em] font-bold">
            Access the Command Center
          </p>
        </div>

        {/* GLASSMORPHISM FORM CARD */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-black font-headline text-white uppercase italic">Welcome Back</h2>
            <p className="text-gray-400 mt-2 text-sm">Authenticate your identity to proceed</p>
          </div>

          {sessionMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-primary-fixed/10 border border-primary-fixed/30 rounded-xl text-primary-fixed text-sm text-center"
            >
              {sessionMessage}
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-error/20 border border-error/30 rounded-xl text-error text-sm font-bold uppercase tracking-wider text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="athlete@alien.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-fixed/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-fixed/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-fixed transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-fixed text-black font-headline font-black uppercase tracking-widest rounded-2xl hover:bg-primary-fixed/90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(218,249,0,0.3)]"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              New to the system?{' '}
              <Link to="/register" className="text-primary-fixed hover:underline font-headline font-bold uppercase tracking-tighter">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
