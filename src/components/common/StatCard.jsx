import { motion } from 'framer-motion';

const StatCard = ({ title, value, trend, trendValue, progress, color = 'primary-fixed' }) => {
  const colorClasses = {
    'primary-fixed': 'bg-primary-fixed',
    'error': 'bg-error',
    'secondary-container': 'bg-secondary-container',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-high p-6 relative overflow-hidden group"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClasses[color] || colorClasses['primary-fixed']}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <span className="text-on-surface-variant uppercase text-xs font-headline tracking-widest">
          {title}
        </span>
        <span className={`font-headline text-xs ${
          trend === 'positive' ? 'text-primary-fixed' : 
          trend === 'negative' ? 'text-error' : 
          'text-on-surface-variant'
        }`}>
          {trendValue}
        </span>
      </div>
      
      <h3 className="text-4xl font-black font-headline mb-1">{value}</h3>
      
      <div className="w-full h-1 bg-surface-container-highest mt-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full ${colorClasses[color] || colorClasses['primary-fixed']}`}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
