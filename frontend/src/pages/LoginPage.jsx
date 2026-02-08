import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="card glass p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
