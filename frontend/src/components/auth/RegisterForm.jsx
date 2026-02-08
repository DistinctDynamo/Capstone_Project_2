import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiMapPin,
  FiPhone,
  FiCalendar,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import useAuthStore from '../../store/authStore';

// Calculate minimum date (must be at least 5 years old to register)
const getMaxDate = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 5);
  return today.toISOString().split('T')[0];
};

// Calculate a reasonable minimum date (100 years ago)
const getMinDate = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 100);
  return today.toISOString().split('T')[0];
};

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please enter a valid email address'),
    date_of_birth: z.string().min(1, 'Date of birth is required').refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const minAge = 5;
      const maxAge = 100;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= minAge && age <= maxAge;
    }, 'Please enter a valid date of birth'),
    phone: z.string().optional(),
    location: z.string().optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
    ageConsent: z.boolean().refine((val) => val === true, {
      message: 'You must confirm you are 18+ or have parental consent',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const steps = [
  { id: 1, title: 'Account', description: 'Basic info' },
  { id: 2, title: 'Profile', description: 'Your details' },
  { id: 3, title: 'Security', description: 'Set password' },
];

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      date_of_birth: '',
      phone: '',
      location: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      ageConsent: false,
    },
  });

  const password = watch('password');

  const passwordRequirements = [
    { label: 'At least 6 characters', met: password?.length >= 6 },
  ];

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'username', 'email', 'date_of_birth'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['phone', 'location'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, agreeToTerms, ageConsent, ...userData } = data;
      await registerUser(userData);
      toast.success('Welcome to SoccerConnect!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input component for the form
  const FormInput = ({ label, icon: Icon, error, helperText, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />}
        <input
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-[#141c28] border rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 transition-colors ${
            error ? 'border-[#ef4444]' : 'border-[#2a3a4d]'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#64748b]">{helperText}</p>}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a5f2a] mb-6">
          <GiSoccerBall className="w-8 h-8 text-[#4ade80]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Join SoccerConnect
        </h1>
        <p className="text-[#64748b]">
          Create your account and start playing
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300
                  ${
                    currentStep > step.id
                      ? 'bg-[#1a5f2a] text-[#4ade80]'
                      : currentStep === step.id
                      ? 'bg-[#1a5f2a]/20 text-[#4ade80] border-2 border-[#22c55e]'
                      : 'bg-[#141c28] text-[#64748b] border border-[#2a3a4d]'
                  }
                `}
              >
                {currentStep > step.id ? <FiCheck size={18} /> : step.id}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={`text-xs font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-[#64748b]'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-[#22c55e]' : 'bg-[#2a3a4d]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Step 1: Account Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                placeholder="John"
                icon={FiUser}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <FormInput
                label="Last Name"
                placeholder="Doe"
                icon={FiUser}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>
            <FormInput
              label="Username"
              placeholder="johndoe"
              icon={FiUser}
              error={errors.username?.message}
              helperText="This will be your unique identifier"
              {...register('username')}
            />
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={FiMail}
              error={errors.email?.message}
              {...register('email')}
            />
            <FormInput
              label="Date of Birth"
              type="date"
              icon={FiCalendar}
              error={errors.date_of_birth?.message}
              min={getMinDate()}
              max={getMaxDate()}
              helperText="Required for age verification"
              {...register('date_of_birth')}
            />
          </div>
        )}

        {/* Step 2: Profile Info */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <FormInput
              label="Phone Number (Optional)"
              type="tel"
              placeholder="(416) 555-1234"
              icon={FiPhone}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <FormInput
              label="Location (Optional)"
              placeholder="Toronto, ON"
              icon={FiMapPin}
              error={errors.location?.message}
              helperText="Help others find players in your area"
              {...register('location')}
            />
            <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4">
              <p className="text-sm text-[#94a3b8]">
                <span className="text-[#4ade80] font-medium">Pro tip:</span> Adding your
                location helps you find nearby pickup games and teams looking for players
                in your area.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <FormInput
              label="Password"
              type="password"
              placeholder="Create a strong password"
              icon={FiLock}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex flex-wrap gap-3">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    req.met ? 'text-[#4ade80]' : 'text-[#64748b]'
                  }`}
                >
                  <FiCheck className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                  {req.label}
                </div>
              ))}
            </div>

            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={FiLock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Age Consent Checkbox */}
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-[#2a3a4d] bg-[#141c28] text-[#22c55e] focus:ring-[#22c55e] focus:ring-offset-[#0d1219]"
                  {...register('ageConsent')}
                />
                <span className="text-sm text-[#94a3b8]">
                  <strong className="text-[#f59e0b]">Age Requirement:</strong> I confirm that I am 18 years or older,
                  OR I have parental/guardian consent to use this platform.
                </span>
              </label>
              {errors.ageConsent && (
                <p className="text-xs text-[#ef4444] mt-2">{errors.ageConsent.message}</p>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-[#2a3a4d] bg-[#141c28] text-[#22c55e] focus:ring-[#22c55e] focus:ring-offset-[#0d1219]"
                {...register('agreeToTerms')}
              />
              <span className="text-sm text-[#94a3b8]">
                I agree to the{' '}
                <Link to="/terms" className="text-[#4ade80] hover:text-[#22c55e]" target="_blank">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#4ade80] hover:text-[#22c55e]" target="_blank">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-xs text-[#ef4444]">{errors.agreeToTerms.message}</p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 bg-[#141c28] text-white font-semibold rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center justify-center gap-2"
            >
              Continue
              <FiArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-[#4ade80]/30 border-t-[#4ade80] rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <FiCheck className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-[#64748b]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#4ade80] hover:text-[#22c55e] font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
