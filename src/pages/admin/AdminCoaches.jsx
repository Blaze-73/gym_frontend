import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, CheckCircle, XCircle, Search, Edit3, Trash2,
  Utensils, Dumbbell, Clock, Star, UserCheck, Hourglass, RefreshCw, UserMinus,
} from 'lucide-react';
import { adminCoachesAPI, usersAPI } from '@/services/api';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';

const today = () => new Date().toISOString().split('T')[0];

const coachName = (c) => c?.display_name || c?.user?.name || c?.name || `Coach #${c?.id}`;

const emptyCoachForm = () => ({
  user_id: '',
  name: '',
  specialization: '',
  bio: '',
  certifications: '',
  experience_years: 0,
  hourly_rate: '',
  avatar: '',
  expertise_areas: '',
  is_available: true,
});

const AdminCoaches = () => {
  const [tab, setTab] = useState('coaches');
  const [coaches, setCoaches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [coachForm, setCoachForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState({ total_coaches: 0, total_active_clients: 0, total_pending_requests: 0, total_leave_requests: 0 });
  const [clientsModal, setClientsModal] = useState(null);
  const [memberView, setMemberView] = useState(null);
  const [memberData, setMemberData] = useState({ nutrition: null, workouts: [], loading: false });
  const [assignForm, setAssignForm] = useState({ user_id: '', coach_id: '' });
  const [reassignModal, setReassignModal] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, rRes, lRes, uRes] = await Promise.all([
        adminCoachesAPI.getAll(),
        adminCoachesAPI.getRequests(),
        adminCoachesAPI.getLeaveRequests(),
        usersAPI.getAll({ per_page: 100 }),
      ]);
      setCoaches(cRes.data?.coaches || []);
      setSummary(cRes.data?.summary || { total_coaches: 0, total_active_clients: 0, total_pending_requests: 0, total_leave_requests: 0 });
      setRequests(rRes.data?.requests || []);
      setLeaveRequests(lRes.data?.requests || []);
      const users = uRes.data?.data || uRes.data || [];
      setMembers(Array.isArray(users) ? users.filter((u) => u.role === 'client') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openMemberProgress = async (user) => {
    setMemberView(user);
    setMemberData({ nutrition: null, workouts: [], loading: true });
    try {
      const [nRes, wRes] = await Promise.all([
        adminCoachesAPI.getMemberNutrition(user.id, today()),
        adminCoachesAPI.getMemberWorkouts(user.id),
      ]);
      setMemberData({ nutrition: nRes.data, workouts: wRes.data?.workouts || [], loading: false });
    } catch (e) {
      console.error(e);
      setMemberData((d) => ({ ...d, loading: false }));
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminCoachesAPI.approveRequest(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Approve failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminCoachesAPI.rejectRequest(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Reject failed');
    }
  };

  const handleApproveLeave = async (id) => {
    try {
      await adminCoachesAPI.approveLeaveRequest(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Approve failed');
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      await adminCoachesAPI.rejectLeaveRequest(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Reject failed');
    }
  };

  const handleEndClientAssignment = async (assignmentId) => {
    if (!confirm('Remove this client from their coach?')) return;
    try {
      await adminCoachesAPI.endAssignment(assignmentId);
      await load();
      setClientsModal(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not end assignment');
    }
  };

  const handleAssignClient = async (e) => {
    e?.preventDefault();
    setAssignError('');
    if (!assignForm.user_id || !assignForm.coach_id) {
      setAssignError('Select a member and a coach.');
      return;
    }
    setAssigning(true);
    try {
      await adminCoachesAPI.assignClient({
        user_id: Number(assignForm.user_id),
        coach_id: Number(assignForm.coach_id),
      });
      setAssignForm({ user_id: '', coach_id: '' });
      setReassignModal(null);
      await load();
    } catch (e) {
      setAssignError(e.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const openReassign = (client, fromCoach) => {
    setReassignModal({ client, fromCoach });
    setAssignForm({ user_id: String(client.user_id), coach_id: '' });
    setAssignError('');
  };

  const handleSaveCoach = async (e) => {
    e.preventDefault();
    setFormError('');

    const linkedUser = members.find((m) => String(m.id) === String(coachForm.user_id));
    const displayName = (coachForm.name || '').trim() || linkedUser?.name || '';

    if (!displayName) {
      setFormError('Enter a display name, or select a member to link as this coach.');
      return;
    }

    setSaving(true);
    try {
      const { id, active_clients_count, pending_clients_count, display_name, user, ...rest } = coachForm;
      const payload = {
        ...rest,
        name: displayName,
        user_id: coachForm.user_id ? Number(coachForm.user_id) : null,
        experience_years: parseInt(coachForm.experience_years, 10) || 0,
        hourly_rate: coachForm.hourly_rate ? parseFloat(coachForm.hourly_rate) : null,
        expertise_areas: coachForm.expertise_areas
          ? String(coachForm.expertise_areas).split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        is_available: !!coachForm.is_available,
      };
      if (coachForm.id) {
        await adminCoachesAPI.update(coachForm.id, payload);
      } else {
        await adminCoachesAPI.create(payload);
      }
      setCoachForm(null);
      await load();
    } catch (e) {
      const msg = e.response?.data?.message;
      const errors = e.response?.data?.errors;
      setFormError(
        errors ? Object.values(errors).flat().join(' ') : (msg || 'Could not save coach. Check required fields.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUserLinkChange = (userId) => {
    const linked = members.find((m) => String(m.id) === String(userId));
    setCoachForm((f) => ({
      ...f,
      user_id: userId,
      name: linked ? linked.name : f.name,
    }));
  };

  const handleDeleteCoach = async (id) => {
    if (!confirm('Remove this coach profile?')) return;
    try {
      await adminCoachesAPI.delete(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const filteredCoaches = coaches.filter((c) =>
    coachName(c).toLowerCase().includes(search.toLowerCase()) ||
    (c.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic text-white">
            COACH <span className="text-primary-fixed">MANAGEMENT</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Profiles, requests, and member progress</p>
        </div>
        <Button variant="primary" onClick={() => { setFormError(''); setCoachForm(emptyCoachForm()); }} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Coach
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-high border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-headline font-bold uppercase text-gray-500 tracking-wider">Total coaches</p>
          <p className="text-3xl font-black font-headline text-white mt-1">{summary.total_coaches}</p>
        </div>
        <div className="bg-surface-container-high border border-primary-fixed/20 rounded-2xl p-5">
          <p className="text-[10px] font-headline font-bold uppercase text-primary-fixed tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Active client assignments
          </p>
          <p className="text-3xl font-black font-headline text-primary-fixed mt-1">{summary.total_active_clients}</p>
        </div>
        <div className="bg-surface-container-high border border-amber-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-headline font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
            <Hourglass className="w-3.5 h-3.5" /> Pending requests
          </p>
          <p className="text-3xl font-black font-headline text-amber-400 mt-1">{summary.total_pending_requests}</p>
        </div>
        <div className="bg-surface-container-high border border-orange-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-headline font-bold uppercase text-orange-400 tracking-wider flex items-center gap-1">
            <UserMinus className="w-3.5 h-3.5" /> Leave requests
          </p>
          <p className="text-3xl font-black font-headline text-orange-400 mt-1">{summary.total_leave_requests ?? leaveRequests.length}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'coaches', label: 'Coach roster', count: coaches.length },
          { id: 'requests', label: 'Join requests', count: requests.length },
          { id: 'leave', label: 'Leave requests', count: leaveRequests.length },
          { id: 'assign', label: 'Manage assignments', count: 0 },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase border transition-all ${
              tab === t.id ? 'bg-primary-fixed text-black border-primary-fixed' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            {t.label} {t.count > 0 && <span className="ml-1 opacity-80">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-surface-container-high border border-white/5 rounded-2xl p-12 text-center text-gray-500 font-headline uppercase text-sm">
              No pending coach requests
            </div>
          ) : (
            requests.map((req) => (
              <motion.div
                key={req.id}
                className="bg-surface-container-high border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white font-headline font-bold">{req.user?.name}</p>
                  <p className="text-xs text-gray-500">{req.user?.email}</p>
                  <p className="text-sm text-primary-fixed mt-2">
                    Wants: <span className="font-bold">{coachName(req.coach)}</span>
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">Requested {req.created_at ? new Date(req.created_at).toLocaleString() : ''}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => openMemberProgress(req.user)} className="text-xs">
                    <Utensils className="w-3.5 h-3.5 mr-1 inline" /> View progress
                  </Button>
                  <Button variant="primary" onClick={() => handleApprove(req.id)} className="text-xs bg-green-600 hover:bg-green-500">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Approve
                  </Button>
                  <Button onClick={() => handleReject(req.id)} className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                    <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Reject
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {tab === 'leave' && (
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <div className="bg-surface-container-high border border-white/5 rounded-2xl p-12 text-center text-gray-500 font-headline uppercase text-sm">
              No pending leave requests
            </div>
          ) : (
            leaveRequests.map((req) => (
              <motion.div
                key={req.id}
                className="bg-surface-container-high border border-orange-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white font-headline font-bold">{req.user?.name}</p>
                  <p className="text-xs text-gray-500">{req.user?.email}</p>
                  <p className="text-sm text-orange-400 mt-2">
                    Wants to leave: <span className="font-bold">{coachName(req.coach)}</span>
                  </p>
                  {req.started_at && (
                    <p className="text-[10px] text-gray-600 mt-1">Member since {req.started_at}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => handleApproveLeave(req.id)} className="text-xs bg-green-600 hover:bg-green-500">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Approve leave
                  </Button>
                  <Button onClick={() => handleRejectLeave(req.id)} className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                    <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Keep assigned
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {tab === 'assign' && (
        <div className="max-w-xl bg-surface-container-high border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-black font-headline uppercase text-white mb-1">Assign member to coach</h2>
          <p className="text-xs text-gray-500 mb-6">
            Instantly assign or move a client to a coach. Any current coach assignment is ended automatically.
          </p>
          <form onSubmit={handleAssignClient} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">Member</label>
              <Select
                className="mt-1"
                value={assignForm.user_id}
                onChange={(user_id) => setAssignForm((f) => ({ ...f, user_id }))}
                placeholder="Select member…"
                options={[
                  { value: '', label: 'Select member…' },
                  ...members.map((m) => ({ value: m.id, label: `${m.name} (${m.email})` })),
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">Coach</label>
              <Select
                className="mt-1"
                value={assignForm.coach_id}
                onChange={(coach_id) => setAssignForm((f) => ({ ...f, coach_id }))}
                placeholder="Select coach…"
                options={[
                  { value: '', label: 'Select coach…' },
                  ...coaches.map((c) => ({ value: c.id, label: coachName(c) })),
                ]}
              />
            </div>
            {assignError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{assignError}</p>
            )}
            <Button type="submit" variant="primary" loading={assigning} className="w-full">
              Assign to coach
            </Button>
          </form>
        </div>
      )}

      {tab === 'coaches' && (
        <>
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coaches..."
              className="w-full bg-surface-container-high border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-fixed/50"
            />
          </div>

          <div className="bg-surface-container-high border border-white/5 rounded-2xl overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-black font-headline uppercase text-white">Active clients per coach</h2>
              <p className="text-xs text-gray-500 mt-1">Live count from approved assignments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-headline font-bold uppercase text-gray-500 border-b border-white/5">
                    <th className="p-4">Coach</th>
                    <th className="p-4">Specialization</th>
                    <th className="p-4 text-center">Active clients</th>
                    <th className="p-4 text-center">Pending</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-headline uppercase text-xs">No coaches found</td>
                    </tr>
                  ) : (
                    filteredCoaches.map((c) => (
                      <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="p-4">
                          <p className="font-headline font-bold text-white">{coachName(c)}</p>
                          <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-primary-fixed" /> {c.rating}
                          </p>
                        </td>
                        <td className="p-4 text-gray-400">{c.specialization || '—'}</td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setClientsModal(c)}
                            className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-xl bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed font-black font-headline text-lg hover:bg-primary-fixed/25 transition-colors"
                            title="View active clients"
                          >
                            {c.active_clients_count ?? 0}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${(c.pending_clients_count ?? 0) > 0 ? 'bg-amber-500/15 text-amber-400' : 'text-gray-600'}`}>
                            {c.pending_clients_count ?? 0}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={(c.active_clients_count ?? 0) === 0}
                              onClick={() => setClientsModal(c)}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40"
                            >
                              View clients
                            </button>
                            <button type="button" onClick={() => setCoachForm({ ...c, expertise_areas: (c.expertise_areas || []).join(', '), user_id: c.user_id || '' })} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCoaches.map((c) => (
              <div key={`card-${c.id}`} className="bg-surface-container-high border border-white/5 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-headline font-black uppercase text-white">{coachName(c)}</h3>
                    <p className="text-xs text-primary-fixed mt-1">{c.specialization || 'General'}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Active</p>
                    <p className="text-2xl font-black font-headline text-primary-fixed">{c.active_clients_count ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{c.pending_clients_count ?? 0} pending</span>
                  <span className={c.is_available ? 'text-green-400' : 'text-gray-500'}>{c.is_available ? 'Available' : 'Away'}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setClientsModal(c)} className="flex-1 py-2 text-xs font-bold uppercase bg-primary-fixed/10 text-primary-fixed rounded-lg hover:bg-primary-fixed/20">
                    Clients ({c.active_clients_count ?? 0})
                  </button>
                  <button type="button" onClick={() => setCoachForm({ ...c, expertise_areas: (c.expertise_areas || []).join(', '), user_id: c.user_id || '' })} className="py-2 px-3 text-xs bg-white/5 rounded-lg hover:bg-white/10">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={!!clientsModal}
        onClose={() => setClientsModal(null)}
        title={clientsModal ? `Active clients — ${coachName(clientsModal)}` : ''}
        size="md"
      >
        {clientsModal && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              <span className="text-primary-fixed font-black text-2xl font-headline">{clientsModal.active_clients_count ?? 0}</span>
              {' '}active member{clientsModal.active_clients_count === 1 ? '' : 's'} assigned to this coach
            </p>
            {(clientsModal.active_clients?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">No active clients yet. Approve a coach request to assign members.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {clientsModal.active_clients.map((client) => (
                  <li key={client.assignment_id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="min-w-0">
                      <p className="font-headline font-bold text-white truncate">{client.name}</p>
                      <p className="text-xs text-gray-500 truncate">{client.email}</p>
                      {client.started_at && (
                        <p className="text-[10px] text-gray-600 mt-1">Since {client.started_at}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setClientsModal(null);
                          openMemberProgress({ id: client.user_id, name: client.name });
                        }}
                        className="text-[10px] font-bold uppercase text-primary-fixed hover:underline text-right"
                      >
                        Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => openReassign(client, clientsModal)}
                        className="text-[10px] font-bold uppercase text-amber-400 hover:underline text-right inline-flex items-center justify-end gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Change coach
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEndClientAssignment(client.assignment_id)}
                        className="text-[10px] font-bold uppercase text-red-400 hover:underline text-right inline-flex items-center justify-end gap-1"
                      >
                        <UserMinus className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!reassignModal}
        onClose={() => { setReassignModal(null); setAssignError(''); }}
        title={reassignModal ? `Change coach — ${reassignModal.client?.name}` : ''}
        size="md"
      >
        {reassignModal && (
          <form onSubmit={handleAssignClient} className="space-y-4 py-2">
            <p className="text-sm text-gray-400">
              Currently with <strong className="text-white">{coachName(reassignModal.fromCoach)}</strong>.
              Pick a new coach to assign immediately.
            </p>
            <Select
              value={assignForm.coach_id}
              onChange={(coach_id) => setAssignForm((f) => ({ ...f, coach_id }))}
              placeholder="Select new coach…"
              options={[
                { value: '', label: 'Select new coach…' },
                ...coaches
                  .filter((c) => c.id !== reassignModal.fromCoach?.id)
                  .map((c) => ({ value: c.id, label: coachName(c) })),
              ]}
            />
            {assignError && (
              <p className="text-sm text-red-400">{assignError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setReassignModal(null)}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={assigning}>Assign</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!coachForm} onClose={() => { setCoachForm(null); setFormError(''); }} title={coachForm?.id ? 'Edit Coach' : 'Add Coach'} size="lg">
        {coachForm && (
          <form onSubmit={handleSaveCoach} className="space-y-4">
            {formError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{formError}</p>
            )}
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">Link to member account (optional)</label>
              <Select
                className="mt-1"
                value={coachForm.user_id}
                onChange={handleUserLinkChange}
                placeholder="— No linked account —"
                options={[
                  { value: '', label: '— No linked account —' },
                  ...members.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.email})`,
                  })),
                ]}
              />
              <p className="text-[10px] text-gray-600 mt-1">Linking lets them use My Clients in the member app.</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">
                Coach name <span className="text-primary-fixed">*</span>
              </label>
              <input
                required
                value={coachForm.name}
                onChange={(e) => setCoachForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Marcus Thorne"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600"
              />
            </div>
            {['specialization', 'bio', 'certifications', 'avatar'].map((key) => (
              <div key={key}>
                <label className="text-xs font-bold uppercase text-gray-500">{key}</label>
                <input value={coachForm[key] || ''} onChange={(e) => setCoachForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500">Experience (years)</label>
                <input type="number" value={coachForm.experience_years} onChange={(e) => setCoachForm((f) => ({ ...f, experience_years: e.target.value }))} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-500">Hourly rate</label>
                <input type="number" step="0.01" value={coachForm.hourly_rate} onChange={(e) => setCoachForm((f) => ({ ...f, hourly_rate: e.target.value }))} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500">Expertise (comma-separated)</label>
              <input value={coachForm.expertise_areas} onChange={(e) => setCoachForm((f) => ({ ...f, expertise_areas: e.target.value }))} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" placeholder="Strength, Nutrition, HIIT" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={!!coachForm.is_available} onChange={(e) => setCoachForm((f) => ({ ...f, is_available: e.target.checked }))} />
              Available for new clients
            </label>
            <div className="sticky bottom-0 pt-2 pb-1 bg-surface-container-high border-t border-white/5 -mx-6 px-6 mt-4">
              <Button type="submit" variant="primary" loading={saving} className="w-full">Save Coach</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!memberView} onClose={() => setMemberView(null)} title={`Member progress — ${memberView?.name}`} size="lg">
        {memberData.loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin h-10 w-10 border-t-2 border-primary-fixed rounded-full" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-sm font-black font-headline uppercase text-primary-fixed mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Today&apos;s nutrition
              </h3>
              {memberData.nutrition?.meals?.length ? (
                <div className="space-y-2">
                  <p className="text-lg font-black">{memberData.nutrition.calories} kcal total</p>
                  {memberData.nutrition.meals.map((m) => (
                    <div key={m.id} className="bg-white/5 rounded-lg p-3 text-sm">
                      <span className="text-primary-fixed text-[10px] uppercase font-bold">{m.meal_type}</span>
                      <p className="text-white font-bold">{m.name}</p>
                      <p className="text-gray-500 text-xs">{m.calories} cal</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No meals logged today.</p>
              )}
            </section>
            <section>
              <h3 className="text-sm font-black font-headline uppercase text-primary-fixed mb-3 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Recent workouts
              </h3>
              {memberData.workouts.length ? (
                <div className="space-y-2">
                  {memberData.workouts.slice(0, 8).map((w) => (
                    <div key={w.id} className="bg-white/5 rounded-lg p-3 text-sm flex justify-between">
                      <span className="text-white font-bold">{w.workout?.name || 'Workout'}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {w.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No workout sessions yet.</p>
              )}
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCoaches;
