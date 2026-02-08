import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiCamera,
  FiSave,
  FiTrash2,
  FiShield,
  FiBell,
  FiEye,
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { Button, Input, Card, Avatar } from '../components/common';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const AccountPage = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy', icon: FiEye },
  ];

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data) => {
    setIsUpdatingProfile(true);
    try {
      // Import usersAPI and make the actual API call
      const { usersAPI } = await import('../api/users');
      const response = await usersAPI.update(user.id || user._id, data);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsUpdatingPassword(true);
    try {
      // Import authAPI and make the actual API call
      const { authAPI } = await import('../api/auth');
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Account Settings
        </h1>
        <p className="text-dark-400">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-colors
                    ${
                      activeTab === tab.id
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Avatar Section */}
              <Card>
                <h2 className="text-xl font-semibold text-white mb-6">Profile Photo</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar src={user?.avatar || user?.profileImage} name={`${user?.first_name || ''} ${user?.last_name || ''}`} size="xl" />
                    <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-400 transition-colors">
                      <FiCamera className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">{user?.first_name} {user?.last_name}</h3>
                    <p className="text-sm text-dark-400 mb-4">@{user?.username}</p>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        Upload Photo
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Profile Form */}
              <Card>
                <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      leftIcon={<FiUser size={18} />}
                      error={profileErrors.first_name?.message}
                      {...registerProfile('first_name')}
                    />
                    <Input
                      label="Last Name"
                      leftIcon={<FiUser size={18} />}
                      error={profileErrors.last_name?.message}
                      {...registerProfile('last_name')}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="Username"
                      leftIcon={<FiUser size={18} />}
                      error={profileErrors.username?.message}
                      {...registerProfile('username')}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Input
                      label="Email Address"
                      type="email"
                      leftIcon={<FiMail size={18} />}
                      error={profileErrors.email?.message}
                      {...registerProfile('email')}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      leftIcon={<FiPhone size={18} />}
                      error={profileErrors.phone?.message}
                      {...registerProfile('phone')}
                    />
                  </div>
                  <Input
                    label="Location"
                    leftIcon={<FiMapPin size={18} />}
                    error={profileErrors.location?.message}
                    {...registerProfile('location')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Bio
                    </label>
                    <textarea
                      className="input min-h-[120px] resize-none"
                      placeholder="Tell other players about yourself..."
                      {...registerProfile('bio')}
                    />
                    {profileErrors.bio && (
                      <p className="mt-2 text-sm text-red-400">{profileErrors.bio.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isUpdatingProfile} leftIcon={<FiSave />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <Card>
                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    leftIcon={<FiLock size={18} />}
                    error={passwordErrors.currentPassword?.message}
                    {...registerPassword('currentPassword')}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    leftIcon={<FiLock size={18} />}
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword')}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    leftIcon={<FiLock size={18} />}
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword('confirmPassword')}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isUpdatingPassword} leftIcon={<FiLock />}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-500/30">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                <p className="text-dark-400 mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="danger" leftIcon={<FiTrash2 />}>
                  Delete Account
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { label: 'Game reminders', description: 'Get notified before your scheduled games' },
                  { label: 'New messages', description: 'Receive notifications for new messages' },
                  { label: 'Team updates', description: 'Get updates about your teams' },
                  { label: 'Event invitations', description: 'Receive notifications for new event invitations' },
                  { label: 'Marketing emails', description: 'Receive news and updates from SoccerConnect' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-dark-700 last:border-0">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-dark-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={index < 4} />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <h2 className="text-xl font-semibold text-white mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                {[
                  { label: 'Show profile to public', description: 'Allow anyone to view your profile' },
                  { label: 'Show email address', description: 'Display your email on your profile' },
                  { label: 'Show location', description: 'Display your location on your profile' },
                  { label: 'Allow team invitations', description: 'Let team captains send you invitations' },
                  { label: 'Show in player search', description: 'Appear in search results for players' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-dark-700 last:border-0">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-dark-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={index !== 1} />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
