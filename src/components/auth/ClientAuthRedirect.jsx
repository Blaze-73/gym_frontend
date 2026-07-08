import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resolveClientHomePath } from '@/utils/clientHomePath';
import Loading from '@/components/common/Loading';

/** Redirect logged-in users away from login/register to the right home. */
const ClientAuthRedirect = () => {
  const { isAdmin, isCoach, user } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (isAdmin()) {
      setTarget('/admin');
      return;
    }
    if (isCoach()) {
      setTarget('/coach-portal');
      return;
    }
    resolveClientHomePath('/dashboard').then((path) => setTarget(path));
  }, [user?.id, user?.role]);

  if (!target) {
    return <Loading />;
  }

  return (
    <Navigate
      to={target}
      replace
      state={target === '/plans' ? { requireSubscription: true } : undefined}
    />
  );
};

export default ClientAuthRedirect;
