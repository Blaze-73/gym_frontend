import { Zap, Crown, Star } from 'lucide-react';

export const PLAN_UI = {
  1: { tag: 'Essential', popular: false, period: 'month', color: 'from-zinc-700 to-zinc-900', Icon: Zap },
  2: { tag: 'Most Popular', popular: true, period: 'year', color: 'from-primary-fixed/20 via-primary-fixed/10 to-black', Icon: Crown },
  3: { tag: 'Advanced', popular: false, period: 'month', color: 'from-zinc-700 to-zinc-900', Icon: Star },
};

export const enrichPlanFromApi = (plan) => {
  const ui = PLAN_UI[plan.id] || {};
  return {
    id: plan.id,
    name: plan.name,
    price: String(parseFloat(plan.price)),
    period: plan.period || ui.period || 'month',
    tag: plan.tag || ui.tag || 'Plan',
    popular: plan.popular ?? ui.popular ?? false,
    features: Array.isArray(plan.features) ? plan.features : [],
    entitlements: plan.entitlements || {},
    color: ui.color || 'from-zinc-700 to-zinc-900',
    Icon: ui.Icon || Zap,
  };
};

export const PLAN_TIER_RANK = { 1: 1, 3: 2, 2: 3 };

export const isUpgradePlan = (currentPlanId, targetPlanId) => {
  if (!currentPlanId || !targetPlanId) return false;
  return (PLAN_TIER_RANK[targetPlanId] ?? 0) > (PLAN_TIER_RANK[currentPlanId] ?? 0);
};

export const isDowngradePlan = (currentPlanId, targetPlanId) => {
  if (!currentPlanId || !targetPlanId) return false;
  return (PLAN_TIER_RANK[targetPlanId] ?? 0) < (PLAN_TIER_RANK[currentPlanId] ?? 0);
};

/** @deprecated use isDowngradePlan */
export const isLowerTierPlan = isDowngradePlan;

export const UPGRADE_COPY = {
  nutrition_access: {
    title: 'Nutrition requires Alpha Orbit or Interstellar',
    description: 'S-Tier Pulse includes gym access and workouts only. Upgrade to log meals and macros.',
    requiredPlan: 'Alpha Orbit or Interstellar',
  },
  schedule_access: {
    title: 'Class schedule is Interstellar only',
    description: 'View the weekly class schedule with the Interstellar plan.',
    requiredPlan: 'INTERSTELLAR',
  },
  coaches_access: {
    title: 'Coaches are Interstellar only',
    description: 'Request a personal coach with the Interstellar plan.',
    requiredPlan: 'INTERSTELLAR',
  },
};
