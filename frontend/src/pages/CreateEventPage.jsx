import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Card, Button, Input } from '../components/common';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  event_type: z.enum(['pickup_game', 'tournament', 'training', 'tryout', 'social', 'other']),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location_name: z.string().min(3, 'Location is required'),
  address: z.string().min(5, 'Address is required'),
  max_participants: z.number().min(2, 'At least 2 players required').max(100),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  price: z.number().min(0).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
});

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Info', icon: FiFileText },
    { id: 2, title: 'Date & Time', icon: FiCalendar },
    { id: 3, title: 'Location', icon: FiMapPin },
    { id: 4, title: 'Details', icon: GiSoccerBall },
  ];

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      event_type: 'pickup_game',
      date: '',
      start_time: '',
      end_time: '',
      location_name: '',
      address: '',
      max_participants: 18,
      skill_level: 'all',
      price: 0,
      description: '',
    },
  });

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'event_type'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['date', 'start_time', 'end_time'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['location_name', 'address'];
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
      // Transform data to match backend expected format
      const eventData = {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        location: {
          name: data.location_name,
          address: data.address,
        },
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        price: data.price,
        max_participants: data.max_participants,
        skill_level: data.skill_level,
      };

      // Import eventsAPI and make the actual API call
      const { eventsAPI } = await import('../api/events');
      await eventsAPI.create(eventData);
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypes = [
    { value: 'pickup_game', label: 'Pickup Game', description: 'Casual game open to all' },
    { value: 'tournament', label: 'Tournament', description: 'Competitive tournament' },
    { value: 'training', label: 'Training', description: 'Practice or training session' },
    { value: 'tryout', label: 'Tryout', description: 'Team tryouts' },
    { value: 'social', label: 'Social', description: 'Social gathering' },
    { value: 'other', label: 'Other', description: 'Other type of event' },
  ];

  const skillLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-4 transition-colors"
        >
          <FiArrowLeft />
          Back
        </button>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Create <span className="gradient-text">Event</span>
        </h1>
        <p className="text-dark-400">
          Organize a game and invite players from the community.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold
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
                {currentStep > step.id ? <FiCheck size={20} /> : <step.icon size={20} />}
              </div>
              <p className={`mt-2 text-xs font-medium hidden sm:block ${
                currentStep >= step.id ? 'text-white' : 'text-dark-400'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-primary-500' : 'bg-dark-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Event Title
                </label>
                <Input
                  placeholder="e.g., Saturday Morning Pickup"
                  error={errors.title?.message}
                  {...register('title')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-4">
                  Event Type
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {eventTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`
                        relative flex items-start p-4 rounded-xl border cursor-pointer
                        transition-all duration-200
                        ${
                          watch('event_type') === type.value
                            ? 'bg-primary-500/10 border-primary-500'
                            : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value={type.value}
                        className="sr-only"
                        {...register('event_type')}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{type.label}</p>
                        <p className="text-sm text-dark-400">{type.description}</p>
                      </div>
                      {watch('event_type') === type.value && (
                        <FiCheck className="w-5 h-5 text-primary-400" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  leftIcon={<FiCalendar size={18} />}
                  error={errors.date?.message}
                  {...register('date')}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    leftIcon={<FiClock size={18} />}
                    error={errors.start_time?.message}
                    {...register('start_time')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    End Time
                  </label>
                  <Input
                    type="time"
                    leftIcon={<FiClock size={18} />}
                    error={errors.end_time?.message}
                    {...register('end_time')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Venue Name
                </label>
                <Input
                  placeholder="e.g., High Park Soccer Field"
                  leftIcon={<FiMapPin size={18} />}
                  error={errors.location_name?.message}
                  {...register('location_name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Full Address
                </label>
                <Input
                  placeholder="e.g., 1873 Bloor St W, Toronto, ON"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>

              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <p className="text-sm text-dark-300">
                  <span className="text-primary-400 font-medium">Tip:</span> Be specific with the
                  address so players can easily find the location. Include any helpful landmarks
                  or parking information.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Max Players
                  </label>
                  <Input
                    type="number"
                    leftIcon={<FiUsers size={18} />}
                    error={errors.max_participants?.message}
                    {...register('max_participants', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Price (CAD)
                  </label>
                  <Input
                    type="number"
                    leftIcon={<FiDollarSign size={18} />}
                    placeholder="0 for free"
                    error={errors.price?.message}
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-4">
                  Skill Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {skillLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`
                        flex items-center justify-center p-3 rounded-xl border cursor-pointer
                        transition-all duration-200 text-center
                        ${
                          watch('skill_level') === level.value
                            ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                            : 'bg-dark-800/50 border-dark-700 text-dark-300 hover:border-dark-600'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value={level.value}
                        className="sr-only"
                        {...register('skill_level')}
                      />
                      {level.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Description
                </label>
                <textarea
                  className="input min-h-[150px] resize-none"
                  placeholder="Tell players what to expect. Include any rules, what to bring, parking info, etc."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
              <FiArrowLeft />
              Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button type="button" variant="primary" onClick={handleNext} className="flex-1">
              Continue
              <FiArrowRight />
            </Button>
          ) : (
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
              <FiCheck />
              Create Event
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
