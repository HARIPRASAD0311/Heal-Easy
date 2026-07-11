import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

/**
 * Guards a route for the auth prototype. If the person is not signed in,
 * it bounces them to the dashboard and opens the sign-in modal pre-armed
 * to redirect back here once they authenticate.
 */
export default function RequireAuth({ children, reason }) {
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useUI();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal(reason, location.pathname);
    }
  }, [isAuthenticated, openLoginModal, reason, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
