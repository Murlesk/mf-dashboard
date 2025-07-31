import { useAuth } from '../contexts/AuthContext';

export default function AppInit({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return children;
}