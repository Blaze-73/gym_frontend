import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  getWeekStart,
  shiftWeekStart,
  formatWeekRange,
  dateToWeekInputValue,
  weekInputValueToWeekStart,
  isCurrentWeek,
} from '@/utils/helpers';

/**
 * Navigate and pick the Monday–Sunday week for schedule views.
 */
const WeekPicker = ({ weekStart, onChange, className = '' }) => {
  const goPrev = () => onChange(shiftWeekStart(weekStart, -1));
  const goNext = () => onChange(shiftWeekStart(weekStart, 1));
  const goToday = () => onChange(getWeekStart());

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 bg-surface-container-high border border-white/5 rounded-xl p-3 sm:p-4 ${className}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          onClick={goPrev}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors shrink-0"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-gray-500 mb-0.5">
            Schedule week
          </p>
          <p className="text-sm sm:text-base font-black font-headline text-white truncate">
            {formatWeekRange(weekStart)}
          </p>
          {isCurrentWeek(weekStart) && (
            <span className="text-[10px] font-bold uppercase text-primary-fixed">This week</span>
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors shrink-0"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:border-l sm:border-white/10 sm:pl-4">
        <label className="sr-only">Pick week</label>
        <div className="relative flex-1 sm:flex-initial">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="week"
            value={dateToWeekInputValue(weekStart)}
            onChange={(e) => {
              const next = weekInputValueToWeekStart(e.target.value);
              if (next) onChange(next);
            }}
            className="w-full sm:w-[11rem] bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white
                       focus:outline-none focus:border-primary-fixed/50 [color-scheme:dark]"
          />
        </div>
        {!isCurrentWeek(weekStart) && (
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-2 text-[10px] font-headline font-bold uppercase tracking-wider rounded-lg
                       bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 hover:bg-primary-fixed/25 whitespace-nowrap"
          >
            Today
          </button>
        )}
      </div>
    </div>
  );
};

export default WeekPicker;
