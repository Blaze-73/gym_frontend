import { motion } from 'framer-motion';
import ScheduleClassCard from './ScheduleClassCard';

const DAYS = [
  { key: 'Monday', short: 'Mon' },
  { key: 'Tuesday', short: 'Tue' },
  { key: 'Wednesday', short: 'Wed' },
  { key: 'Thursday', short: 'Thu' },
  { key: 'Friday', short: 'Fri' },
  { key: 'Saturday', short: 'Sat' },
  { key: 'Sunday', short: 'Sun' },
];

const ScheduleWeekGrid = ({ schedules, onEdit, onDelete, showActions = false, highlightToday = false }) => {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="relative -mx-1 sm:mx-0">
      <div
        className="overflow-x-auto overflow-y-visible pb-3 scroll-smooth
                   [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5
                   [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20"
      >
        <div className="flex gap-3 min-w-full w-max px-1 sm:px-0">
          {DAYS.map(({ key: day, short }) => {
            const dayClasses = schedules.filter((s) => s.day_of_week === day);
            const isToday = highlightToday && day === todayName;

            return (
              <div
                key={day}
                className="flex w-[10.75rem] sm:w-[11.5rem] shrink-0 flex-col"
              >
                <div
                  className={`text-center py-3 px-2 rounded-xl border mb-3 ${
                    isToday
                      ? 'bg-primary-fixed/15 border-primary-fixed/40'
                      : 'bg-surface-container-high border-white/5'
                  }`}
                >
                  <p
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-wide leading-tight ${
                      isToday ? 'text-primary-fixed' : 'text-primary-fixed/90'
                    }`}
                    title={day}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{short}</span>
                  </p>
                  {isToday && (
                    <span className="block text-[9px] mt-1 text-primary-fixed/70 font-bold uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3 flex-1 min-h-[5rem]">
                  {dayClasses.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      <ScheduleClassCard
                        item={item}
                        compact
                        showActions={showActions}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </motion.div>
                  ))}
                  {dayClasses.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-4 text-center border border-dashed border-white/10 rounded-xl min-h-[5.5rem]">
                      <p className="text-[10px] text-gray-500 uppercase font-bold leading-snug">
                        No classes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-2 sm:hidden text-center">
        Swipe to see all days
      </p>
    </div>
  );
};

export default ScheduleWeekGrid;
