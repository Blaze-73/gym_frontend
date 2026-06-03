import StatCard from '@/components/common/StatCard';

const KPICards = ({ stats }) => {
  const defaultStats = {
    totalMembers: { value: '1,248', trend: 'positive', trendValue: '+12%', progress: 78 },
    revenue: { value: '$42,850', trend: 'positive', trendValue: '+8.4%', progress: 62 },
    checkIns: { value: '156', trend: 'neutral', trendValue: 'Today', progress: 45 },
    renewals: { value: '42', trend: 'negative', trendValue: '-3%', progress: 20 },
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Members"
        value={data.totalMembers.value}
        trend={data.totalMembers.trend}
        trendValue={data.totalMembers.trendValue}
        progress={data.totalMembers.progress}
      />
      <StatCard
        title="Monthly Revenue"
        value={data.revenue.value}
        trend={data.revenue.trend}
        trendValue={data.revenue.trendValue}
        progress={data.revenue.progress}
      />
      <StatCard
        title="Daily Check-ins"
        value={data.checkIns.value}
        trend={data.checkIns.trend}
        trendValue={data.checkIns.trendValue}
        progress={data.checkIns.progress}
      />
      <StatCard
        title="Pending Renewals"
        value={data.renewals.value}
        trend={data.renewals.trend}
        trendValue={data.renewals.trendValue}
        progress={data.renewals.progress}
        color="error"
      />
    </div>
  );
};

export default KPICards;
