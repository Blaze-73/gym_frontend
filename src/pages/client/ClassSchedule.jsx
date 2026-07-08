import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, LayoutGrid, List } from 'lucide-react';
import { schedulesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import PlanUpgradeGate from '@/components/plan/PlanUpgradeGate';
import ScheduleWeekGrid from '@/components/schedule/ScheduleWeekGrid';
import ScheduleClassCard from '@/components/schedule/ScheduleClassCard';
import WeekPicker from '@/components/schedule/WeekPicker';
import { formatScheduleTime, getWeekStart, isCurrentWeek } from '@/utils/helpers';

const ClassSchedule = () => {
  const { isCoach } = useAuth();
  const { loading: entLoading, canSchedule } = usePlanEntitlements();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart());

  useEffect(() => {
    if (entLoading || !canSchedule) return;

    (async () => {
      setLoading(true);
      try {
        const res = await schedulesAPI.getAll(selectedWeek);
        setSchedules(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedWeek, entLoading, canSchedule]);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const showToday = isCurrentWeek(selectedWeek);
  const todayClasses = showToday
    ? schedules
        .filter((s) => s.day_of_week === todayName)
        .sort((a, b) => formatScheduleTime(a.start_time).localeCompare(formatScheduleTime(b.start_time)))
    : [];

  if (entLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  if (!canSchedule) {
    return <PlanUpgradeGate entitlementKey="schedule_access" />;
  }

  if (loading && schedules.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <div className="space-y-8 min-w-0 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black font-headline text-white uppercase italic">
            CLASS <span className="text-primary-fixed">SCHEDULE</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Pick a week to view group classes</p>
          {isCoach?.() && (
            <p className="text-[10px] text-red-400/90 uppercase font-bold tracking-wider mt-2">
              Your assigned classes appear highlighted in red
            </p>
          )}
        </div>
        <div className="flex bg-surface-container-high p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setView('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase ${view === 'week' ? 'bg-primary-fixed text-black' : 'text-gray-400'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Week
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase ${view === 'list' ? 'bg-primary-fixed text-black' : 'text-gray-400'}`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      <WeekPicker weekStart={selectedWeek} onChange={setSelectedWeek} />

      {showToday && todayClasses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-fixed/10 border border-primary-fixed/30 rounded-2xl p-5"
        >
          <p className="text-xs font-headline font-bold uppercase tracking-widest text-primary-fixed mb-3">
            Today — {todayName}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayClasses.map((item) => (
              <ScheduleClassCard key={item.id} item={item} compact />
            ))}
          </div>
        </motion.div>
      )}

      {schedules.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-high rounded-2xl border border-white/5">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 font-headline uppercase text-sm">No classes scheduled for this week</p>
        </div>
      ) : view === 'week' ? (
        <div className="min-w-0">
          <ScheduleWeekGrid schedules={schedules} highlightToday={showToday} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((item) => (
            <ScheduleClassCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassSchedule;
