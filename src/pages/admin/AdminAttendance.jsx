import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode, Download, RefreshCw, Users, Calendar, CheckCircle2, Printer,
} from 'lucide-react';
import { adminAttendanceAPI } from '@/services/api';
import Button from '@/components/common/Button';

const AdminAttendance = () => {
  const [qrUrl, setQrUrl] = useState('');
  const [qrLocked, setQrLocked] = useState(true);
  const [loadingQr, setLoadingQr] = useState(true);
  const [daily, setDaily] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayCheckedIn, setTodayCheckedIn] = useState({ count: 0, members: [] });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQr = async () => {
    setLoadingQr(true);
    try {
      const res = await adminAttendanceAPI.getGymQr();
      setQrUrl(res.data.url || res.data.payload || '');
      setQrLocked(res.data.permanent !== false);
    } catch {
      setQrUrl('');
    } finally {
      setLoadingQr(false);
    }
  };

  const fetchStats = async (date = selectedDate) => {
    setLoading(true);
    try {
      const res = await adminAttendanceAPI.getDaily({ date, days: 14 });
      setDaily(res.data.daily || []);
      setSummary(res.data.summary || null);
      setTodayCheckedIn(res.data.today_checked_in || { count: 0, members: [] });
      setSelectedVisits(res.data.selected_visits || []);
    } catch {
      setDaily([]);
      setSelectedVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQr();
    fetchStats(selectedDate);
    const interval = setInterval(() => fetchStats(selectedDate), 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const downloadQr = (hd = true) => {
    const canvas = document.getElementById(hd ? 'gym-checkin-qr-hd' : 'gym-checkin-qr');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'alien-gym-checkin-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const maxDaily = Math.max(...daily.map((d) => d.unique_members), 1);

  return (
    <div className="space-y-8 pb-10 print:space-y-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #gym-qr-print-area, #gym-qr-print-area * { visibility: visible; }
          #gym-qr-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 1.5rem; display: flex; flex-direction: column; align-items: center;
          }
          #gym-qr-print-area canvas { width: 85vmin !important; height: 85vmin !important; }
        }
      `}</style>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 print:hidden">
        <div>
          <p className="text-primary-fixed font-headline font-black uppercase tracking-[0.2em] text-xs mb-2">
            Front Desk
          </p>
          <h1 className="font-headline font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Gym Check-In QR
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            One permanent QR for your gym. It is saved in the database and does not change when you log out.
            Download and print once — members can scan it anytime.
          </p>
          {qrLocked && (
            <p className="text-primary-fixed/80 text-xs font-headline uppercase tracking-wider mt-2">
              Permanent code — always the same
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => fetchStats(selectedDate)} className="flex items-center gap-2 w-fit">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh stats
        </Button>
      </div>

      <div className="grid xl:grid-cols-[minmax(420px,520px)_1fr] gap-8">
        <motion.div
          id="gym-qr-print-area"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#121212] p-8 text-center print:border-black print:bg-white w-full"
        >
          <div className="inline-flex items-center gap-2 text-primary-fixed mb-6 print:text-black">
            <QrCode className="w-6 h-6" />
            <span className="font-headline font-black uppercase text-sm tracking-widest">Entrance QR</span>
          </div>

          {loadingQr ? (
            <div className="h-[420px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
            </div>
          ) : qrUrl ? (
            <>
              <div className="bg-white rounded-3xl p-8 inline-block shadow-[0_0_60px_rgba(218,249,0,0.15)] print:p-4">
                <QRCodeCanvas
                  id="gym-checkin-qr"
                  value={qrUrl}
                  size={400}
                  level="H"
                  includeMargin
                  marginSize={3}
                />
              </div>
              <div className="hidden" aria-hidden="true">
                <QRCodeCanvas
                  id="gym-checkin-qr-hd"
                  value={qrUrl}
                  size={1400}
                  level="H"
                  includeMargin
                  marginSize={4}
                />
              </div>
            </>
          ) : (
            <p className="text-error text-sm">Could not load QR code.</p>
          )}

          <p className="mt-8 font-headline font-black text-white uppercase text-2xl print:text-black">
            Scan to Check In
          </p>
          <p className="text-gray-500 text-sm mt-2 print:text-gray-700 max-w-sm mx-auto">
            Print at least 8×8 inches. This code never expires and works without admin logged in.
          </p>

          <div className="flex flex-col gap-2 mt-6 print:hidden">
            <Button onClick={() => downloadQr(true)} className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download large PNG
            </Button>
            <Button variant="outline" onClick={handlePrint} className="w-full flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" /> Print poster
            </Button>
          </div>
        </motion.div>

        <div className="space-y-6 print:hidden">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Checked In Today', value: summary?.today_unique ?? todayCheckedIn.count, icon: Users },
              { label: 'This Week (unique)', value: summary?.week_unique ?? 0, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <Icon className="w-5 h-5 text-primary-fixed mb-3" />
                <p className="text-3xl font-headline font-black text-white">{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-headline mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-headline font-black uppercase text-sm text-white tracking-wider">Today&apos;s Check-Ins</h2>
              <span className="text-primary-fixed font-headline font-black text-lg">{todayCheckedIn.count}</span>
            </div>
            {todayCheckedIn.members?.length === 0 ? (
              <p className="px-5 py-8 text-gray-600 text-sm text-center">No check-ins yet today.</p>
            ) : (
              <div className="divide-y divide-white/5 max-h-[240px] overflow-y-auto">
                {todayCheckedIn.members.map((m) => (
                  <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                    <p className="text-white font-headline font-bold text-sm">{m.member}</p>
                    <span className="text-gray-500 text-xs">{m.check_in}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="font-headline font-black uppercase text-sm text-white tracking-wider mb-4">
                Daily Headcount (14 days)
              </h2>
              <div className="space-y-3">
                {daily.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="w-24 text-[10px] font-headline uppercase text-gray-500 flex-shrink-0">
                      {day.label}
                    </span>
                    <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-primary-fixed/80 rounded-lg transition-all duration-500"
                        style={{ width: `${(day.unique_members / maxDaily) * 100}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-3 text-[11px] font-headline font-bold text-white">
                        {day.unique_members} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="font-headline font-black uppercase text-sm text-white tracking-wider">Day Detail</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            {selectedVisits.length === 0 ? (
              <p className="px-5 py-8 text-gray-600 text-sm text-center">No check-ins on this date.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-headline border-b border-white/5">
                      <th className="px-5 py-3">Member</th>
                      <th className="px-5 py-3">Check In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td className="px-5 py-3 text-white font-headline font-bold">{visit.member}</td>
                        <td className="px-5 py-3 text-gray-400">{visit.check_in}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
