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
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';

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

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-wider text-[#64748b]">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
      )}
      <input
        className={`w-full bg-[#141c28] border ${error ? 'border-[#ef4444]' : 'border-[#2a3a4d]'} rounded-lg ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-[#ef4444]">{error}</p>}
  </div>
);

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Date & Time' },
    { id: 3, title: 'Location' },
    { id: 4, title: 'Details' },
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
    if (currentStep === 1) fieldsToValidate = ['title', 'event_type'];
    else if (currentStep === 2) fieldsToValidate = ['date', 'start_time', 'end_time'];
    else if (currentStep === 3) fieldsToValidate = ['location_name', 'address'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        location: { name: data.location_name, address: data.address },
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        price: data.price,
        max_participants: data.max_participants,
        skill_level: data.skill_level,
      };

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
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CREATE EVENT</h1>
          </div>
          <p className="text-[#64748b] text-sm">Organize a game and invite players from the community</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep > step.id
                        ? 'bg-[#22c55e] text-white'
                        : currentStep === step.id
                        ? 'bg-[#a855f7]/20 text-[#c084fc] border-2 border-[#a855f7]'
                        : 'bg-[#141c28] text-[#64748b] border border-[#2a3a4d]'
                    }`}
                  >
                    {currentStep > step.id ? <FiCheck className="w-5 h-5" /> : step.id}
                  </div>
                  <p className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-white' : 'text-[#64748b]'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-[#22c55e]' : 'bg-[#2a3a4d]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Step {currentStep} of 4</span>
              <span className="text-xs text-[#a855f7] uppercase tracking-wider">{steps[currentStep - 1].title}</span>
            </div>

            <div className="p-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <InputField
                    label="Event Title"
                    placeholder="e.g., Saturday Morning Pickup"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-4">Event Type</label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {eventTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            watch('event_type') === type.value
                              ? 'bg-[#a855f7]/10 border-[#a855f7]/50'
                              : 'bg-[#141c28] border-[#2a3a4d] hover:border-[#3a4a5d]'
                          }`}
                        >
                          <input
                            type="radio"
                            value={type.value}
                            className="sr-only"
                            {...register('event_type')}
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            watch('event_type') === type.value
                              ? 'border-[#a855f7] bg-[#a855f7]'
                              : 'border-[#2a3a4d]'
                          }`}>
                            {watch('event_type') === type.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${watch('event_type') === type.value ? 'text-[#c084fc]' : 'text-white'}`}>
                              {type.label}
                            </p>
                            <p className="text-xs text-[#64748b]">{type.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <InputField
                    label="Date"
                    type="date"
                    icon={FiCalendar}
                    error={errors.date?.message}
                    {...register('date')}
                  />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <InputField
                      label="Start Time"
                      type="time"
                      icon={FiClock}
                      error={errors.start_time?.message}
                      {...register('start_time')}
                    />
                    <InputField
                      label="End Time"
                      type="time"
                      icon={FiClock}
                      error={errors.end_time?.message}
                      {...register('end_time')}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <InputField
                    label="Venue Name"
                    placeholder="e.g., High Park Soccer Field"
                    icon={FiMapPin}
                    error={errors.location_name?.message}
                    {...register('location_name')}
                  />
                  <InputField
                    label="Full Address"
                    placeholder="e.g., 1873 Bloor St W, Toronto, ON"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                  <div className="p-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]">
                    <p className="text-sm text-[#94a3b8]">
                      <span className="text-[#a855f7] font-medium">Tip:</span> Be specific with the address so players can easily find the location.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <InputField
                      label="Max Players"
                      type="number"
                      icon={FiUsers}
                      error={errors.max_participants?.message}
                      {...register('max_participants', { valueAsNumber: true })}
                    />
                    <InputField
                      label="Price (CAD)"
                      type="number"
                      icon={FiDollarSign}
                      placeholder="0 for free"
                      error={errors.price?.message}
                      {...register('price', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-4">Skill Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {skillLevels.map((level) => (
                        <label
                          key={level.value}
                          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer text-center text-sm transition-all ${
                            watch('skill_level') === level.value
                              ? 'bg-[#a855f7]/10 border-[#a855f7]/50 text-[#c084fc]'
                              : 'bg-[#141c28] border-[#2a3a4d] text-[#94a3b8] hover:border-[#3a4a5d]'
                          }`}
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
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#64748b]">Description</label>
                    <textarea
                      className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg px-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors min-h-[150px] resize-none"
                      placeholder="Tell players what to expect. Include any rules, what to bring, parking info, etc."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-xs text-[#ef4444]">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg font-medium hover:bg-[#1c2430] transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#a855f7] text-white rounded-lg font-medium hover:bg-[#9333ea] transition-colors shadow-lg shadow-[#a855f7]/25"
              >
                Continue
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#22c55e]/25"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
