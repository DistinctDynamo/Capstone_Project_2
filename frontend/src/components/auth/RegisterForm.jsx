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
import Button from '../common/Button';
import Input from '../common/Input';

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

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow mb-6">
          <GiSoccerBall className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Join SoccerConnect
        </h1>
        <p className="text-dark-400">
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
                      ? 'bg-primary-500 text-white'
                      : currentStep === step.id
                      ? 'bg-primary-500/20 text-primary-400 border-2 border-primary-500'
                      : 'bg-dark-800 text-dark-400 border border-dark-700'
                  }
                `}
              >
                {currentStep > step.id ? <FiCheck size={18} /> : step.id}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={`text-xs font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-dark-400'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-primary-500' : 'bg-dark-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Account Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                leftIcon={<FiUser size={18} />}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                leftIcon={<FiUser size={18} />}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>
            <Input
              label="Username"
              placeholder="johndoe"
              leftIcon={<FiUser size={18} />}
              error={errors.username?.message}
              helperText="This will be your unique identifier"
              {...register('username')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<FiMail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Date of Birth"
              type="date"
              leftIcon={<FiCalendar size={18} />}
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
          <div className="space-y-6 animate-fade-in">
            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="(416) 555-1234"
              leftIcon={<FiPhone size={18} />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Location (Optional)"
              placeholder="Toronto, ON"
              leftIcon={<FiMapPin size={18} />}
              error={errors.location?.message}
              helperText="Help others find players in your area"
              {...register('location')}
            />
            <div className="card bg-dark-800/50 p-4">
              <p className="text-sm text-dark-300">
                <span className="text-primary-400 font-medium">Pro tip:</span> Adding your
                location helps you find nearby pickup games and teams looking for players
                in your area.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              leftIcon={<FiLock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="grid grid-cols-2 gap-2">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-sm ${
                    req.met ? 'text-primary-400' : 'text-dark-400'
                  }`}
                >
                  <FiCheck
                    className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`}
                  />
                  {req.label}
                </div>
              ))}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={<FiLock size={18} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Age Consent Checkbox */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                  {...register('ageConsent')}
                />
                <span className="text-sm text-dark-300">
                  <strong className="text-yellow-400">Age Requirement:</strong> I confirm that I am 18 years or older,
                  OR I have parental/guardian consent to use this platform. I understand that if I am under 18, my
                  parent/guardian accepts full responsibility and liability for my use of SoccerConnect and any
                  activities I participate in.
                </span>
              </label>
              {errors.ageConsent && (
                <p className="text-sm text-red-400 mt-2">{errors.ageConsent.message}</p>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                {...register('agreeToTerms')}
              />
              <span className="text-sm text-dark-300">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-400 hover:text-primary-300" target="_blank">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-400 hover:text-primary-300" target="_blank">
                  Privacy Policy
                </Link>
                , including the assumption of risk and liability waiver.
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-400">{errors.agreeToTerms.message}</p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              leftIcon={<FiArrowLeft />}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              rightIcon={<FiArrowRight />}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              rightIcon={<FiCheck />}
              className="flex-1"
            >
              Create Account
            </Button>
          )}
        </div>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-dark-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
