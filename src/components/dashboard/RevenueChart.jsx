import { useState } from 'react';
import { motion } from 'framer-motion';

const CHART_HEIGHT = 200;

const RevenueChart = ({ trends }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  const defaultTrends = [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ];

  const source = trends?.length ? trends : defaultTrends;
  const revenues = source.map((t) => Number(t.revenue) || 0);
  const maxRevenue = Math.max(...revenues, 1);
  const hasData = revenues.some((r) => r > 0);

  const chartData = source.map((t) => {
    const revenue = Number(t.revenue) || 0;
    const label = (t.month || '').split(' ')[0].slice(0, 3).toUpperCase();
    const barPx = hasData
      ? Math.max(revenue > 0 ? 20 : 6, Math.round((revenue / maxRevenue) * CHART_HEIGHT))
      : 24;
    return { month: label, revenue, barPx };
  });

  const yTicks = hasData
    ? [0, 0.25, 0.5, 0.75, 1].map((f) => ({
        value: maxRevenue * f,
        top: `${(1 - f) * 100}%`,
      }))
    : [{ value: 0, top: '100%' }];

  const formatAxis = (n) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return `$${Math.round(n)}`;
  };

  return (
    <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6 md:p-8 h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
        <div>
          <h4 className="font-headline font-black text-xl uppercase tracking-wider italic text-white">
            Revenue Growth
          </h4>
          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
            {hasData ? 'Last 6 months · collected revenue' : 'Last 6 months · no payments yet'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
          <div className="w-3 h-3 rounded-sm bg-primary-fixed shrink-0" />
          Collected revenue
        </div>
      </div>

      <div className="flex gap-2">
        {/* Y-axis */}
        <div className="relative w-10 shrink-0" style={{ height: CHART_HEIGHT + 28 }}>
          {yTicks.map((tick) => (
            <span
              key={tick.top}
              className="absolute right-0 -translate-y-1/2 text-[9px] text-gray-600 font-headline tabular-nums"
              style={{ top: tick.top }}
            >
              {formatAxis(tick.value)}
            </span>
          ))}
        </div>

        {/* Plot area */}
        <div className="flex-1 min-w-0">
          <div
            className="relative border-b border-l border-white/10"
            style={{ height: CHART_HEIGHT }}
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((f) => (
              <div
                key={f}
                className="absolute left-0 right-0 border-t border-white/[0.06] pointer-events-none"
                style={{ top: `${(1 - f) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end justify-between gap-2 px-1">
              {chartData.map((item, index) => (
                <div
                  key={`${item.month}-${index}`}
                  className="flex-1 h-full flex flex-col justify-end items-center min-w-0"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === index && (
                    <div className="mb-1 whitespace-nowrap bg-primary-fixed text-black text-[10px] px-2 py-0.5 font-bold rounded z-10">
                      ${item.revenue.toLocaleString()}
                    </div>
                  )}
                  <motion.div
                    className="w-full max-w-[48px] bg-primary-fixed rounded-t-md shadow-[0_0_12px_rgba(218,249,0,0.25)]"
                    initial={{ height: 0 }}
                    animate={{ height: item.barPx }}
                    transition={{ delay: index * 0.06, duration: 0.45, ease: 'easeOut' }}
                    style={{ opacity: item.revenue > 0 || !hasData ? 1 : 0.35 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between gap-2 mt-2 px-1">
            {chartData.map((item, index) => (
              <span
                key={`label-${index}`}
                className={`flex-1 text-center text-[10px] font-headline font-bold uppercase tracking-wider truncate
                  ${hoveredBar === index ? 'text-primary-fixed' : 'text-gray-500'}`}
              >
                {item.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
