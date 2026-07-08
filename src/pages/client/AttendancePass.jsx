import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ScanLine, Calendar, Clock, ShieldCheck, CheckCircle2, AlertCircle, Camera, RefreshCw,
} from 'lucide-react';
import { attendanceAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { startGymQrScanner, stopGymQrScanner } from '@/utils/gymQrScanner';
import Button from '@/components/common/Button';

const AttendancePass = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkedInAt, setCheckedInAt] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [activeCamera, setActiveCamera] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [scanMessage, setScanMessage] = useState({ type: '', text: '' });
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef(null);
  const lastScanRef = useRef({ token: '', at: 0 });
  const handleScanRef = useRef(null);
  const processingRef = useRef(false);
  const checkedInRef = useRef(false);

  const loadData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        attendanceAPI.getToday(),
        attendanceAPI.history(),
      ]);
      const done = Boolean(todayRes.data.checked_in_today);
      setCheckedInToday(done);
      checkedInRef.current = done;
      setCheckedInAt(todayRes.data.attendance?.check_in
        ? new Date(todayRes.data.attendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '');
      setStats(historyRes.data.stats);
      const rows = historyRes.data.attendances?.data || historyRes.data.attendances || [];
      setHistory(Array.isArray(rows) ? rows.slice(0, 10) : []);
    } catch {
      setScanMessage({ type: 'error', text: 'Could not load attendance data.' });
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const stopScanner = useCallback(async () => {
    await stopGymQrScanner(scannerRef.current);
    scannerRef.current = null;
    setScanning(false);
  }, []);

  const handleScan = useCallback(async (decodedText) => {
    const now = Date.now();
    if (
      processingRef.current ||
      checkedInRef.current ||
      (lastScanRef.current.token === decodedText && now - lastScanRef.current.at < 3000)
    ) {
      return;
    }

    lastScanRef.current = { token: decodedText, at: now };
    processingRef.current = true;
    setProcessing(true);
    setScanMessage({ type: '', text: '' });

    try {
      const res = await attendanceAPI.scanGym(decodedText);
      checkedInRef.current = true;
      setCheckedInToday(true);
      setCheckedInAt(res.data.checked_in_at || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setScanMessage({ type: 'success', text: res.data.message || 'Checked in for today!' });
      await loadData();
      await stopScanner();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed.';
      if (err.response?.data?.action === 'already_checked_in') {
        checkedInRef.current = true;
        setCheckedInToday(true);
        setCheckedInAt(err.response?.data?.checked_in_at || '');
      }
      setScanMessage({ type: 'error', text: msg });
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }, [stopScanner]);

  handleScanRef.current = handleScan;

  const startScanner = useCallback(async () => {
    if (checkedInRef.current) return;
    setCameraError('');
    if (scannerRef.current?.isScanning) return;

    try {
      await stopGymQrScanner(scannerRef.current);
      scannerRef.current = null;

      const el = document.getElementById('client-gym-scanner');
      if (el) el.innerHTML = '';

      const { scanner, cameraLabel } = await startGymQrScanner('client-gym-scanner', (text) => {
        handleScanRef.current?.(text);
      });
      scannerRef.current = scanner;
      setActiveCamera(cameraLabel);
      setScanning(true);
    } catch (err) {
      const msg = err?.message || '';
      setActiveCamera('');
      if (/NotFoundError|not found|DevicesNotFound|no camera/i.test(msg)) {
        setCameraError(
          'No camera detected. Open DroidCam on your phone, connect USB/Wi‑Fi, then tap Restart camera.'
        );
      } else if (/Permission|NotAllowed|denied/i.test(msg)) {
        setCameraError(
          'Camera blocked. Click the camera icon in the browser address bar, allow access, then tap Restart camera.'
        );
      } else {
        setCameraError(
          `Could not open camera: ${msg}. Ensure DroidCam is running, then tap Restart camera.`
        );
      }
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !checkedInToday) {
      const t = setTimeout(() => startScanner(), 400);
      return () => {
        clearTimeout(t);
        stopScanner();
      };
    }
    return () => { stopScanner(); };
  }, [loading, checkedInToday, startScanner, stopScanner]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-primary-fixed font-headline font-black uppercase tracking-[0.2em] text-xs mb-2">
          Gym Access
        </p>
        <h1 className="font-headline font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Daily Check-In
        </h1>
        <p className="text-gray-500 mt-2">
          Point your camera at the large QR poster at the gym. One check-in per day.
        </p>
      </motion.div>

      {checkedInToday ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-primary-fixed/30 bg-primary-fixed/10 p-8 text-center"
        >
          <CheckCircle2 className="w-14 h-14 text-primary-fixed mx-auto mb-4" />
          <h2 className="font-headline font-black text-2xl text-white uppercase">You&apos;re checked in today</h2>
          {checkedInAt && <p className="text-gray-400 mt-2">Checked in at {checkedInAt}</p>}
          <p className="text-gray-500 text-sm mt-4">Come back tomorrow to check in again.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#121212] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-fixed" />
              <h2 className="font-headline font-black uppercase text-sm text-white tracking-wider">
                Scan Gym QR
              </h2>
            </div>
            {scanning && (
              <span className="text-[10px] font-black uppercase text-primary-fixed animate-pulse">
                Scanning…
              </span>
            )}
          </div>

          <div className="p-3 sm:p-5">
            <div
              id="client-gym-scanner"
              className="rounded-2xl overflow-hidden bg-black w-full min-h-[min(70vh,520px)] max-h-[520px]"
            />
            {scanning && activeCamera && (
              <p className="text-center text-primary-fixed text-[10px] font-headline uppercase tracking-wider mt-2">
                Using: {activeCamera}
              </p>
            )}
            <p className="text-center text-gray-600 text-xs font-headline uppercase tracking-wider mt-3">
              Center the QR in the frame · DroidCam is selected automatically when connected
            </p>

            {cameraError && (
              <div className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-error text-sm flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {scanMessage.text && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                scanMessage.type === 'success'
                  ? 'border border-primary-fixed/30 bg-primary-fixed/10 text-primary-fixed'
                  : 'border border-error/30 bg-error/10 text-error'
              }`}>
                {scanMessage.text}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={startScanner}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={scanning && !cameraError}
              >
                <RefreshCw className="w-4 h-4" />
                {scanning ? 'Camera active' : 'Restart camera'}
              </Button>
              {scanning && (
                <Button variant="outline" onClick={stopScanner}>
                  Stop
                </Button>
              )}
            </div>

            {processing && (
              <p className="text-center text-primary-fixed text-xs font-headline uppercase mt-3 animate-pulse">
                Checking you in…
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Visits', value: stats?.total_visits ?? 0, icon: Calendar },
          { label: 'This Month', value: stats?.this_month_visits ?? 0, icon: Clock },
          { label: 'Member', value: user?.name?.split(' ')[0] || '—', icon: ShieldCheck },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <Icon className="w-4 h-4 text-primary-fixed mb-2" />
            <p className="text-2xl font-headline font-black text-white truncate">{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-headline">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-headline font-black uppercase text-sm text-white tracking-wider">Visit History</h2>
        </div>
        {history.length === 0 ? (
          <p className="px-5 py-8 text-gray-600 text-sm text-center">No visits yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((visit) => (
              <div key={visit.id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-white text-sm font-headline font-bold">
                  {visit.check_in ? new Date(visit.check_in).toLocaleDateString() : '—'}
                </p>
                <span className="text-gray-500 text-xs">
                  {visit.check_in
                    ? new Date(visit.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePass;
