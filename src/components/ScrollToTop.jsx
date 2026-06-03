import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 *
 * React Router does not automatically scroll to the top when navigating
 * between routes. This component listens for location changes and forces a
 * scroll to the top of the page, ensuring a consistent navigation experience.
 * It is lightweight and can be placed anywhere inside the router hierarchy.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use the native scroll API for immediate top‑of‑page positioning.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
