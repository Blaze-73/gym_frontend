import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';
import { UPGRADE_COPY } from '@/config/planUi';
import Button from '@/components/common/Button';

const PlanUpgradeGate = ({
  entitlementKey = 'nutrition_access',
  title,
  description,
  requiredPlan,
  currentPlanName,
}) => {
  const copy = UPGRADE_COPY[entitlementKey] || {};

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-black text-white w-full">
      <div className="max-w-lg w-full bg-zinc-900/80 border border-primary-fixed/20 rounded-3xl p-10 text-center shadow-xl">
        <Crown className="w-14 h-14 text-primary-fixed mx-auto mb-6" />
        {currentPlanName && (
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
            Current plan: <span className="text-white font-bold">{currentPlanName}</span>
          </p>
        )}
        <h2 className="text-2xl font-black font-headline uppercase mb-3 text-white">{title || copy.title}</h2>
        <p className="text-gray-400 text-sm mb-2">{description || copy.description}</p>
        <p className="text-primary-fixed text-xs font-bold uppercase tracking-wider mb-8">{requiredPlan || copy.requiredPlan}</p>
        <Link to="/plans">
          <Button variant="primary" className="inline-flex items-center gap-2">
            View Plans <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PlanUpgradeGate;
