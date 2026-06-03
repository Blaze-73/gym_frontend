import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Droplets, Plus, X, CheckCircle } from 'lucide-react';
import { nutritionAPI } from '@/services/api';

/* ── Add Meal Modal ── */
const AddMealModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ 
    name: '', 
    meal_type: 'breakfast', 
    calories: '', 
    protein_g: '', 
    carbs_g: '', 
    fats_g: '' 
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.calories) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await nutritionAPI.logMeal({ ...form, log_date: today });
      
      // Laravel returns { message: "...", data: { meal_object } }
      const mealData = res.data.data || res.data; 
      onAdd(mealData);
    } catch (err) {
      console.error("Backend error, adding optimistically:", err);
      onAdd({ ...form, id: Date.now() });
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
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-fixed/50 transition-colors text-white"
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black font-headline uppercase text-white">Log Meal</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-2">
          {field('Meal Name', 'name', 'text', 'e.g. Grilled Chicken')}
          
          <div className="mb-4">
            <label className="block text-xs font-headline font-bold uppercase tracking-wider text-gray-500 mb-2">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, meal_type: t }))} className={`py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase transition-all ${form.meal_type === t ? 'bg-primary-fixed text-black' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}>{t}</button>
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
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-headline font-bold uppercase text-sm hover:bg-white/10 transition-colors text-white">Cancel</button>
          <button onClick={handleSubmit} disabled={!form.name || !form.calories || saving} className="flex-1 py-3 bg-primary-fixed text-black rounded-xl font-headline font-black uppercase text-sm hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Log Meal</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [todayStats, setTodayStats] = useState({
    calories: 0, protein: 0, carbs: 0, fats: 0, water: 0,
    targetCalories: 2500, targetProtein: 180, targetCarbs: 300, targetFats: 80, targetWater: 3000,
  });

  useEffect(() => { fetchNutritionData(); }, []);

  const fetchNutritionData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await nutritionAPI.getToday(today);
      const data = res.data;
      
      setMeals(data.meals || []);
      setTodayStats({
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
    } catch (err) { 
      console.error("Nutrition fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (amount) => {
    const newWater = todayStats.water + amount;
    setTodayStats(s => ({ ...s, water: newWater }));
    try {
      const today = new Date().toISOString().split('T')[0];
      await nutritionAPI.updateWater({ log_date: today, water_ml: newWater });
    } catch (err) { console.error("Water update error:", err); }
  };

  const handleMealAdded = (meal) => {
    // Force numbers to prevent "100" + "200" = "100200"
    const c = parseInt(meal.calories) || 0;
    const p = parseFloat(meal.protein_g) || 0;
    const cb = parseFloat(meal.carbs_g) || 0;
    const f = parseFloat(meal.fats_g) || 0;

    setMeals(m => [meal, ...m]);
    setTodayStats(s => ({
      ...s,
      calories: s.calories + c,
      protein: s.protein + p,
      carbs: s.carbs + cb,
      fats: s.fats + f,
    }));
  };

  const pct = (cur, target) => {
    if (!target || target === 0) return 0;
    return Math.min((cur / target) * 100, 100);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <AnimatePresence>{showAddMeal && <AddMealModal onClose={() => setShowAddMeal(false)} onAdd={handleMealAdded} />}</AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic">NUTRITION <span className="text-primary-fixed">ENGINE</span></h1>
          <p className="text-gray-400 mt-1 text-sm">Fuel your performance</p>
        </div>
        <button onClick={() => setShowAddMeal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-fixed text-black font-headline font-black uppercase text-sm rounded-xl hover:scale-[1.03] transition-transform shadow-[0_0_15px_rgba(218,249,0,0.2)]">
          <Plus className="w-4 h-4" /> Log Meal
        </button>
      </div>

      <div className="bg-gradient-to-r from-primary-fixed/10 to-surface-container-high border border-primary-fixed/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-primary-fixed uppercase tracking-wider mb-1">Today's Intake</p>
            <p className="text-5xl font-black font-headline">{todayStats.calories.toLocaleString()} <span className="text-2xl text-gray-500 font-normal">kcal</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-2xl font-black font-headline text-gray-300">{todayStats.targetCalories.toLocaleString()}</p>
          </div>
        </div>

        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-6">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct(todayStats.calories, todayStats.targetCalories)}%` }} className="h-full bg-primary-fixed rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Protein', value: todayStats.protein, target: todayStats.targetProtein, unit: 'g' },
            { label: 'Carbs', value: todayStats.carbs, target: todayStats.targetCarbs, unit: 'g' },
            { label: 'Fats', value: todayStats.fats, target: todayStats.targetFats, unit: 'g' },
          ].map(m => (
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
        <div className="lg:col-span-2">
          <h2 className="text-xl font-black font-headline uppercase mb-4">Logged Meals</h2>
          {meals.length === 0 ? (
            <div className="bg-surface-container-high border border-white/5 rounded-2xl p-10 text-center">
              <Utensils className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-headline uppercase text-sm">No meals logged today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal, i) => (
                <motion.div key={meal.id || i} className="bg-surface-container-high border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-primary-fixed/10 text-primary-fixed text-[10px] font-headline font-bold uppercase rounded-full">{meal.meal_type}</span>
                      <p className="font-headline font-bold text-sm">{meal.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">P: {meal.protein_g || 0}g · C: {meal.carbs_g || 0}g · F: {meal.fats_g || 0}g</p>
                  </div>
                  <p className="text-xl font-black font-headline text-primary-fixed">{meal.calories} <span className="text-xs text-gray-500 font-normal">cal</span></p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-high border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2"><Droplets className="w-5 h-5 text-primary-fixed" /><span className="font-headline font-bold uppercase text-sm">Hydration</span></div>
              <span className="text-2xl font-black font-headline text-primary-fixed">{(todayStats.water / 1000).toFixed(1)}L</span>
            </div>
            <div className="relative h-28 bg-white/5 rounded-xl mb-4 overflow-hidden">
              <motion.div initial={{ height: 0 }} animate={{ height: `${pct(todayStats.water, todayStats.targetWater)}%` }} className="absolute bottom-0 left-0 right-0 bg-primary-fixed/25 rounded-xl" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black font-headline">{Math.round(pct(todayStats.water, todayStats.targetWater))}%</p>
                <p className="text-[10px] text-gray-500 uppercase">of {(todayStats.targetWater/1000).toFixed(1)}L goal</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[250, 500, 750].map(amt => (
                <button key={amt} onClick={() => handleAddWater(amt)} className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-headline font-bold hover:bg-primary-fixed hover:text-black transition-all">+{amt}ml</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
