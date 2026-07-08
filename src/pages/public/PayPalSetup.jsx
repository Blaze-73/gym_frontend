import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';
import Button from '@/components/common/Button';

const PayPalSetup = () => {
  const [clientId, setClientId] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await api.get('/payments/setup-status');
        if (res.data?.verified) {
          setSuccess(true);
        }
      } catch {
        // ignore — setup form still available
      } finally {
        setChecking(false);
      }
    };
    checkExisting();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/payments/configure', {
        client_id: clientId.trim(),
        secret: secret.trim(),
      });
      setSuccess(true);
      setError('');
    } catch (err) {
      setSuccess(false);
      const msg = err.response?.data?.message;
      const status = err.response?.status;
      if (!err.response) {
        setError('Cannot reach Laravel API. Start the backend: php artisan serve (port 8000)');
      } else if (status === 422 && msg) {
        setError(msg);
      } else if (status === 403) {
        setError('Setup only works when APP_ENV=local in .env');
      } else {
        setError(msg || `Setup failed (HTTP ${status || 'error'}). Check Sandbox Client ID and Secret.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-fixed animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-zinc-900/80 border border-white/10 rounded-3xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary-fixed" />
          <h1 className="text-2xl font-black font-headline uppercase">PayPal Sandbox Setup</h1>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <CheckCircle className="w-14 h-14 text-primary-fixed mx-auto" />
            <p className="text-gray-300">
              PayPal Sandbox is connected. If checkout still fails, restart Laravel:
            </p>
            <code className="block text-xs text-primary-fixed bg-black/50 p-3 rounded-lg">php artisan serve</code>
            <Link to="/plans">
              <Button variant="primary" className="w-full">Go to Plans & Test PayPal</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Paste <strong>Sandbox</strong> credentials only (not Live). Copy from the{' '}
              <strong>Sandbox</strong> tab — not Live.
            </p>

            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-fixed text-sm font-bold mb-6 hover:underline"
            >
              Open PayPal Developer (Sandbox apps) <ExternalLink className="w-4 h-4" />
            </a>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Sandbox Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none font-mono"
                  placeholder="Starts with A or sb-"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Sandbox Secret</label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none font-mono"
                  placeholder="Click Show in PayPal dashboard"
                />
              </div>

              {error && (
                <div className="text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3 whitespace-pre-wrap">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" disabled={loading} className="w-full py-4">
                {loading ? 'Saving & verifying…' : 'Save & Connect PayPal'}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PayPalSetup;
