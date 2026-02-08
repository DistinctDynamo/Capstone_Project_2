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
  FiCheck,
} from 'react-icons/fi';
import { GiWhistle } from 'react-icons/gi';

const teamSchema = z.object({
  team_name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name must be at most 50 characters'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'competitive', '']).optional(),
  location: z.string().optional(),
  home_field: z.string().optional(),
  practice_schedule: z.string().optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  recruiting: z.boolean().optional(),
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

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState(null);

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced players' },
    { value: 'competitive', label: 'Competitive', description: 'League-level play' },
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
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CREATE TEAM</h1>
          </div>
          <p className="text-[#64748b] text-sm">Start your own team and recruit players from the community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Team Identity */}
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Team Identity</span>
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 border-2 border-[#22c55e]/30 flex items-center justify-center overflow-hidden">
                    {logo ? (
                      <img src={logo.preview} alt="Team logo" className="w-full h-full object-cover" />
                    ) : (
                      <GiWhistle className="w-12 h-12 text-[#4ade80]" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center cursor-pointer hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22c55e]/25">
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
                  <InputField
                    label="Team Name"
                    placeholder="e.g., FC Downtown"
                    error={errors.team_name?.message}
                    {...register('team_name')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-4">Skill Level</label>
                <div className="grid sm:grid-cols-4 gap-3">
                  {levels.map((level) => (
                    <label
                      key={level.value}
                      className={`relative flex flex-col p-4 rounded-lg border cursor-pointer text-center transition-all ${
                        watch('skill_level') === level.value
                          ? 'bg-[#22c55e]/10 border-[#22c55e]/50'
                          : 'bg-[#141c28] border-[#2a3a4d] hover:border-[#3a4a5d]'
                      }`}
                    >
                      <input
                        type="radio"
                        value={level.value}
                        className="sr-only"
                        {...register('skill_level')}
                      />
                      {watch('skill_level') === level.value && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#22c55e]" />
                      )}
                      <p className={`font-medium mb-1 ${watch('skill_level') === level.value ? 'text-[#4ade80]' : 'text-white'}`}>
                        {level.label}
                      </p>
                      <p className="text-xs text-[#64748b]">{level.description}</p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Schedule */}
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430]">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Location & Schedule</span>
            </div>
            <div className="p-6 space-y-6">
              <InputField
                label="Area"
                placeholder="e.g., Downtown Toronto"
                icon={FiMapPin}
                error={errors.location?.message}
                {...register('location')}
              />
              <InputField
                label="Home Field (Optional)"
                placeholder="e.g., Varsity Stadium"
                icon={FiMapPin}
                {...register('home_field')}
              />
              <InputField
                label="Practice Schedule (Optional)"
                placeholder="e.g., Tue & Thu, 7-9 PM"
                icon={FiCalendar}
                {...register('practice_schedule')}
              />
            </div>
          </div>

          {/* About */}
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430]">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">About Your Team</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#64748b]">Description</label>
                <textarea
                  className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg px-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors min-h-[150px] resize-none"
                  placeholder="Tell potential players about your team. Include your goals, practice expectations, and what makes your team special."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-[#ef4444]">{errors.description.message}</p>
                )}
              </div>

              <label className="flex items-center gap-4 p-4 bg-[#141c28] rounded-lg border border-[#2a3a4d] cursor-pointer hover:border-[#3a4a5d] transition-colors">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  watch('recruiting')
                    ? 'bg-[#22c55e] border-[#22c55e]'
                    : 'border-[#2a3a4d]'
                }`}>
                  {watch('recruiting') && <FiCheck className="w-4 h-4 text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  {...register('recruiting')}
                />
                <div>
                  <p className="font-medium text-white">Open for recruitment</p>
                  <p className="text-sm text-[#64748b]">Allow players to request to join your team</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg font-medium hover:bg-[#1c2430] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#22c55e]/25"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <GiWhistle className="w-5 h-5" />
                  Create Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamPage;
