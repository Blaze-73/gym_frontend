import { Check, Crown } from 'lucide-react';

const PlanBenefits = ({ features = [], title = 'Included in your plan', compact = false, className = '' }) => {
  if (!features.length) return null;

  return (
    <div className={`bg-black/40 border border-white/10 rounded-2xl p-5 ${className}`}>
      {title ? (
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-primary-fixed" />
          <h3 className="text-sm font-headline font-black uppercase tracking-wider text-white">{title}</h3>
        </div>
      ) : null}
      <ul className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-300">
            <Check className="w-4 h-4 text-primary-fixed shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanBenefits;
