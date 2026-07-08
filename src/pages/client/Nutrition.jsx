import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Droplets, Plus, X, CheckCircle, ChevronLeft, ChevronRight,
  Calendar, Trash2, History,
} from 'lucide-react';
import { nutritionAPI } from '@/services/api';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import PlanUpgradeGate from '@/components/plan/PlanUpgradeGate';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' };

const toDateString = (d = new Date()) => d.toISOString().split('T')[0];

const formatDisplayDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  const today = toDateString();
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const applyDayData = (data) => ({
  meals: data.meals || [],
  mealsByType: data.meals_by_type || null,
  mealCount: data.meal_count ?? (data.meals?.length || 0),
  calories: data.calories || 0,
  protein: data.protein_g || 0,
  carbs: data.carbs_g || 0,
  fats: data.fats_g || 0,
  water: data.water_ml || 0,
  targetCalories: data.target_calories || 2500,
  targetProtein: data.target_protein_g || 180,
  targetCarbs: data.target_carbs_g || 300,
  targetFats: data.target_fats_g || 80,
  targetWater: data.target_water_ml || 3000,
});

/* ── Add Meal Modal ── */
const AddMealModal = ({ logDate, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: '',
    meal_type: 'breakfast',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.calories) return;
    setSaving(true);
    try {
      const res = await nutritionAPI.logMeal({
        ...form,
        log_date: logDate,
        calories: parseInt(form.calories, 10),
        protein_g: parseFloat(form.protein_g) || 0,
        carbs_g: parseFloat(form.carbs_g) || 0,
        fats_g: parseFloat(form.fats_g) || 0,
      });
      const day = res.data?.day;
      if (day) onSaved(day);
      else onSaved(null);
    } catch (err) {
      console.error('Failed to log meal:', err);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div className="mb-4">
      <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-fixed/50 transition-colors text-white"
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black font-headline uppercase text-white">Log Meal</h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-6">{formatDisplayDate(logDate)} · {logDate}</p>
        <div className="space-y-2">
          {field('Meal Name', 'name', 'text', 'e.g. Grilled chicken & rice')}
          <div className="mb-4">
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, meal_type: t }))}
                  className={`py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase transition-all ${form.meal_type === t ? 'bg-primary-fixed text-black' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {field('Calories', 'calories', 'number', '0')}
          <div className="grid grid-cols-3 gap-3">
            {field('Protein (g)', 'protein_g', 'number', '0')}
            {field('Carbs (g)', 'carbs_g', 'number', '0')}
            {field('Fats (g)', 'fats_g', 'number', '0')}
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-headline font-bold uppercase text-sm hover:bg-white/10 transition-colors text-white">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={!form.name || !form.calories || saving} className="flex-1 py-3 bg-primary-fixed text-black rounded-xl font-headline font-black uppercase text-sm hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Log Meal</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const MealRow = ({ meal, onDelete, deleting }) => (
  <motion.div layout className="bg-surface-container-high border border-white/5 rounded-xl p-4 flex items-center justify-between gap-3">
    <div className="min-w-0 flex-1">
      <p className="font-headline font-bold text-sm truncate">{meal.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        P: {meal.protein_g || 0}g · C: {meal.carbs_g || 0}g · F: {meal.fats_g || 0}g
        {meal.eaten_at && (
          <span className="text-gray-600"> · {String(meal.eaten_at).slice(0, 5)}</span>
        )}
      </p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <p className="text-xl font-black font-headline text-primary-fixed">{meal.calories} <span className="text-xs text-gray-500 font-normal">cal</span></p>
      <button
        type="button"
        onClick={() => onDelete(meal.id)}
        disabled={deleting === meal.id}
        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
        title="Remove meal"
      >
        {deleting === meal.id ? (
          <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin block" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  </motion.div>
);

const Nutrition = () => {
  const { loading: entLoading, canNutrition } = usePlanEntitlements();
  const [selectedDate, setSelectedDate] = useState(toDateString());
  const [view, setView] = useState('diary');
  const [day, setDay] = useState(applyDayData({}));
  const [weekDays, setWeekDays] = useState([]);
  const [historyDays, setHistoryDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const loadDay = useCallback(async (dateStr) => {
    const res = await nutritionAPI.getDay(dateStr);
    setDay(applyDayData(res.data));
  }, []);

  const loadWeek = useCallback(async () => {
    const res = await nutritionAPI.getHistory(14);
    setWeekDays(res.data?.days || []);
    setHistoryDays(res.data?.days || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadDay(selectedDate), loadWeek()]);
      } catch (err) {
        console.error('Nutrition fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDate, loadDay, loadWeek]);

  const refreshAfterChange = async () => {
    await Promise.all([loadDay(selectedDate), loadWeek()]);
  };

  const shiftDate = (delta) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(toDateString(d));
  };

  const handleAddWater = async (amount) => {
    const newWater = day.water + amount;
    setDay((s) => ({ ...s, water: newWater }));
    try {
      await nutritionAPI.updateWater({ log_date: selectedDate, water_ml: newWater });
    } catch (err) {
      console.error('Water update error:', err);
      await loadDay(selectedDate);
    }
  };

  const handleMealSaved = (dayPayload) => {
    if (dayPayload) setDay(applyDayData(dayPayload));
    else refreshAfterChange();
    loadWeek();
  };

  const handleDeleteMeal = async (id) => {
    if (!id) return;
    setDeleting(id);
    try {
      await nutritionAPI.deleteMeal(id);
      await refreshAfterChange();
    } catch (err) {
      console.error('Delete meal error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const pct = (cur, target) => {
    if (!target || target === 0) return 0;
    return Math.min((cur / target) * 100, 100);
  };

  const groupedMeals = day.mealsByType || MEAL_TYPES.reduce((acc, t) => {
    acc[t] = (day.meals || []).filter((m) => m.meal_type === t);
    return acc;
  }, {});

  const isToday = selectedDate === toDateString();

  if (entLoading || (loading && day.meals.length === 0 && day.calories === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  if (!canNutrition) {
    return <PlanUpgradeGate entitlementKey="nutrition_access" />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <AnimatePresence>
        {showAddMeal && (
          <AddMealModal
            logDate={selectedDate}
            onClose={() => setShowAddMeal(false)}
            onSaved={handleMealSaved}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic">
            NUTRITION <span className="text-primary-fixed">ENGINE</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Daily food diary — log what you eat every day</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setView('diary')}
              className={`px-3 py-2 rounded-lg text-xs font-headline font-bold uppercase flex items-center gap-1.5 transition-all ${view === 'diary' ? 'bg-primary-fixed text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <Calendar className="w-3.5 h-3.5" /> Diary
            </button>
            <button
              type="button"
              onClick={() => setView('history')}
              className={`px-3 py-2 rounded-lg text-xs font-headline font-bold uppercase flex items-center gap-1.5 transition-all ${view === 'history' ? 'bg-primary-fixed text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAddMeal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-fixed text-black font-headline font-black uppercase text-sm rounded-xl hover:scale-[1.03] transition-transform shadow-[0_0_15px_rgba(218,249,0,0.2)]"
          >
            <Plus className="w-4 h-4" /> Log Meal
          </button>
        </div>
      </div>

      {view === 'diary' && (
        <>
          {/* Week strip */}
          <div className="mb-6 overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              {weekDays.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`flex flex-col items-center w-14 py-3 rounded-xl border transition-all ${
                    selectedDate === d.date
                      ? 'bg-primary-fixed/15 border-primary-fixed text-primary-fixed'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-[10px] font-headline uppercase">{d.label}</span>
                  <span className="text-lg font-black font-headline">{d.day}</span>
                  {d.has_meals ? (
                    <span className="text-[9px] mt-1 text-primary-fixed/80">{d.calories} cal</span>
                  ) : (
                    <span className="text-[9px] mt-1 text-gray-600">—</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date navigator */}
          <div className="flex items-center justify-between mb-6 bg-surface-container-high border border-white/5 rounded-xl px-4 py-3">
            <button type="button" onClick={() => shiftDate(-1)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" aria-label="Previous day">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="font-headline font-black uppercase text-lg">{formatDisplayDate(selectedDate)}</p>
              <p className="text-xs text-gray-500">{selectedDate} · {day.mealCount} meal{day.mealCount !== 1 ? 's' : ''}</p>
            </div>
            <button type="button" onClick={() => shiftDate(1)} disabled={isToday} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" aria-label="Next day">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {!isToday && (
            <button type="button" onClick={() => setSelectedDate(toDateString())} className="mb-4 text-xs font-headline font-bold uppercase text-primary-fixed hover:underline">
              Jump to today
            </button>
          )}
        </>
      )}

      {view === 'history' ? (
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-xl font-black font-headline uppercase mb-4">Last 14 days</h2>
          {[...historyDays].reverse().map((d) => (
            <button
              key={d.date}
              type="button"
              onClick={() => { setSelectedDate(d.date); setView('diary'); }}
              className="w-full bg-surface-container-high border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-primary-fixed/30 transition-colors text-left"
            >
              <div>
                <p className="font-headline font-bold">{formatDisplayDate(d.date)}</p>
                <p className="text-xs text-gray-500">{d.date}</p>
              </div>
              <div className="text-right">
                {d.has_meals ? (
                  <>
                    <p className="text-lg font-black font-headline text-primary-fixed">{d.calories} kcal</p>
                    <p className="text-[10px] text-gray-500">{d.meal_count} meals · {(d.water_ml / 1000).toFixed(1)}L water</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600 font-headline uppercase">No entries</p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-primary-fixed/10 to-surface-container-high border border-primary-fixed/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-primary-fixed uppercase tracking-wider mb-1">{isToday ? "Today's" : 'Daily'} intake</p>
                <p className="text-5xl font-black font-headline">
                  {day.calories.toLocaleString()} <span className="text-2xl text-gray-500 font-normal">kcal</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Target</p>
                <p className="text-2xl font-black font-headline text-gray-300">{day.targetCalories.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-6">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct(day.calories, day.targetCalories)}%` }} className="h-full bg-primary-fixed rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Protein', value: day.protein, target: day.targetProtein, unit: 'g' },
                { label: 'Carbs', value: day.carbs, target: day.targetCarbs, unit: 'g' },
                { label: 'Fats', value: day.fats, target: day.targetFats, unit: 'g' },
              ].map((m) => (
                <div key={m.label} className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-headline uppercase text-gray-500">{m.label}</span>
                    <span className="text-xs font-bold text-primary-fixed">{m.value}{m.unit}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct(m.value, m.target)}%` }} className="h-full bg-primary-fixed rounded-full" />
                  </div>
                  <p className="text-[10px] text-gray-600">/ {m.target}{m.unit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {day.mealCount === 0 ? (
                <div className="bg-surface-container-high border border-white/5 rounded-2xl p-10 text-center">
                  <Utensils className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-headline uppercase text-sm mb-4">Nothing logged for this day</p>
                  <button type="button" onClick={() => setShowAddMeal(true)} className="text-primary-fixed text-sm font-headline font-bold uppercase hover:underline">
                    Add your first meal
                  </button>
                </div>
              ) : (
                MEAL_TYPES.map((type) => {
                  const list = groupedMeals[type] || [];
                  if (list.length === 0) return null;
                  const typeCal = list.reduce((s, m) => s + (parseInt(m.calories, 10) || 0), 0);
                  return (
                    <section key={type}>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-black font-headline uppercase text-gray-400">{MEAL_LABELS[type]}</h2>
                        <span className="text-xs text-primary-fixed font-bold">{typeCal} kcal</span>
                      </div>
                      <div className="space-y-2">
                        {list.map((meal) => (
                          <MealRow key={meal.id} meal={meal} onDelete={handleDeleteMeal} deleting={deleting} />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-primary-fixed" />
                    <span className="font-headline font-bold uppercase text-sm">Hydration</span>
                  </div>
                  <span className="text-2xl font-black font-headline text-primary-fixed">{(day.water / 1000).toFixed(1)}L</span>
                </div>
                <div className="relative h-28 bg-white/5 rounded-xl mb-4 overflow-hidden">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${pct(day.water, day.targetWater)}%` }} className="absolute bottom-0 left-0 right-0 bg-primary-fixed/25 rounded-xl" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-black font-headline">{Math.round(pct(day.water, day.targetWater))}%</p>
                    <p className="text-[10px] text-gray-500 uppercase">of {(day.targetWater / 1000).toFixed(1)}L goal</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 750].map((amt) => (
                    <button key={amt} type="button" onClick={() => handleAddWater(amt)} className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-headline font-bold hover:bg-primary-fixed hover:text-black transition-all">
                      +{amt}ml
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-high border border-white/5 rounded-2xl p-5">
                <h3 className="text-xs font-headline font-bold uppercase text-gray-500 mb-3">Day summary</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-gray-500">Meals logged</span><span className="font-bold">{day.mealCount}</span></li>
                  <li className="flex justify-between"><span className="text-gray-500">Calories left</span><span className="font-bold text-primary-fixed">{Math.max(0, day.targetCalories - day.calories)} kcal</span></li>
                  <li className="flex justify-between"><span className="text-gray-500">Protein left</span><span className="font-bold">{Math.max(0, day.targetProtein - day.protein)}g</span></li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Nutrition;
