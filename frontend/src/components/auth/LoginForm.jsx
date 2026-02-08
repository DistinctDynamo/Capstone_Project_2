import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import useAuthStore from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await login(data.email, data.password);
      const user = response?.data?.user;
      toast.success('Welcome back!');

      if (user?.user_type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a5f2a] mb-6">
          <GiSoccerBall className="w-8 h-8 text-[#4ade80]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back
        </h1>
        <p className="text-[#64748b]">
          Sign in to continue to SoccerConnect
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full pl-12 pr-4 py-3 bg-[#141c28] border rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 transition-colors ${
                errors.email ? 'border-[#ef4444]' : 'border-[#2a3a4d]'
              }`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-[#ef4444]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="password"
              placeholder="Enter your password"
              className={`w-full pl-12 pr-4 py-3 bg-[#141c28] border rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 transition-colors ${
                errors.password ? 'border-[#ef4444]' : 'border-[#2a3a4d]'
              }`}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-[#ef4444]">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#2a3a4d] bg-[#141c28] text-[#22c55e] focus:ring-[#22c55e] focus:ring-offset-[#0d1219]"
            />
            <span className="text-sm text-[#94a3b8]">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-[#4ade80] hover:text-[#22c55e] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-[#4ade80]/30 border-t-[#4ade80] rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <FiArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1c2430]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0d1219] text-[#64748b]">
            New to SoccerConnect?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link
        to="/register"
        className="block w-full py-3 bg-[#141c28] text-white font-semibold rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] hover:border-[#3d4f63] transition-all text-center"
      >
        Create an Account
      </Link>
    </div>
  );
};

export default LoginForm;
