import { useState } from 'react';
import { motion } from 'framer-motion';

const RevenueChart = ({ data }) => {
  const defaultData = [
    { month: 'JAN', current: 65, previous: 40 },
    { month: 'FEB', current: 45, previous: 35 },
    { month: 'MAR', current: 85, previous: 55 },
    { month: 'APR', current: 55, previous: 30 },
    { month: 'MAY', current: 95, previous: 70 },
    { month: 'JUN', current: 75, previous: 45 },
  ];

  const chartData = data || defaultData;
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="lg:col-span-2 bg-surface-container-low p-8 border border-white/5">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h4 className="font-headline font-black text-xl uppercase tracking-wider italic">
            Revenue Growth
          </h4>
          <p className="text-on-surface-variant text-xs mt-1">
            H1 FISCAL CYCLE PERFORMANCE
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
            <div className="w-3 h-3 bg-primary-fixed"></div>
            CURRENT
          </div>
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
            <div className="w-3 h-3 bg-surface-container-highest"></div>
            PREVIOUS
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-4">
        {chartData.map((item, index) => (
          <motion.div
            key={item.month}
            className="flex-1 group relative"
            onMouseEnter={() => setHoveredBar(index)}
            onMouseLeave={() => setHoveredBar(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {hoveredBar === index && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-100 transition-opacity bg-primary-fixed text-on-primary-fixed text-[10px] px-2 py-1 font-bold z-10">
                {item.month}
              </div>
            )}
            <div
              className="w-full bg-surface-container-highest mb-1 transition-all duration-300"
              style={{ height: `${item.previous}%` }}
            ></div>
            <motion.div
              className="w-full bg-primary-fixed transition-all duration-300"
              style={{ height: `${item.current}%` }}
              whileHover={{ height: `${item.current + 5}%` }}
            ></motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
