import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiShield,
  FiMoreVertical,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Loading, Modal, Button, Input, Avatar } from '../../components/common';
import { adminAPI } from '../../api';

const AdminUsersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: '', user_type: '', is_active: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (filters.user_type) params.user_type = filters.user_type;
      if (filters.is_active !== '') params.is_active = filters.is_active;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.users || []);
      setPagination(response.data.data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.user_type, filters.is_active]);

  const handlePageChange = (newPage) => newPage >= 1 && newPage <= pagination.pages && fetchUsers(newPage);

  const handleToggleBan = async (user) => {
    setActionLoading(true);
    try {
      const response = await adminAPI.toggleUserBan(user._id);
      const updatedUser = response.data.data.user;
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, is_active: updatedUser.is_active } : u));
      toast.success(updatedUser.is_active ? 'User unbanned' : 'User banned');
      setOpenMenuId(null);
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!newRole || !selectedUser) return;
    setActionLoading(true);
    try {
      await adminAPI.updateUserRole(selectedUser._id, newRole);
      setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, user_type: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
      setRoleModalOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (user) => { setSelectedUser(user); setNewRole(user.user_type); setRoleModalOpen(true); setOpenMenuId(null); };
  const openDetailModal = (user) => { setSelectedUser(user); setDetailModalOpen(true); setOpenMenuId(null); };

  const filteredUsers = users.filter((user) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower);
  });

  const userCounts = {
    all: users.length,
    players: users.filter(u => u.user_type === 'player').length,
    organizers: users.filter(u => u.user_type === 'organizer').length,
    admins: users.filter(u => u.user_type === 'admin').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Page Header */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">User Directory</h1>
                <p className="text-[#64748b] text-sm">{pagination.total} registered users</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <StatBadge label="Players" value={userCounts.players} color="#22c55e" />
              <StatBadge label="Organizers" value={userCounts.organizers} color="#a855f7" />
              <StatBadge label="Admins" value={userCounts.admins} color="#dc2626" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm placeholder:text-[#4a5568] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <select
                value={filters.user_type}
                onChange={(e) => setFilters(prev => ({ ...prev, user_type: e.target.value }))}
                className="px-3 py-2.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="">All Roles</option>
                <option value="player">Players</option>
                <option value="organizer">Organizers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filters.is_active}
                onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                className="px-3 py-2.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredUsers.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a2332] flex items-center justify-center">
              <FiUsers className="w-8 h-8 text-[#4a5568]" />
            </div>
            <p className="text-[#64748b]">No users found</p>
            <p className="text-[#4a5568] text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, idx) => (
              <UserRow
                key={user._id}
                user={user}
                index={idx}
                isMenuOpen={openMenuId === user._id}
                onToggleMenu={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                onCloseMenu={() => setOpenMenuId(null)}
                onView={() => openDetailModal(user)}
                onChangeRole={() => openRoleModal(user)}
                onToggleBan={() => handleToggleBan(user)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1c2430]">
            <p className="text-[#64748b] text-sm">
              Showing <span className="text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="text-white">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded bg-[#141c28] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#94a3b8] px-3">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded bg-[#141c28] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedUser(null); }} title="User Profile" size="lg">
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-[#1c2430]">
              <Avatar src={selectedUser.profile_image} name={`${selectedUser.first_name} ${selectedUser.last_name}`} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser.first_name} {selectedUser.last_name}</h3>
                <p className="text-[#64748b] text-sm">@{selectedUser.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <RoleBadge role={selectedUser.user_type} />
                  <StatusBadge isActive={selectedUser.is_active} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoBlock icon={FiMail} label="Email" value={selectedUser.email} />
              <InfoBlock icon={FiPhone} label="Phone" value={selectedUser.phone || 'Not provided'} />
              <InfoBlock icon={GiSoccerBall} label="Team" value={selectedUser.team?.team_name || 'No team'} />
              <InfoBlock icon={FiMapPin} label="Position" value={selectedUser.position || 'Not specified'} capitalize />
              <InfoBlock icon={FiShield} label="Skill Level" value={selectedUser.skill_level || 'Not specified'} capitalize />
              <InfoBlock icon={FiCalendar} label="Joined" value={new Date(selectedUser.created_at).toLocaleDateString()} />
            </div>

            {selectedUser.bio && (
              <div className="pt-4 border-t border-[#1c2430]">
                <p className="text-[#64748b] text-xs uppercase tracking-wide mb-2">Bio</p>
                <p className="text-[#94a3b8] text-sm">{selectedUser.bio}</p>
              </div>
            )}
          </div>
        )}
        <Modal.Actions><Button variant="ghost" onClick={() => { setDetailModalOpen(false); setSelectedUser(null); }}>Close</Button></Modal.Actions>
      </Modal>

      {/* Role Change Modal */}
      <Modal isOpen={roleModalOpen} onClose={() => { setRoleModalOpen(false); setSelectedUser(null); setNewRole(''); }} title="Change User Role" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#141c28] rounded-lg">
              <Avatar src={selectedUser.profile_image} name={`${selectedUser.first_name} ${selectedUser.last_name}`} size="sm" />
              <div>
                <p className="text-white font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                <p className="text-[#64748b] text-xs">Current role: <span className="capitalize">{selectedUser.user_type}</span></p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#64748b] uppercase tracking-wide mb-2">New Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6]">
                <option value="player">Player</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        )}
        <Modal.Actions>
          <Button variant="ghost" onClick={() => { setRoleModalOpen(false); setSelectedUser(null); setNewRole(''); }}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateRole} isLoading={actionLoading}>Update Role</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

