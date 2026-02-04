import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function GuestOnly({ children }) {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to='/' replace />;
  return children;
}