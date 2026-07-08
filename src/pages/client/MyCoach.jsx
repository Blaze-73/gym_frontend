import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, ClipboardList, Mail, CheckCircle, ArrowLeft, UserMinus, Send,
} from 'lucide-react';
import { coachesAPI } from '@/services/api';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import PlanUpgradeGate from '@/components/plan/PlanUpgradeGate';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

const coachName = (assignment) =>
  assignment?.coach?.display_name
  || assignment?.coach?.user?.name
  || assignment?.coach?.name
  || 'Your coach';

const MyCoach = () => {
  const { loading: entLoading, canCoaches } = usePlanEntitlements();
  const [inbox, setInbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  const [cancellingLeave, setCancellingLeave] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await coachesAPI.getInbox();
      setInbox(res.data);
    } catch (e) {
      console.error(e);
      setInbox(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLeaveCoach = async () => {
    setEnding(true);
    try {
      await coachesAPI.endAssignment();
      setShowLeaveConfirm(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setEnding(false);
    }
  };

  const handleCancelLeaveRequest = async () => {
    setCancellingLeave(true);
    try {
      await coachesAPI.cancelLeaveRequest();
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setCancellingLeave(false);
    }
  };

  const handleOpen = async (item) => {
    setExpandedId(expandedId === item.id ? null : item.id);
    if (!item.is_read && !item.from_client) {
      try {
        await coachesAPI.markDeliverableRead(item.id);
        setInbox((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            unread_count: Math.max(0, (prev.unread_count || 0) - 1),
            deliverables: prev.deliverables.map((d) =>
              d.id === item.id ? { ...d, is_read: true, read_at: new Date().toISOString() } : d
            ),
          };
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) return;
    setSending(true);
    setSendError('');
    try {
      await coachesAPI.sendMessageToCoach({ body: messageBody.trim() });
      setMessageBody('');
      await load();
    } catch (err) {
      setSendError(err.response?.data?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

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

  const assignment = inbox?.assignment;
  const deliverables = (inbox?.deliverables || [])
    .filter((d) => (filter === 'all' ? true : d.type === filter))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (!assignment || !['active', 'leave_pending'].includes(assignment.status)) {
    return (
      <div className="min-h-screen bg-black text-white p-6 lg:p-8">
        <Link to="/coaches" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-fixed text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to coaches
        </Link>
        <div className="max-w-lg mx-auto text-center py-16">
          <Mail className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h1 className="text-2xl font-black font-headline uppercase mb-2">No Active Coach</h1>
          <p className="text-gray-500 text-sm mb-6">
            Request a coach first to receive programs and messages here.
          </p>
          <Link to="/coaches">
            <Button>Browse Coaches</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <Link to="/coaches" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-fixed text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to coaches
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic mb-2">
            MY <span className="text-primary-fixed">COACH</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Programs and messages with {coachName(assignment)}
          </p>
        </div>
        {(inbox?.unread_count || 0) > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed text-xs font-black uppercase">
            {inbox.unread_count} unread
          </span>
        )}
        {assignment.status === 'leave_pending' && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase">
            Leave pending admin approval
          </span>
        )}
        {assignment.status === 'active' && (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-xs font-headline font-bold uppercase text-gray-400 hover:text-red-400 hover:border-red-500/30"
          >
            <UserMinus className="w-4 h-4" /> Request to leave
          </button>
        )}
        {assignment.status === 'leave_pending' && (
          <button
            type="button"
            onClick={handleCancelLeaveRequest}
            disabled={cancellingLeave}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-xs font-headline font-bold uppercase text-gray-400 hover:text-primary-fixed"
          >
            {cancellingLeave ? 'Cancelling…' : 'Cancel leave request'}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'program', label: 'Programs' },
          { id: 'message', label: 'Messages' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-colors ${
              filter === id
                ? 'bg-primary-fixed text-black border-primary-fixed'
                : 'border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {deliverables.length === 0 ? (
        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-12 text-center mb-6">
          <ClipboardList className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-headline uppercase text-sm">Nothing yet</p>
          <p className="text-gray-600 text-xs mt-2">Send a message below or wait for programs from your coach.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mb-6">
          {deliverables.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={`border rounded-2xl overflow-hidden transition-colors ${
                item.from_client
                  ? 'border-white/10 bg-white/[0.03] ml-4 md:ml-12'
                  : item.is_read
                    ? 'border-white/5 bg-surface-container-high mr-4 md:mr-12'
                    : 'border-primary-fixed/30 bg-primary-fixed/5 mr-4 md:mr-12'
              }`}
            >
              <button
                type="button"
                onClick={() => handleOpen(item)}
                className="w-full text-left p-5 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'program'
                    ? 'bg-primary-fixed/20'
                    : item.from_client
                      ? 'bg-white/10'
                      : 'bg-blue-500/20'
                }`}>
                  {item.type === 'program'
                    ? <ClipboardList className="w-5 h-5 text-primary-fixed" />
                    : <MessageSquare className={`w-5 h-5 ${item.from_client ? 'text-gray-300' : 'text-blue-300'}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-gray-500">
                      {item.from_client ? 'You' : coachName(assignment)} · {item.type}
                    </span>
                    {!item.is_read && !item.from_client && (
                      <span className="text-[10px] font-black uppercase text-primary-fixed">New</span>
                    )}
                    {item.is_read && !item.from_client && <CheckCircle className="w-3 h-3 text-gray-600" />}
                  </div>
                  {item.title && (
                    <p className="font-headline font-black uppercase text-white">{item.title}</p>
                  )}
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">{item.body}</p>
                  <p className="text-[10px] text-gray-600 mt-2">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </p>
                </div>
              </button>

              {expandedId === item.id && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.body}</p>
                  {item.program_details?.workout_plan && (
                    <div className="bg-black/40 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase text-primary-fixed mb-2">Workout Plan</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.program_details.workout_plan}</p>
                    </div>
                  )}
                  {item.program_details?.nutrition_plan && (
                    <div className="bg-black/40 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase text-primary-fixed mb-2">Nutrition Plan</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.program_details.nutrition_plan}</p>
                    </div>
                  )}
                  {item.program_details?.notes && (
                    <div className="bg-black/40 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Notes</p>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap">{item.program_details.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-3xl bg-surface-container-high border border-white/10 rounded-2xl p-4">
        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">
          Message {coachName(assignment)}
        </label>
        <textarea
          rows={3}
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Ask a question, share an update..."
          className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none resize-none"
        />
        {sendError && <p className="text-xs text-red-400 mt-2">{sendError}</p>}
        <div className="flex justify-end mt-3">
          <Button type="submit" disabled={sending || !messageBody.trim()} className="inline-flex items-center gap-2">
            <Send className="w-4 h-4" />
            {sending ? 'Sending…' : 'Send message'}
          </Button>
        </div>
      </form>

      <Modal isOpen={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)} title="Request to leave coach?" size="sm">
        <div className="space-y-6 py-2">
          <p className="text-gray-400 text-sm">
            Submit a request to leave {coachName(assignment)}. An admin must approve before your assignment ends.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowLeaveConfirm(false)}>Stay</Button>
            <Button variant="danger" className="flex-1" loading={ending} onClick={handleLeaveCoach}>
              Submit request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyCoach;
