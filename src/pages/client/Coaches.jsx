import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, Clock, Search, Award,
  ChevronRight, UserCheck, Hourglass, XCircle, Mail, RefreshCw, UserMinus,
} from 'lucide-react';
import { coachesAPI } from '@/services/api';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import PlanUpgradeGate from '@/components/plan/PlanUpgradeGate';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import CoachReviewsPanel from '@/components/coaches/CoachReviewsPanel';

const coachName = (c) => c?.display_name || c?.user?.name || c?.name || 'Coach';

const statusConfig = {
  active: { label: 'Active coach', color: 'text-green-400 bg-green-500/10 border-green-500/30', icon: UserCheck },
  pending: { label: 'Request pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Hourglass },
  leave_pending: { label: 'Leave pending approval', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', icon: Hourglass },
};

const Coaches = () => {
  const location = useLocation();
  const { loading: entLoading, canCoaches } = usePlanEntitlements();
  const [coaches, setCoaches] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [ending, setEnding] = useState(false);
  const [cancellingLeave, setCancellingLeave] = useState(false);
  const [changing, setChanging] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [modalRating, setModalRating] = useState({ avg: null, count: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, mineRes] = await Promise.all([
        coachesAPI.getAll(),
        coachesAPI.getMyCoach(),
      ]);
      const data = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);
      setCoaches(data);
      setAssignment(mineRes.data?.assignment || null);
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (location.state?.message) {
      setFeedback({ type: 'success', message: location.state.message });
    }
  }, [location.state?.message]);

  const handleAssignCoach = async () => {
    if (!selectedCoach) return;
    setIsRequesting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await coachesAPI.assign({ coach_id: selectedCoach.id });
      setFeedback({ type: 'success', message: res.data?.message || 'Request submitted.' });
      setSelectedCoach(null);
      await load();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Could not submit request. Try again later.',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    setCancelling(true);
    try {
      await coachesAPI.cancelRequest();
      setFeedback({ type: 'success', message: 'Request cancelled.' });
      await load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Cancel failed.' });
    } finally {
      setCancelling(false);
    }
  };

  const handleEndAssignment = async () => {
    setEnding(true);
    try {
      const res = await coachesAPI.endAssignment();
      setFeedback({ type: 'success', message: res.data?.message || 'Leave request submitted.' });
      setShowLeaveConfirm(false);
      await load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Could not submit leave request.' });
    } finally {
      setEnding(false);
    }
  };

  const handleCancelLeaveRequest = async () => {
    setCancellingLeave(true);
    try {
      const res = await coachesAPI.cancelLeaveRequest();
      setFeedback({ type: 'success', message: res.data?.message || 'Leave request cancelled.' });
      await load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Could not cancel leave request.' });
    } finally {
      setCancellingLeave(false);
    }
  };

  const handleChangeCoach = async () => {
    if (!selectedCoach) return;
    setChanging(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await coachesAPI.changeCoach({ coach_id: selectedCoach.id });
      setFeedback({ type: 'success', message: res.data?.message || 'Change request submitted.' });
      setSelectedCoach(null);
      await load();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Could not submit change request.',
      });
    } finally {
      setChanging(false);
    }
  };

  const isCurrentCoach = (coachId) =>
    ['active', 'leave_pending'].includes(assignment?.status)
    && Number(assignment?.coach?.id) === Number(coachId);

  const filteredCoaches = coaches.filter((coach) =>
    coachName(coach).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (coach.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasAssignment = assignment && ['active', 'pending', 'leave_pending'].includes(assignment.status);
  const StatusIcon = assignment ? statusConfig[assignment.status]?.icon : null;

  if (entLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  if (!canCoaches) {
    return <PlanUpgradeGate entitlementKey="coaches_access" />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="relative h-[320px] overflow-hidden flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-fixed/20 via-black to-black z-0" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black font-headline text-white uppercase italic mb-4">
            PERFORMANCE <span className="text-primary-fixed">COACHES</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">Browse coaches, request a match, and track your assignment.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {feedback.message && (
          <div className={`mb-6 px-4 py-3 rounded-xl border text-sm ${feedback.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-green-500/10 border-green-500/30 text-green-300'}`}>
            {feedback.message}
          </div>
        )}

        {hasAssignment && assignment.coach && (
          <section className="mb-10 bg-gradient-to-r from-primary-fixed/10 to-surface-container-high border border-primary-fixed/25 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {assignment.coach.avatar ? (
                  <img src={assignment.coach.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center"><Users className="w-8 h-8 text-gray-700" /></div>
                )}
                <div>
                  <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-gray-500 mb-1">My coach</p>
                  <h2 className="text-2xl font-black font-headline uppercase italic">{coachName(assignment.coach)}</h2>
                  <p className="text-primary-fixed text-sm font-bold">{assignment.coach.specialization}</p>
                  {assignment.status === 'active' && assignment.started_at && (
                    <p className="text-xs text-gray-500 mt-1">Member since {assignment.started_at}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3">
                {StatusIcon && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-headline font-bold uppercase ${statusConfig[assignment.status].color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[assignment.status].label}
                  </span>
                )}
                {assignment.status === 'pending' && (
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={cancelling}
                    className="text-xs font-headline font-bold uppercase text-gray-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> {cancelling ? 'Cancelling…' : 'Cancel request'}
                  </button>
                )}
                {assignment.status === 'active' && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Link
                      to="/my-coach"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-fixed text-black rounded-xl text-xs font-headline font-black uppercase"
                    >
                      <Mail className="w-4 h-4" /> Programs & Messages
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowLeaveConfirm(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl text-xs font-headline font-bold uppercase text-gray-300 hover:text-red-400 hover:border-red-500/30"
                    >
                      <UserMinus className="w-4 h-4" /> Request to leave
                    </button>
                  </div>
                )}
                {assignment.status === 'leave_pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Link
                      to="/my-coach"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-fixed text-black rounded-xl text-xs font-headline font-black uppercase"
                    >
                      <Mail className="w-4 h-4" /> Programs & Messages
                    </Link>
                    <button
                      type="button"
                      onClick={handleCancelLeaveRequest}
                      disabled={cancellingLeave}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl text-xs font-headline font-bold uppercase text-gray-400 hover:text-primary-fixed"
                    >
                      <XCircle className="w-4 h-4" /> {cancellingLeave ? 'Cancelling…' : 'Cancel leave request'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {assignment?.status === 'active' && (
          <p className="mb-6 text-sm text-gray-500 text-center md:text-left">
            Want a different coach? Browse below and select <span className="text-primary-fixed font-bold">Switch to this coach</span> on their profile.
          </p>
        )}
        {assignment?.status === 'leave_pending' && (
          <p className="mb-6 text-sm text-orange-400/90 text-center md:text-left">
            Your request to leave {coachName(assignment.coach)} is waiting for admin approval.
          </p>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm uppercase font-headline tracking-wider focus:outline-none focus:border-primary-fixed/50 text-white placeholder:text-gray-600"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{filteredCoaches.length} available</span>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCoaches.length > 0 ? (
            filteredCoaches.map((coach, index) => (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                className="group bg-surface-container-high border border-white/5 rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedCoach(coach)}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {coach.avatar ? (
                    <img src={coach.avatar} alt={coachName(coach)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><Users className="w-20 h-20 text-gray-800" /></div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-primary-fixed/20 border border-primary-fixed/50 text-primary-fixed">
                      {coach.is_available ? 'Available' : 'Away'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 fill-primary-fixed text-primary-fixed" />
                      <span className="text-sm font-bold">{Number(coach.rating || 5).toFixed(1)}</span>
                      {(coach.review_count ?? 0) > 0 && (
                        <span className="text-[10px] text-gray-600">({coach.review_count})</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black font-headline uppercase italic">{coachName(coach)}</h3>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between border-t border-white/5">
                  <p className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest">{coach.specialization || 'Coach'}</p>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-fixed" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-surface-container-high rounded-3xl border border-dashed border-white/10 text-gray-500 font-headline uppercase text-sm">
              No coaches match your search
            </div>
          )}
        </section>
      </main>

      <Modal isOpen={!!selectedCoach} onClose={() => { setSelectedCoach(null); setFeedback({ type: '', message: '' }); setModalRating({ avg: null, count: 0 }); }} title="Coach profile" size="xl">
        {selectedCoach && (
          <>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
              {selectedCoach.avatar ? (
                <img src={selectedCoach.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><Users className="w-24 h-24 text-gray-800" /></div>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black font-headline uppercase italic">{coachName(selectedCoach)}</h2>
              <p className="text-primary-fixed font-bold uppercase tracking-widest text-sm mt-1">{selectedCoach.specialization}</p>
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Clock className="w-5 h-5 text-primary-fixed mb-2" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Experience</p>
                  <p className="text-lg font-black">{selectedCoach.experience_years || 0} yrs</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Award className="w-5 h-5 text-primary-fixed mb-2" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Rating</p>
                  <p className="text-lg font-black">
                    {modalRating.avg != null ? Number(modalRating.avg).toFixed(1) : Number(selectedCoach.rating || 5).toFixed(1)}
                    {(modalRating.count || selectedCoach.review_count) > 0 && (
                      <span className="text-xs text-gray-500 font-normal ml-1">
                        ({modalRating.count || selectedCoach.review_count})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10 flex-1">
                {selectedCoach.bio || 'Performance specialist focused on your goals.'}
              </p>
              {selectedCoach.certifications && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCoach.certifications.split(',').map((cert, i) => (
                    <span key={i} className="px-2 py-1 bg-primary-fixed/10 text-primary-fixed text-[10px] font-bold uppercase rounded-lg">{cert.trim()}</span>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                {assignment?.status === 'active' && isCurrentCoach(selectedCoach.id) ? (
                  <p className="text-sm text-gray-400 text-center py-3">This is your current coach.</p>
                ) : assignment?.status === 'active' ? (
                  <Button onClick={handleChangeCoach} loading={changing} variant="primary" className="w-full py-4 inline-flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {changing ? 'Submitting…' : 'Switch to this coach'}
                  </Button>
                ) : assignment?.status === 'leave_pending' ? (
                  <p className="text-sm text-orange-400/90 text-center py-3">Cancel your leave request before switching coach.</p>
                ) : hasAssignment && assignment.status === 'pending' ? (
                  <p className="text-sm text-amber-400/90 text-center py-3">You have a pending request. Cancel it to request another coach.</p>
                ) : (
                  <Button onClick={handleAssignCoach} loading={isRequesting} variant="primary" className="w-full py-4">
                    {isRequesting ? 'Submitting…' : 'Request this coach'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <CoachReviewsPanel
            coachId={selectedCoach.id}
            onRatingChange={(avg, count) => {
              setModalRating({ avg, count });
              setSelectedCoach((c) => (c ? { ...c, rating: avg, review_count: count } : c));
              setCoaches((list) => list.map((co) => (co.id === selectedCoach.id ? { ...co, rating: avg, review_count: count } : co)));
            }}
          />
          </>
        )}
      </Modal>

      <Modal isOpen={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)} title="Request to leave coach?" size="sm">
        <div className="space-y-6 py-2">
          <p className="text-gray-400 text-sm">
            Submit a request to leave <strong className="text-white">{coachName(assignment?.coach)}</strong>.
            An admin must approve before your assignment ends. Until then, you remain with this coach.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowLeaveConfirm(false)}>Stay</Button>
            <Button variant="danger" className="flex-1" loading={ending} onClick={handleEndAssignment}>
              Submit request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Coaches;
