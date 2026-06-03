import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Dumbbell, ChevronRight, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutsAPI, userStatsAPI } from '@/services/api';

const Workout = () => {
  const { id } = useParams(); // This is the Workout Template ID
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState(null);
  const [sessionId, setSessionId] = useState(null); // <--- TRACK THE ACTUAL SESSION
  const [protocols, setProtocols] = useState([]);
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const init = async () => {
    setLoading(true); // Ensure we start in loading state
    try {
      // 1. Fetch available programs for the switcher
      const progRes = await workoutsAPI.getPrograms();
      setProtocols(Array.isArray(progRes.data) ? progRes.data : []);

      if (id) {
        // 2. Fetch the workout details FIRST
        const workoutRes = await workoutsAPI.getOne(id);
        setWorkout(workoutRes.data);

        // 3. Try to start a session
        try {
          const startRes = await workoutsAPI.startWorkout({ workout_id: id });
          setSessionId(startRes.data.data.id);
        } catch (sessionErr) {
          console.error("Session could not be started, but we can still view the workout");
          // We don't set a global error here because the user can still see the exercises
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Critical init error:", err);
      setError("Failed to load workout. Please try again.");
    } finally {
      setLoading(false); // <--- THIS ensures the spinner always disappears
    }
  };

  init();

  const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
  return () => clearInterval(timer);
}, [id]);


  const loadProtocol = async () => {
    if (!selectedProtocol) return;
    try {
      setLoading(true);
      const response = await workoutsAPI.getProgramDetails(selectedProtocol);
      const program = response.data;
      const firstWorkoutId = program.workouts?.[0]?.id;
      if (firstWorkoutId) {
        setCurrentExercise(0);
        setCompletedExercises([]);
        setElapsedTime(0);
        // Instead of navigate, we just reload the page with the new ID
        navigate(`/workout/${firstWorkoutId}`);
      } else {
        setError('Selected protocol has no workouts');
      }
    } catch (err) {
      setError('Failed to load protocol');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteExercise = async (index) => {
    if (!completedExercises.includes(index)) {
      setCompletedExercises(prev => [...prev, index]);
    }

    // ✅ SAVE PROGRESS TO BACKEND
    if (sessionId) {
      try {
        await workoutsAPI.updateProgress(sessionId, {
          completed_exercise_index: index,
          elapsed_time: elapsedTime
        });
        console.log("Progress saved to session:", sessionId);
      } catch (e) {
        console.error("Progress not saved:", e);
      }
    }

    if (index < (workout?.exercises?.length || 0) - 1) {
      setCurrentExercise(index + 1);
    } else {
      // FINAL WORKOUT COMPLETION
      try {
        await workoutsAPI.completeWorkout(sessionId, {
          duration_minutes: Math.floor(elapsedTime / 60),
          calories_burned: workout.calories_burned,
          notes: "Completed via app"
        });
        alert("Workout Complete! Progress saved to dashboard.");
        navigate('/dashboard');
      } catch (e) {
        console.error("Final completion failed");
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary-fixed border-t-transparent rounded-full" /></div>;

  if (!workout) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        {error && <div className="bg-red-900/80 text-white p-4 rounded mb-4">{error}</div>}
        <div className="text-center mb-8">
          <Dumbbell className="w-20 h-20 text-primary-fixed mx-auto mb-6" />
          <h2 className="text-3xl font-black font-headline uppercase italic mb-4">Ready to Train?</h2>
          <p className="text-gray-400 text-center max-w-md">Choose your training program below and let's crush your goals together!</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)} className="bg-surface-container-high text-white rounded-xl px-4 py-3 min-w-[250px] border border-white/5 focus:border-primary-fixed focus:outline-none">
            <option value="">Select Training Program</option>
            {protocols.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={loadProtocol} disabled={!selectedProtocol} className="px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-xl font-headline font-bold uppercase tracking-wider disabled:opacity-50">Begin Workout</button>
        </div>
      </div>
    );
  }

  const progress = workout?.exercises?.length > 0 ? (completedExercises.length / workout.exercises.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-black font-headline text-white uppercase italic">{workout?.name || 'Workout'}</h1>
            <p className="text-sm text-gray-400 mt-1">{workout?.duration_minutes} min • {workout?.calories_burned} cal</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-4">
               <select value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)} className="bg-surface-container-high text-xs text-white rounded-lg px-2 py-1 border border-white/10">
                <option value="">Switch Program</option>
                {protocols.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={loadProtocol} className="p-1 bg-primary-fixed text-black rounded-lg"><ChevronRight className="w-4 h-4"/></button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full">
              <Clock className="w-4 h-4 text-primary-fixed" />
              <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
            </div>
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>SESSION PROGRESS</span>
            <span className="text-primary-fixed font-bold">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary-fixed" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentExercise} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="mb-8">
            {workout?.exercises?.[currentExercise] && (
              <div className="bg-surface-container-high border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video bg-surface-container-highest">
                  {workout.exercises[currentExercise].image ? (
                    <img src={workout.exercises[currentExercise].image} alt={workout.exercises[currentExercise].name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Dumbbell className="w-24 h-24 text-gray-600" /></div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-black font-headline text-white uppercase">{workout.exercises[currentExercise].name}</h2>
                      <p className="text-gray-400 mt-1">{workout.exercises[currentExercise].muscle_group || 'Full Body'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-black font-headline text-primary-fixed">{workout.exercises[currentExercise].pivot?.sets || 3}</p>
                        <p className="text-xs text-gray-500 uppercase">Sets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black font-headline text-primary-fixed">{workout.exercises[currentExercise].pivot?.reps || 12}</p>
                        <p className="text-xs text-gray-500 uppercase">Reps</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleCompleteExercise(currentExercise)} className="w-full py-4 bg-primary-fixed text-on-primary-fixed font-headline font-bold uppercase tracking-wider rounded-xl hover:bg-primary-fixed/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-fixed/20">
                    <CheckCircle className="w-5 h-5" /> Complete Set
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
          <h3 className="text-lg font-headline font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Dumbbell className="w-5 h-5" /> All Exercises ({workout?.exercises?.length || 0})
          </h3>
          <div className="grid gap-3">
            {workout?.exercises?.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setCurrentExercise(index)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentExercise === index 
                    ? 'bg-primary-fixed/10 border-primary-fixed text-white' 
                    : 'bg-surface-container-high border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    completedExercises.includes(index) ? 'bg-primary-fixed text-black' : 'bg-white/10'
                  }`}>
                    {completedExercises.includes(index) ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="font-headline font-bold">{exercise.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs opacity-60">{exercise.pivot?.sets || 3} x {exercise.pivot?.reps || 12}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workout;
