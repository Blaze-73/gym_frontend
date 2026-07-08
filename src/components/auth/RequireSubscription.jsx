import { Navigate, useLocation } from 'react-router-dom';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import Loading from '@/components/common/Loading';

/** Blocks client app routes until the user has an active paid plan. */
const RequireSubscription = ({ children }) => {
  const { loading, subscribed } = usePlanEntitlements();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!subscribed) {
    return (
      <Navigate
        to="/plans"
        state={{ requireSubscription: true, from: location }}
        replace
      />
    );
  }

  return children;
};

export default RequireSubscription;
