import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Calendar, Utensils, Users, TrendingUp, Activity, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userStatsAPI, userProgramsAPI } from '@/services/api';
import SubscriptionStatusBanner from '@/components/subscription/SubscriptionStatusBanner';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { canNutrition, canSchedule, canCoaches } = usePlanEntitlements();
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    programsActive: 0,
    caloriesBurned: 0,
    workoutsThisWeek: 0,
  });
  const [activeProgram, setActiveProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchStats();
        await fetchActiveProgram();
      } catch (e) {
        console.error("Dashboard Init Error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await userStatsAPI.getWorkoutsStats();
      const data = response.data;
      setStats({
        workoutsCompleted: data.completed_workouts || 0,
        programsActive: 1,
        caloriesBurned: data.total_calories || 0,
        workoutsThisWeek: data.total_workouts || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchActiveProgram = async () => {
    try {
      const response = await userProgramsAPI.getActive();
      setActiveProgram(response.data);
    } catch (error) {
      console.error('Failed to fetch active program:', error);
    }
  };

  const quickActions = [
    { title: 'Start Workout', icon: Dumbbell, link: '/workout', color: 'text-primary-fixed', allowed: true },
    { title: 'Class Schedule', icon: Calendar, link: '/schedule', color: 'text-blue-400', allowed: canSchedule },
    { title: 'Nutrition', icon: Utensils, link: '/nutrition', color: 'text-green-400', allowed: canNutrition },
    { title: 'Find Coach', icon: Users, link: '/coaches', color: 'text-purple-400', allowed: canCoaches },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-fixed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative h-64 bg-cover bg-center" style={{ backgroundImage: "url('/images/dashboard-hero.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-sm text-gray-300 uppercase tracking-wider mb-2">Welcome Back</p>
            <h1 className="text-4xl font-black font-headline text-white uppercase italic">
              {user?.name?.split(' ')[0] || 'Athlete'}
            </h1>
            <p className="text-lg text-gray-300 mt-2">Let's push your limits and achieve greatness together!</p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <SubscriptionStatusBanner variant="banner" className="mb-8" />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Workouts Completed', value: stats.workoutsCompleted, icon: Activity, color: 'text-primary-fixed' },
            { label: 'Active Programs', value: stats.programsActive, icon: Calendar, color: 'text-blue-400' },
            { label: 'Calories Burned', value: stats.caloriesBurned.toLocaleString(), icon: TrendingUp, color: 'text-green-400' },
            { label: 'This Week', value: stats.workoutsThisWeek, icon: Clock, color: 'text-purple-400' },
          ].map((stat, index) => (
            <motion.div key={index} className="bg-surface-container-high border border-white/5 rounded-2xl p-6">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
              <p className="text-3xl font-black font-headline text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h2 className="text-2xl font-black font-headline uppercase mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.allowed ? action.link : '/plans'}>
                <motion.div
                  whileHover={{ y: action.allowed ? -5 : 0, scale: action.allowed ? 1.02 : 1 }}
                  className={`bg-surface-container-high border rounded-2xl p-6 group
                    ${action.allowed ? 'border-white/5 cursor-pointer' : 'border-white/10 opacity-50 cursor-pointer'}`}
                >
                  <action.icon className={`w-10 h-10 ${action.color} mb-4 transition-transform ${action.allowed ? 'group-hover:scale-110' : ''}`} />
                  <h3 className="text-lg font-headline font-bold">{action.title}</h3>
                  {!action.allowed && (
                    <p className="text-[10px] text-primary-fixed uppercase mt-2 font-bold">Upgrade plan</p>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {activeProgram && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black font-headline uppercase">Active Protocol</h2>
            </div>

            <div className="bg-gradient-to-r from-primary-fixed/20 to-surface-container-high border border-primary-fixed/30 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-black font-headline text-white uppercase mb-2">{activeProgram.program?.name}</h3>
                  <p className="text-gray-400 mb-6">{activeProgram.program?.description}</p>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary-fixed" /><span>Week {activeProgram.current_week} / {activeProgram.program?.duration_weeks}</span></div>
                    <div className="flex items-center gap-2"><Award className="w-5 h-5 text-primary-fixed" /><span>{activeProgram.completion_percentage}% Complete</span></div>
                  </div>
                  <Link to={activeProgram?.program?.workouts?.[0]?.id ? `/workout/${activeProgram.program.workouts[0].id}` : '/dashboard'}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }} // ✅ FIX: Corrected from a-20.98
                      className="px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-xl font-headline font-bold uppercase tracking-wider"
                    >
                      Continue Training
                    </motion.button>
                  </Link>
                </div>
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2"><span>PROGRESS</span><span className="text-primary-fixed font-bold">{activeProgram.completion_percentage}%</span></div>
                    <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${activeProgram.completion_percentage}%` }} className="h-full bg-primary-fixed" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-highest/50 rounded-xl"><p className="text-2xl font-black font-headline text-white">{activeProgram.current_week}</p><p className="text-xs text-gray-500 uppercase">Current Week</p></div>
                    <div className="p-4 bg-surface-container-highest/50 rounded-xl"><p className="text-2xl font-black font-headline text-white">{activeProgram.program?.duration_weeks}</p><p className="text-xs text-gray-500 uppercase">Total Weeks</p></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
