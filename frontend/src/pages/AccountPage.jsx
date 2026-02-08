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
  FiCheck,
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';

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

// Stadium Control Room Components
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#2a3a4d] last:border-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-[#64748b]" />}
      <span className="text-xs uppercase tracking-wider text-[#64748b]">{label}</span>
    </div>
    <div className="text-white">{children}</div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
      checked ? 'bg-[#22c55e]' : 'bg-[#2a3a4d]'
    }`}
  >
    <div
      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
    {checked && (
      <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#22c55e] animate-ping opacity-50" />
    )}
  </button>
);

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-wider text-[#64748b]">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
      )}
      <input
        className={`w-full bg-[#0d1219] border ${error ? 'border-[#ef4444]' : 'border-[#2a3a4d]'} rounded-lg ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-[#ef4444]">{error}</p>}
  </div>
);

const AccountPage = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    gameReminders: true,
    newMessages: true,
    teamUpdates: true,
    eventInvitations: true,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showEmail: false,
    showLocation: true,
    allowInvitations: true,
    showInSearch: true,
  });

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
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight">ACCOUNT SETTINGS</h1>
          </div>
          <p className="text-[#64748b] text-sm">
            Manage your profile, security, and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1c2430]">
                <p className="text-xs uppercase tracking-wider text-[#64748b]">Navigation</p>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/30'
                        : 'text-[#94a3b8] hover:bg-[#141c28] hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#22c55e]" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'profile' && (
              <>
                {/* Profile Photo Section */}
                <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-[#64748b]">Profile Photo</p>
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-xl bg-[#141c28] border-2 border-[#2a3a4d] overflow-hidden">
                          {user?.avatar || user?.profileImage ? (
                            <img
                              src={user.avatar || user.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl font-bold text-[#4ade80]">
                                {user?.first_name?.[0] || user?.username?.[0] || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22c55e]/25">
                          <FiCamera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{user?.first_name} {user?.last_name}</h3>
                        <p className="text-sm text-[#64748b] mb-4 font-mono">@{user?.username}</p>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-sm text-white hover:bg-[#1c2430] transition-colors">
                            Upload Photo
                          </button>
                          <button className="px-4 py-2 bg-transparent border border-[#2a3a4d] rounded-lg text-sm text-[#64748b] hover:text-[#ef4444] hover:border-[#ef4444]/30 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-[#64748b]">Personal Information</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#64748b]">EDITABLE</span>
                      <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    </div>
                  </div>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <InputField
                        label="First Name"
                        icon={FiUser}
                        error={profileErrors.first_name?.message}
                        {...registerProfile('first_name')}
                      />
                      <InputField
                        label="Last Name"
                        icon={FiUser}
                        error={profileErrors.last_name?.message}
                        {...registerProfile('last_name')}
                      />
                    </div>
                    <InputField
                      label="Username"
                      icon={FiUser}
                      error={profileErrors.username?.message}
                      {...registerProfile('username')}
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                      <InputField
                        label="Email Address"
                        type="email"
                        icon={FiMail}
                        error={profileErrors.email?.message}
                        {...registerProfile('email')}
                      />
                      <InputField
                        label="Phone Number"
                        type="tel"
                        icon={FiPhone}
                        error={profileErrors.phone?.message}
                        {...registerProfile('phone')}
                      />
                    </div>
                    <InputField
                      label="Location"
                      icon={FiMapPin}
                      error={profileErrors.location?.message}
                      {...registerProfile('location')}
                    />
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-[#64748b]">Bio</label>
                      <textarea
                        className="w-full bg-[#0d1219] border border-[#2a3a4d] rounded-lg px-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors min-h-[120px] resize-none"
                        placeholder="Tell other players about yourself..."
                        {...registerProfile('bio')}
                      />
                      {profileErrors.bio && (
                        <p className="text-xs text-[#ef4444]">{profileErrors.bio.message}</p>
                      )}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-[#1c2430]">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#22c55e]/25"
                      >
                        {isUpdatingProfile ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                {/* Change Password */}
                <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-[#64748b]">Change Password</p>
                    <FiShield className="w-4 h-4 text-[#22c55e]" />
                  </div>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-6">
                    <InputField
                      label="Current Password"
                      type="password"
                      icon={FiLock}
                      error={passwordErrors.currentPassword?.message}
                      {...registerPassword('currentPassword')}
                    />
                    <InputField
                      label="New Password"
                      type="password"
                      icon={FiLock}
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword')}
                    />
                    <InputField
                      label="Confirm New Password"
                      type="password"
                      icon={FiLock}
                      error={passwordErrors.confirmPassword?.message}
                      {...registerPassword('confirmPassword')}
                    />
                    <div className="flex justify-end pt-4 border-t border-[#1c2430]">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#22c55e]/25"
                      >
                        {isUpdatingPassword ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiLock className="w-4 h-4" />
                        )}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-[#0d1219] border border-[#ef4444]/30 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#ef4444]/30 flex items-center justify-between bg-[#ef4444]/5">
                    <p className="text-xs uppercase tracking-wider text-[#ef4444]">Danger Zone</p>
                    <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  </div>
                  <div className="p-6">
                    <p className="text-[#94a3b8] mb-6">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] rounded-lg font-medium hover:bg-[#ef4444]/20 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-[#64748b]">Notification Preferences</p>
                  <FiBell className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'gameReminders', label: 'Game reminders', description: 'Get notified before your scheduled games' },
                    { key: 'newMessages', label: 'New messages', description: 'Receive notifications for new messages' },
                    { key: 'teamUpdates', label: 'Team updates', description: 'Get updates about your teams' },
                    { key: 'eventInvitations', label: 'Event invitations', description: 'Receive notifications for new event invitations' },
                    { key: 'marketing', label: 'Marketing emails', description: 'Receive news and updates from SoccerConnect' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-4 px-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]"
                    >
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-[#64748b]">{item.description}</p>
                      </div>
                      <ToggleSwitch
                        checked={notifications[item.key]}
                        onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-[#64748b]">Privacy Settings</p>
                  <FiEye className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'showProfile', label: 'Show profile to public', description: 'Allow anyone to view your profile' },
                    { key: 'showEmail', label: 'Show email address', description: 'Display your email on your profile' },
                    { key: 'showLocation', label: 'Show location', description: 'Display your location on your profile' },
                    { key: 'allowInvitations', label: 'Allow team invitations', description: 'Let team captains send you invitations' },
                    { key: 'showInSearch', label: 'Show in player search', description: 'Appear in search results for players' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-4 px-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]"
                    >
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-[#64748b]">{item.description}</p>
                      </div>
                      <ToggleSwitch
                        checked={privacy[item.key]}
                        onChange={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
