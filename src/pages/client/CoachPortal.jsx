import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Utensils, Dumbbell, ChevronRight, Clock, Calendar,
  MessageSquare, ClipboardList, Send, FileText,
} from 'lucide-react';
import { coachesAPI, schedulesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ScheduleClassCard from '@/components/schedule/ScheduleClassCard';
import { getWeekStart } from '@/utils/helpers';

const today = () => new Date().toISOString().split('T')[0];

const emptyProgram = () => ({
  title: '',
  body: '',
  workout_plan: '',
  nutrition_plan: '',
  notes: '',
});

const CoachPortal = () => {
  const { isCoach } = useAuth();
  const [clients, setClients] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState({ nutrition: null, workouts: [], deliverables: [], loading: false });
  const [panelTab, setPanelTab] = useState('overview');
  const [messageBody, setMessageBody] = useState('');
  const [programForm, setProgramForm] = useState(emptyProgram);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const staff = await coachesAPI.isStaff();
        if (!staff.data?.is_coach) {
          setDenied(true);
          return;
        }
        const [clientsRes, classesRes] = await Promise.all([
          coachesAPI.getClients(),
          schedulesAPI.getMyClasses(getWeekStart()),
        ]);
        setClients(clientsRes.data?.clients || []);
        setMyClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      } catch (e) {
        console.error(e);
        setDenied(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadClientDetail = async (client) => {
    setDetail({ nutrition: null, workouts: [], deliverables: [], loading: true });
    try {
      const [nRes, wRes, dRes] = await Promise.all([
        coachesAPI.getClientNutrition(client.user_id, today()),
        coachesAPI.getClientWorkouts(client.user_id),
        coachesAPI.getClientDeliverables(client.user_id),
      ]);
      setDetail({
        nutrition: nRes.data,
        workouts: wRes.data?.workouts || [],
        deliverables: (dRes.data?.deliverables || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ),
        loading: false,
      });
    } catch (e) {
      console.error(e);
      setDetail((d) => ({ ...d, loading: false }));
    }
  };

  const openClient = (client) => {
    setSelected(client);
    setPanelTab('overview');
    setMessageBody('');
    setProgramForm(emptyProgram());
    setFeedback('');
    loadClientDetail(client);
  };

  const refreshDeliverables = async () => {
    if (!selected) return;
    const dRes = await coachesAPI.getClientDeliverables(selected.user_id);
    setDetail((d) => ({
      ...d,
      deliverables: (dRes.data?.deliverables || []).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      ),
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selected || !messageBody.trim()) return;
    setSending(true);
    setFeedback('');
    try {
      await coachesAPI.sendDeliverable(selected.user_id, {
        type: 'message',
        body: messageBody.trim(),
      });
      setMessageBody('');
      setFeedback('Message sent.');
      await refreshDeliverables();
      setPanelTab('history');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleSendProgram = async (e) => {
    e.preventDefault();
    if (!selected || !programForm.title.trim() || !programForm.body.trim()) return;
    setSending(true);
    setFeedback('');
    try {
      await coachesAPI.sendDeliverable(selected.user_id, {
        type: 'program',
        title: programForm.title.trim(),
        body: programForm.body.trim(),
        program_details: {
          workout_plan: programForm.workout_plan.trim() || null,
          nutrition_plan: programForm.nutrition_plan.trim() || null,
          notes: programForm.notes.trim() || null,
        },
      });
      setProgramForm(emptyProgram());
      setFeedback('Program sent.');
      await refreshDeliverables();
      setPanelTab('history');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to send program.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <p className="text-gray-500 font-headline uppercase text-sm text-center">
          Coach portal is only for staff with a linked coach profile.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'program', label: 'Send Program', icon: ClipboardList },
    { id: 'history', label: 'History', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic mb-2">
            COACH <span className="text-primary-fixed">HUB</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Manage clients, send programs, and communicate with your athletes.
          </p>
        </div>
        {isCoach() && (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-fixed/10 border border-primary-fixed/30 text-primary-fixed text-xs font-black uppercase">
            Coach Pass · Full Access
          </span>
        )}
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-black uppercase text-primary-fixed mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> My classes this week
        </h2>
        <p className="text-[10px] text-red-400/80 uppercase font-bold tracking-wider mb-4">
          Your assigned classes are highlighted in red
        </p>
        {myClasses.length === 0 ? (
          <p className="text-gray-500 text-sm font-headline uppercase">No classes assigned to you yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myClasses.map((item) => (
              <ScheduleClassCard key={item.id} item={item} compact />
            ))}
          </div>
        )}
      </section>

      <h2 className="text-sm font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" /> Active clients ({clients.length})
      </h2>

      {clients.length === 0 ? (
        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-headline uppercase text-sm">No active clients yet</p>
          <p className="text-gray-600 text-xs mt-2">Clients are assigned after admin approves coach requests.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <motion.button
              key={c.user_id}
              type="button"
              onClick={() => openClient(c)}
              className="bg-surface-container-high border border-white/5 rounded-2xl p-5 text-left hover:border-primary-fixed/30 transition-colors"
            >
              <p className="font-headline font-black uppercase text-lg">{c.name}</p>
              <p className="text-xs text-gray-500 truncate">{c.email}</p>
              <p className="text-[10px] text-gray-600 mt-2">Since {c.started_at || '—'}</p>
              <ChevronRight className="w-5 h-5 text-primary-fixed mt-4" />
            </motion.button>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {detail.loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin h-10 w-10 border-t-2 border-primary-fixed rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPanelTab(id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-colors ${
                    panelTab === id
                      ? 'bg-primary-fixed text-black border-primary-fixed'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {feedback && (
              <p className="text-sm text-primary-fixed font-bold">{feedback}</p>
            )}

            {panelTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-sm font-black uppercase text-primary-fixed mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4" /> Nutrition today
                  </h3>
                  {detail.nutrition?.meals?.length ? (
                    <>
                      <p className="text-xl font-black mb-3">{detail.nutrition.calories} kcal</p>
                      {detail.nutrition.meals.map((m) => (
                        <div key={m.id} className="bg-white/5 rounded-lg p-3 mb-2 text-sm">
                          <span className="text-[10px] uppercase text-primary-fixed font-bold">{m.meal_type}</span>
                          <p className="font-bold">{m.name}</p>
                          <p className="text-gray-500">{m.calories} cal</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No meals logged today.</p>
                  )}
                </section>
                <section>
                  <h3 className="text-sm font-black uppercase text-primary-fixed mb-3 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" /> Workouts
                  </h3>
                  {detail.workouts.length ? detail.workouts.slice(0, 10).map((w) => (
                    <div key={w.id} className="bg-white/5 rounded-lg p-3 mb-2 flex justify-between text-sm">
                      <span className="font-bold">{w.workout?.name || 'Session'}</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{w.status}
                      </span>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">No sessions yet.</p>
                  )}
                </section>
              </div>
            )}

            {panelTab === 'message' && (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <p className="text-sm text-gray-400">Send a direct message to {selected?.name}.</p>
                <textarea
                  rows={5}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none"
                  required
                />
                <Button type="submit" disabled={sending} className="inline-flex items-center gap-2">
                  <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}

            {panelTab === 'program' && (
              <form onSubmit={handleSendProgram} className="space-y-4">
                <p className="text-sm text-gray-400">Build and send a training program for {selected?.name}.</p>
                <input
                  type="text"
                  value={programForm.title}
                  onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                  placeholder="Program title *"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none"
                  required
                />
                <textarea
                  rows={3}
                  value={programForm.body}
                  onChange={(e) => setProgramForm({ ...programForm, body: e.target.value })}
                  placeholder="Program overview *"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none"
                  required
                />
                <textarea
                  rows={3}
                  value={programForm.workout_plan}
                  onChange={(e) => setProgramForm({ ...programForm, workout_plan: e.target.value })}
                  placeholder="Workout plan (exercises, sets, reps...)"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none"
                />
                <textarea
                  rows={3}
                  value={programForm.nutrition_plan}
                  onChange={(e) => setProgramForm({ ...programForm, nutrition_plan: e.target.value })}
                  placeholder="Nutrition plan (meals, macros...)"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none"
                />
                <textarea
                  rows={2}
                  value={programForm.notes}
                  onChange={(e) => setProgramForm({ ...programForm, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-primary-fixed outline-none"
                />
                <Button type="submit" disabled={sending} className="inline-flex items-center gap-2">
                  <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Program'}
                </Button>
              </form>
            )}

            {panelTab === 'history' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detail.deliverables.length === 0 ? (
                  <p className="text-gray-500 text-sm">No messages or programs yet.</p>
                ) : (
                  detail.deliverables.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={async () => {
                        if (item.from_client && !item.is_read) {
                          try {
                            await coachesAPI.markDeliverableRead(item.id);
                            setDetail((d) => ({
                              ...d,
                              deliverables: d.deliverables.map((x) =>
                                x.id === item.id ? { ...x, is_read: true } : x
                              ),
                            }));
                          } catch (e) {
                            console.error(e);
                          }
                        }
                      }}
                      className={`w-full text-left rounded-xl p-4 border transition-colors ${
                        item.from_client
                          ? 'bg-primary-fixed/5 border-primary-fixed/20'
                          : 'bg-white/5 border-white/10'
                      } ${item.from_client && !item.is_read ? 'ring-1 ring-primary-fixed/40' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          item.from_client
                            ? 'bg-white/10 text-white'
                            : item.type === 'program'
                              ? 'bg-primary-fixed/20 text-primary-fixed'
                              : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.from_client ? 'Client' : item.type}
                        </span>
                        {item.from_client && !item.is_read && (
                          <span className="text-[10px] font-black uppercase text-primary-fixed">New</span>
                        )}
                        {item.title && <span className="font-bold text-sm">{item.title}</span>}
                        <span className="text-[10px] text-gray-600 ml-auto">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.body}</p>
                      {item.program_details?.workout_plan && (
                        <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                          <strong className="text-gray-400">Workout:</strong> {item.program_details.workout_plan}
                        </p>
                      )}
                      {item.program_details?.nutrition_plan && (
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                          <strong className="text-gray-400">Nutrition:</strong> {item.program_details.nutrition_plan}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoachPortal;
