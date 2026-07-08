import { entitlementsAPI } from '@/services/api';

/** Where to send a client after login/register. */
export const resolveClientHomePath = async (fallback = '/dashboard') => {
  try {
    const res = await entitlementsAPI.getMe();
    return res.data?.subscribed ? fallback : '/plans';
  } catch {
    return '/plans';
  }
};
