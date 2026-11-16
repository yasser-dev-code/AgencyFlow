import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoading } from '../components/ui/Primitives';
import { useLanguage } from '../context/LanguageContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) return <PageLoading label={t('common.loading')} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
