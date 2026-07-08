import { Clock, Users, MapPin, User, Star } from 'lucide-react';
import { formatScheduleTimeRange, resolveMediaUrl } from '@/utils/helpers';

const ScheduleClassCard = ({ item, onEdit, onDelete, showActions = false, compact = false }) => {
  const isMine = Boolean(item.is_my_assignment);

  return (
    <div
      className={`w-full rounded-xl group transition-all relative
        ${compact ? 'p-3' : 'p-4'}
        ${item.status === 'inactive' ? 'opacity-60' : ''}
        ${isMine
          ? 'bg-red-500/10 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : 'bg-surface-container-high border border-white/5 hover:border-primary-fixed/50'
        }`}
    >
      <div
        className={`absolute top-0 right-0 w-1 h-full transition-opacity pointer-events-none rounded-r-xl ${
          isMine
            ? 'bg-red-500 opacity-100'
            : 'bg-primary-fixed opacity-0 group-hover:opacity-100'
        }`}
      />
      {isMine && (
        <span className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
          <Star className="w-3 h-3 fill-red-400 text-red-400" /> Your class
        </span>
      )}
      <h4
        className={`font-black uppercase mb-2 line-clamp-2 break-words ${
          compact ? 'text-[11px] leading-tight' : 'text-sm'
        } ${isMine ? 'text-red-100' : 'text-white'}`}
      >
        {item.class_name}
      </h4>
      <div className={`space-y-1.5 ${compact ? 'text-[9px]' : 'text-[10px]'} text-gray-400 uppercase font-bold`}>
        <div className="flex items-start gap-2">
          <Clock className={`w-3 h-3 shrink-0 mt-0.5 ${isMine ? 'text-red-400' : ''}`} />
          <span className={`leading-snug normal-case ${isMine ? 'text-red-200/90' : ''}`}>
            {formatScheduleTimeRange(item.start_time, item.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3 shrink-0" /> {item.capacity} max
        </div>
        <div className={`flex items-center gap-2 ${isMine ? 'text-red-300' : 'text-primary-fixed'}`}>
          <MapPin className="w-3 h-3 shrink-0" /> {item.room || 'Main Gym'}
        </div>
        {item.coach_name && !isMine && (
          <div className="flex items-center gap-2 text-gray-300 normal-case">
            {item.coach_avatar ? (
              <img
                src={resolveMediaUrl(item.coach_avatar)}
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <User className="w-3 h-3 shrink-0" />
            )}
            <span className="truncate">{item.coach_name}</span>
          </div>
        )}
      </div>
      {item.status === 'inactive' && (
        <span className="mt-2 inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-error/10 text-error">
          Inactive
        </span>
      )}
      {showActions && (
        <div className="flex gap-1 mt-3 justify-end">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-white/10 text-white hover:bg-primary-fixed/20 hover:text-primary-fixed"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-error/10 text-error hover:bg-error hover:text-white"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleClassCard;
