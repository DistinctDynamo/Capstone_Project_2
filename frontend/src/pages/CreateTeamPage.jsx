import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiArrowLeft,
  FiUpload,
  FiCalendar,
  FiClock,
} from 'react-icons/fi';
import { GiWhistle } from 'react-icons/gi';
import { Card, Button, Input } from '../components/common';

const teamSchema = z.object({
  team_name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name must be at most 50 characters'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'competitive', '']).optional(),
  location: z.string().optional(),
  home_field: z.string().optional(),
  practice_schedule: z.string().optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  recruiting: z.boolean().optional(),
});

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState(null);

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced players' },
    { value: 'competitive', label: 'Competitive', description: 'Serious, league-level play' },
  ];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team_name: '',
      skill_level: 'intermediate',
      location: '',
      home_field: '',
      practice_schedule: '',
      description: '',
      recruiting: true,
    },
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Import teamsAPI and make the actual API call
      const { teamsAPI } = await import('../api/teams');
      await teamsAPI.create(data);
      toast.success('Team created successfully!');
      navigate('/teams');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Create <span className="gradient-text">Team</span>
        </h1>
        <p className="text-dark-400">
          Start your own team and recruit players from the community.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Logo & Name */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Team Identity</h2>
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center overflow-hidden">
                {logo ? (
                  <img src={logo.preview} alt="Team logo" className="w-full h-full object-cover" />
                ) : (
                  <GiWhistle className="w-12 h-12 text-white" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center cursor-pointer hover:bg-primary-400 transition-colors">
                <FiUpload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            <div className="flex-1">
              <Input
                label="Team Name"
                placeholder="e.g., FC Downtown"
                error={errors.team_name?.message}
                {...register('team_name')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-4">
              Skill Level
            </label>
            <div className="grid sm:grid-cols-4 gap-4">
              {levels.map((level) => (
                <label
                  key={level.value}
                  className={`
                    relative flex flex-col p-4 rounded-xl border cursor-pointer text-center
                    transition-all duration-200
                    ${
                      watch('skill_level') === level.value
                        ? 'bg-primary-500/10 border-primary-500'
                        : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={level.value}
                    className="sr-only"
                    {...register('skill_level')}
                  />
                  <p className="font-medium text-white mb-1">{level.label}</p>
                  <p className="text-xs text-dark-400">{level.description}</p>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Location & Schedule */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Location & Schedule</h2>
          <div className="space-y-6">
            <Input
              label="Area"
              placeholder="e.g., Downtown Toronto"
              leftIcon={<FiMapPin size={18} />}
              error={errors.location?.message}
              {...register('location')}
            />
            <Input
              label="Home Field (Optional)"
              placeholder="e.g., Varsity Stadium"
              leftIcon={<FiMapPin size={18} />}
              {...register('home_field')}
            />
            <Input
              label="Practice Schedule (Optional)"
              placeholder="e.g., Tue & Thu, 7-9 PM"
              leftIcon={<FiCalendar size={18} />}
              {...register('practice_schedule')}
            />
          </div>
        </Card>

        {/* Description */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">About Your Team</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Description
              </label>
              <textarea
                className="input min-h-[150px] resize-none"
                placeholder="Tell potential players about your team. Include your goals, practice expectations, and what makes your team special."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                {...register('recruiting')}
              />
              <div>
                <p className="font-medium text-white">Open for recruitment</p>
                <p className="text-sm text-dark-400">Allow players to request to join your team</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Create Team
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamPage;
