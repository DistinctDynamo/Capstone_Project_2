import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoginForm from '../components/auth/LoginForm';
import { GiSoccerBall } from 'react-icons/gi';

const LoginPage = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.user_type === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4 py-12">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#22c55e]/5 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-2xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
