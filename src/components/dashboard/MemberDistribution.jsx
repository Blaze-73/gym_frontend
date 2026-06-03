import { motion } from 'framer-motion';

const MemberDistribution = ({ data }) => {
  const defaultData = {
    premium: { percentage: 70, count: 874, color: 'bg-primary-fixed' },
    standard: { percentage: 20, count: 250, color: 'bg-secondary-container' },
    basic: { percentage: 10, count: 124, color: 'bg-outline-variant' },
  };

  const distribution = data || defaultData;

  return (
    <div className="bg-surface-container-low p-8 border border-white/5 flex flex-col items-center">
      <h4 className="font-headline font-black text-xl uppercase tracking-wider italic w-full mb-8">
        Distribution
      </h4>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle
            className="stroke-surface-container-highest"
            cx="18"
            cy="18"
            fill="none"
            r="16"
            strokeWidth="3"
          />
          <circle
            className="stroke-primary-fixed"
            cx="18"
            cy="18"
            fill="none"
            r="16"
            strokeDasharray="70, 100"
            strokeWidth="3"
          />
          <circle
            className="stroke-secondary-container"
            cx="18"
            cy="18"
            fill="none"
            r="16"
            strokeDasharray="20, 100"
            strokeDashoffset="-70"
            strokeWidth="3"
          />
          <circle
            className="stroke-outline-variant"
            cx="18"
            cy="18"
            fill="none"
            r="16"
            strokeDasharray="10, 100"
            strokeDashoffset="-90"
            strokeWidth="3"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black font-headline">
            {distribution.premium.percentage}%
          </span>
          <span className="text-[10px] text-on-surface-variant uppercase font-headline tracking-widest">
            Premium
          </span>
        </div>
      </div>

      <div className="mt-8 w-full space-y-4">
        {Object.entries(distribution).map(([key, item]) => (
          <motion.div
            key={key}
            className="flex justify-between items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 ${item.color}`}></div>
              <span className="text-sm font-headline tracking-wide text-on-surface uppercase">
                {key}
              </span>
            </div>
            <span className="text-sm font-bold">{item.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MemberDistribution;
