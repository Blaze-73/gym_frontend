import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Plus, Trash2, LayoutGrid, List, MapPin } from 'lucide-react';
import { schedulesAPI, coachesAPI } from '@/services/api';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const AdminSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('week'); // 'week' or 'list'
  
  const initialFormState = {
    class_name: '', 
    day_of_week: 'Monday', 
    start_time: '09:00', 
    end_time: '10:00', 
    capacity: 20, 
    room: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await schedulesAPI.getAll();
      setSchedules(res.data.data || res.data);
    } catch (e) {
      console.error("API Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await schedulesAPI.create({
        ...formData,
        capacity: parseInt(formData.capacity)
      });
      setIsModalOpen(false);
      setFormData(initialFormState);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this class?")) {
      try {
        await schedulesAPI.delete(id);
        fetchData();
      } catch (e) {
        alert("Delete failed");
      }
    }
  };

  // Calculate operational stats
  const totalClasses = schedules.length;
  const totalCapacity = schedules.reduce((acc, curr) => acc + parseInt(curr.capacity || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
    </div>
  );

  return (
    <div className="space-y-8 p-2 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-white uppercase italic tracking-tighter">
            SCHEDULE <span className="text-primary-fixed">ARCHITECTURE</span>
          </h1>
          <p className="text-gray-400 mt-1 uppercase text-xs tracking-widest font-bold">
            System-wide class distribution & capacity management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-high p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setView('week')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${view === 'week' ? 'bg-primary-fixed text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Week
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${view === 'list' ? 'bg-primary-fixed text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-primary-fixed text-black rounded-xl text-sm font-headline font-black uppercase hover:scale-105 transition-transform shadow-lg shadow-primary-fixed/20"
          >
            <Plus className="w-4 h-4" /> New Class
          </button>
        </div>
      </div>

      {/* KPI BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-high border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary-fixed/10 rounded-lg text-primary-fixed"><Calendar className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Classes</p>
            <p className="text-2xl font-black text-white">{totalClasses}</p>
          </div>
        </div>
        <div className="bg-surface-container-high border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Max Capacity</p>
            <p className="text-2xl font-black text-white">{totalCapacity} <span className="text-sm text-gray-500 font-normal">slots</span></p>
          </div>
        </div>
        <div className="bg-surface-container-high border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><MapPin className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Active Zones</p>
            <p className="text-2xl font-black text-white">{[...new Set(schedules.map(s => s.room))].length}</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="min-h-[600px]">
        {view === 'week' ? (
          /* WEEKLY MASTER GRID */
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <div key={day} className="space-y-4">
                <div className="text-center py-3 bg-surface-container-high border border-white/5 rounded-t-xl">
                  <p className="text-xs font-black text-primary-fixed uppercase tracking-widest">{day}</p>
                </div>
                <div className="space-y-3">
                  {schedules.filter(s => s.day_of_week === day).map(item => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-surface-container-high border border-white/5 p-4 rounded-xl group hover:border-primary-fixed/50 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-1 h-full bg-primary-fixed opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h4 className="text-sm font-black text-white uppercase mb-3 line-clamp-1">{item.class_name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold">
                          <Clock className="w-3 h-3" /> {item.start_time} - {item.end_time}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold">
                          <Users className="w-3 h-3" /> {item.capacity} Max
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-primary-fixed uppercase font-bold">
                          <MapPin className="w-3 h-3" /> {item.room || 'Main Gym'}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="absolute bottom-2 right-2 p-1.5 bg-error/10 text-error rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                  {schedules.filter(s => s.day_of_week === day).length === 0 && (
                    <div className="p-4 text-center border border-white/5 border-dashed rounded-xl">
                      <p className="text-[10px] text-gray-600 uppercase font-bold">No Classes</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-surface-container-high rounded-2xl border border-dashed border-white/10">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-headline uppercase">No classes scheduled yet</p>
              </div>
            ) : (
              schedules.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-high border border-white/5 rounded-2xl p-6 group hover:border-primary-fixed/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary-fixed/10 rounded-lg text-primary-fixed">
                      <Clock className="w-5 h-5" />
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-error/10 text-error rounded-lg hover:bg-error hover:text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-black font-headline text-white uppercase mb-1">{item.class_name}</h3>
                  <p className="text-primary-fixed text-sm font-bold mb-4">{item.day_of_week}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-headline text-gray-400 uppercase">
                    <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {item.start_time} - {item.end_time}</div>
                    <div className="flex items-center gap-2"><Users className="w-3 h-3" /> {item.capacity} Slots</div>
                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {item.room || 'Main Gym'}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Class" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-headline text-gray-500 uppercase mb-2">Class Name</label>
            <input type="text" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed" placeholder="e.g. Power Lifting" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-headline text-gray-500 uppercase mb-2">Day</label>
              <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed">
                {daysOfWeek.map(d => (
                  <option key={d} value={d} className="bg-neutral-900 text-white">{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-headline text-gray-500 uppercase mb-2">Capacity</label>
              <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex- la-col">
              <label className="text-xs font-headline text-gray-500 uppercase mb-2">Start Time</label>
              <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed" required />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-headline text-gray-500 uppercase mb-2">End Time</label>
              <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed" required />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-headline text-gray-500 uppercase mb-2">Room / Zone</label>
            <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-fixed" placeholder="e.g. Studio A, Heavy Zone" />
          </div>
          <Button type="submit" className="w-full py-4 bg-primary-fixed text-black hover:bg-primary-fixed/90 font-headline font-black uppercase rounded-xl transition-all">Create Class</Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSchedule;
