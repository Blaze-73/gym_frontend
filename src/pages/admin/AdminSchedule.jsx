import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Plus, LayoutGrid, List, MapPin } from 'lucide-react';
import { schedulesAPI, coachesAPI } from '@/services/api';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import ScheduleWeekGrid from '@/components/schedule/ScheduleWeekGrid';
import ScheduleClassCard from '@/components/schedule/ScheduleClassCard';
import WeekPicker from '@/components/schedule/WeekPicker';
import { formatScheduleTime, getWeekStart, formatWeekRange } from '@/utils/helpers';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const initialFormState = {
  class_name: '',
  day_of_week: 'Monday',
  start_time: '09:00',
  end_time: '10:00',
  capacity: 20,
  room: '',
  coach_id: '',
  status: 'active',
  week_start: getWeekStart(),
};

const AdminSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState('week');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart());

  useEffect(() => { fetchData(); }, [selectedWeek]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, coachRes] = await Promise.all([
        schedulesAPI.getAllAdmin(selectedWeek),
        coachesAPI.getAll(),
      ]);
      setSchedules(Array.isArray(schedRes.data) ? schedRes.data : schedRes.data?.data || []);
      const coachList = coachRes.data?.coaches || coachRes.data;
      setCoaches(Array.isArray(coachList) ? coachList : []);
    } catch (e) {
      console.error('API Error:', e);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const coachLabel = (c) => c.display_name || c.name || c.user?.name || `Coach #${c.id}`;

  const coachOptions = [
    { value: '', label: 'No coach assigned' },
    ...coaches.map((c) => ({ value: String(c.id), label: coachLabel(c) })),
  ];

  const statusCounts = {
    all: schedules.length,
    active: schedules.filter((s) => s.status === 'active').length,
    inactive: schedules.filter((s) => s.status !== 'active').length,
  };

  const filteredSchedules = schedules.filter((s) => {
    if (statusFilter === 'active') return s.status === 'active';
    if (statusFilter === 'inactive') return s.status !== 'active';
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...initialFormState, week_start: selectedWeek });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      class_name: item.class_name || '',
      day_of_week: item.day_of_week || 'Monday',
      start_time: formatScheduleTime(item.start_time) || '09:00',
      end_time: formatScheduleTime(item.end_time) || '10:00',
      capacity: item.capacity ?? 20,
      room: item.room || '',
      coach_id: item.coach_id ? String(item.coach_id) : '',
      status: item.status || 'active',
      week_start: item.week_start || selectedWeek,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...initialFormState, week_start: selectedWeek });
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.start_time >= formData.end_time) {
      setFormError('End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        coach_id: formData.coach_id ? parseInt(formData.coach_id, 10) : null,
      };

      if (editingId) {
        await schedulesAPI.update(editingId, payload);
      } else {
        await schedulesAPI.create(payload);
      }

      closeModal();
      fetchData();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const first = errors && Object.values(errors).flat()[0];
      setFormError(first || err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      await schedulesAPI.delete(id);
      fetchData();
    } catch {
      alert('Delete failed');
    }
  };

  const totalClasses = filteredSchedules.length;
  const totalCapacity = filteredSchedules.reduce((acc, curr) => acc + parseInt(curr.capacity || 0, 10), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-headline text-white uppercase italic tracking-tighter">
            SCHEDULE <span className="text-primary-fixed">ARCHITECTURE</span>
          </h1>
          <p className="text-gray-400 mt-1 uppercase text-xs tracking-widest font-bold">
            {formatWeekRange(selectedWeek)} · {statusCounts.active} active · {statusCounts.inactive} inactive
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-surface-container-high p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setView('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${view === 'week' ? 'bg-primary-fixed text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Week
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${view === 'list' ? 'bg-primary-fixed text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary-fixed text-black rounded-xl text-sm font-headline font-black uppercase hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> New Class
          </button>
        </div>
      </div>

      <WeekPicker weekStart={selectedWeek} onChange={setSelectedWeek} />

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider border transition-colors
              ${statusFilter === key
                ? key === 'inactive'
                  ? 'bg-error/15 border-error/40 text-error'
                  : 'bg-primary-fixed/15 border-primary-fixed/40 text-primary-fixed'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
          >
            {label} ({statusCounts[key]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-high border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary-fixed/10 rounded-lg text-primary-fixed"><Calendar className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Showing</p>
            <p className="text-2xl font-black text-white">{totalClasses}</p>
          </div>
        </div>
        <div className="bg-surface-container-high border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Capacity</p>
            <p className="text-2xl font-black text-white">{totalCapacity} <span className="text-sm text-gray-500 font-normal">slots</span></p>
          </div>
        </div>
        <div className="bg-surface-container-high border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><MapPin className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rooms</p>
            <p className="text-2xl font-black text-white">{[...new Set(filteredSchedules.map((s) => s.room).filter(Boolean))].length}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {filteredSchedules.length === 0 ? (
          <div className="py-20 text-center bg-surface-container-high rounded-2xl border border-dashed border-white/10">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 font-headline uppercase text-sm">
              {statusFilter === 'inactive'
                ? 'No inactive classes this week'
                : statusFilter === 'active'
                  ? 'No active classes this week'
                  : 'No classes for this week — add one with New Class'}
            </p>
          </div>
        ) : view === 'week' ? (
          <ScheduleWeekGrid
            schedules={filteredSchedules}
            showActions
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <ScheduleClassCard item={item} showActions onEdit={openEdit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Class' : 'Schedule New Class'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{formError}</p>
          )}

          <div>
            <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Week</label>
            <WeekPicker
              weekStart={formData.week_start || selectedWeek}
              onChange={(week_start) => setFormData((f) => ({ ...f, week_start }))}
              className="!p-3"
            />
            <p className="text-[10px] text-gray-600 mt-2">
              Class will appear on {formatWeekRange(formData.week_start || selectedWeek)}
            </p>
          </div>

          <div>
            <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Class Name</label>
            <input
              type="text"
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed"
              placeholder="e.g. Power Lifting"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Day</label>
              <Select
                value={formData.day_of_week}
                onChange={(day_of_week) => setFormData({ ...formData, day_of_week })}
                options={DAYS.map((d) => ({ value: d, label: d }))}
              />
            </div>
            <div>
              <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Capacity</label>
              <input
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Start</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed"
                required
              />
            </div>
            <div>
              <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">End</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Room / Zone</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed"
              placeholder="e.g. Studio A"
            />
          </div>

          <div>
            <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Coach</label>
            <Select
              value={formData.coach_id}
              onChange={(coach_id) => setFormData({ ...formData, coach_id })}
              placeholder="Assign coach"
              options={coachOptions}
            />
          </div>

          <div>
            <label className="text-xs font-headline text-gray-500 uppercase mb-2 block">Status</label>
            <div className="flex gap-4">
              {['active', 'inactive'].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedule_status"
                    value={s}
                    checked={formData.status === s}
                    onChange={() => setFormData({ ...formData, status: s })}
                    className="accent-primary-fixed"
                  />
                  <span className="text-sm font-headline font-bold uppercase text-gray-300">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-primary-fixed text-black font-headline font-black uppercase rounded-xl"
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Class'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSchedule;
