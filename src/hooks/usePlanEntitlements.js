import { useState, useEffect, useCallback } from 'react';
import { entitlementsAPI, subscriptionsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const GUEST = {
  gym_access: false,
  nutrition_access: false,
  schedule_access: false,
  coaches_access: false,
  store_discount_percent: 0,
};

export const usePlanEntitlements = () => {
  const { isAuthenticated, user } = useAuth();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEntitlements = useCallback(async () => {
    if (!isAuthenticated) {
      setBundle({ subscribed: false, entitlements: GUEST, features: [], store_discount_percent: 0 });
      setLoading(false);
      return;
    }
    try {
      const res = await entitlementsAPI.getMe();
      setBundle(res.data);
    } catch {
      setBundle({ subscribed: false, entitlements: GUEST, features: [], store_discount_percent: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    fetchEntitlements();
  }, [fetchEntitlements, user?.id]);

  const ent = { ...GUEST, ...(bundle?.entitlements || {}) };
  const planId = bundle?.plan_id != null ? Number(bundle.plan_id) : null;
  if (planId === 2 || planId === 3) {
    ent.nutrition_access = true;
  }
  if (planId === 2) {
    ent.schedule_access = true;
  }
  if (planId === 3) {
    ent.schedule_access = false;
  }
  const storeDiscountPercent = Number(ent.store_discount_percent ?? bundle?.store_discount_preview?.percent ?? 0);

  return {
    loading,
    bundle,
    subscribed: Boolean(bundle?.subscribed),
    planId,
    planName: bundle?.plan_name ?? null,
    features: bundle?.features || [],
    entitlements: ent,
    storeDiscountPercent,
    refresh: fetchEntitlements,
    canNutrition: Boolean(ent.nutrition_access),
    canSchedule: Boolean(ent.schedule_access),
    canCoaches: Boolean(ent.coaches_access),
    can: (key) => Boolean(ent[key]),
  };
};

export default usePlanEntitlements;
