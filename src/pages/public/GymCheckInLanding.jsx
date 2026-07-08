import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceAPI } from '@/services/api';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

/**
 * Landing page when a member scans the printed gym QR with their phone camera.
 * URL: /gym-checkin?t={token}
 */
const GymCheckInLanding = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('t') || '';

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [checkedInAt, setCheckedInAt] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setStatus('error');
      setMessage('Invalid check-in link.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { returnTo: `/gym-checkin?t=${token}` },
      });
      return;
    }

    const run = async () => {
      setStatus('loading');
      try {
        const res = await attendanceAPI.scanGym(token);
        setStatus('success');
        setMessage(res.data.message || 'Checked in for today!');
        setCheckedInAt(res.data.checked_in_at || '');
      } catch (err) {
        if (err.response?.data?.action === 'already_checked_in') {
          setStatus('already');
          setMessage(err.response?.data?.message || 'You already checked in today.');
          setCheckedInAt(err.response?.data?.checked_in_at || '');
        } else {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Check-in failed.');
        }
      }
    };

    run();
  }, [authLoading, isAuthenticated, token, navigate]);

  if (authLoading || status === 'loading' || (!isAuthenticated && token)) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#121212] p-8 text-center">
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-primary-fixed mx-auto mb-4" />
            <h1 className="font-headline font-black text-2xl text-white uppercase mb-2">Checked In</h1>
            <p className="text-gray-400">{message}</p>
            {checkedInAt && <p className="text-primary-fixed text-sm mt-2">Time: {checkedInAt}</p>}
          </>
        )}

        {status === 'already' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="font-headline font-black text-2xl text-white uppercase mb-2">Already Checked In</h1>
            <p className="text-gray-400">{message}</p>
            {checkedInAt && <p className="text-gray-500 text-sm mt-2">Today at {checkedInAt}</p>}
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h1 className="font-headline font-black text-2xl text-white uppercase mb-2">Check-In Failed</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link to="/attendance-pass">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" /> Open Check-In Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GymCheckInLanding;