// === HELPER COMPONENTS ===

const StatBadge = ({ label, value, color }) => (
  <div className="text-center">
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    <p className="text-[#4a5568] text-xs uppercase tracking-wide">{label}</p>
  </div>
);

const UserRow = ({ user, index, isMenuOpen, onToggleMenu, onCloseMenu, onView, onChangeRole, onToggleBan, actionLoading }) => (
  <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
    index % 2 === 0 ? 'bg-[#0d1219]' : 'bg-[#0f1520]'
  } border-[#1c2430] hover:border-[#2a3a4d]`}>
    {/* User Avatar & Info */}
    <Avatar src={user.profile_image} name={`${user.first_name} ${user.last_name}`} size="sm" />

    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-center">
      {/* Name */}
      <div className="md:col-span-1">
        <p className="text-white font-medium truncate">{user.first_name} {user.last_name}</p>
        <p className="text-[#4a5568] text-xs truncate">@{user.username}</p>
      </div>

      {/* Email */}
      <div className="hidden md:block md:col-span-1">
        <p className="text-[#94a3b8] text-sm truncate">{user.email}</p>
      </div>

      {/* Role */}
      <div className="hidden md:block">
        <RoleBadge role={user.user_type} />
      </div>

      {/* Team */}
      <div className="hidden md:block">
        {user.team ? (
          <Link to={`/teams/${user.team._id}`} className="text-[#3b82f6] hover:text-[#60a5fa] text-sm truncate">
            {user.team.team_name}
          </Link>
        ) : (
          <span className="text-[#4a5568] text-sm">No team</span>
        )}
      </div>

      {/* Status */}
      <div className="hidden md:block">
        <StatusBadge isActive={user.is_active} />
      </div>
    </div>

    {/* Actions */}
    <div className="relative flex-shrink-0">
      <button
        onClick={onToggleMenu}
        className="p-2 rounded-lg text-[#64748b] hover:text-white hover:bg-[#1c2430] transition-colors"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
          <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-[#141c28] border border-[#2a3a4d] rounded-lg shadow-xl overflow-hidden">
            <button onClick={onView} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#94a3b8] hover:bg-[#1c2430] hover:text-white transition-colors">
              <FiEye className="w-4 h-4" /> View Profile
            </button>
            <button onClick={onChangeRole} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#94a3b8] hover:bg-[#1c2430] hover:text-white transition-colors">
              <FiShield className="w-4 h-4" /> Change Role
            </button>
            <button
              onClick={onToggleBan}
              disabled={actionLoading}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors disabled:opacity-50 ${
                user.is_active
                  ? 'text-[#dc2626] hover:bg-[#dc2626]/10'
                  : 'text-[#22c55e] hover:bg-[#22c55e]/10'
              }`}
            >
              {user.is_active ? (
                <><FiUserX className="w-4 h-4" /> Suspend User</>
              ) : (
                <><FiUserCheck className="w-4 h-4" /> Unsuspend User</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20',
    organizer: 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20',
    player: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${styles[role] || styles.player}`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
    isActive
      ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20'
      : 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'
  }`}>
    {isActive ? 'Active' : 'Suspended'}
  </span>
);

const InfoBlock = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-start gap-3 p-3 bg-[#141c28] rounded-lg">
    <div className="w-8 h-8 bg-[#1c2430] rounded flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-[#3b82f6]" />
    </div>
    <div className="min-w-0">
      <p className="text-[#4a5568] text-[10px] uppercase tracking-wide">{label}</p>
      <p className={`text-white text-sm truncate ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  </div>
);

export default AdminUsersPage;
