import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiCalendar,
  FiShield,
  FiSlash,
  FiMoreVertical,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Card, Badge, Loading, Modal, Button, Input, Avatar, EmptyState } from '../../components/common';
import { adminAPI } from '../../api';

const AdminUsersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    user_type: '',
    is_active: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
      };

      if (filters.user_type) params.user_type = filters.user_type;
      if (filters.is_active !== '') params.is_active = filters.is_active;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.users || []);
      setPagination(response.data.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.user_type, filters.is_active]);

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchUsers(newPage);
    }
  };

  const handleToggleBan = async (user) => {
    setActionLoading(true);
    try {
      const response = await adminAPI.toggleUserBan(user._id);
      const updatedUser = response.data.data.user;
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, is_active: updatedUser.is_active } : u
        )
      );
      toast.success(updatedUser.is_active ? 'User unbanned' : 'User banned');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error toggling user ban:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!newRole || !selectedUser) return;

    setActionLoading(true);
    try {
      await adminAPI.updateUserRole(selectedUser._id, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, user_type: newRole } : u
        )
      );
      toast.success(`User role updated to ${newRole}`);
      setRoleModalOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.user_type);
    setRoleModalOpen(true);
    setOpenMenuId(null);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const filteredUsers = users.filter((user) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'organizer':
        return 'accent';
      default:
        return 'primary';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          User Management
        </h1>
        <p className="text-dark-400">
          View and manage all users on the platform
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, username, or email..."
              value={filters.search}
              onChange={handleSearch}
              leftIcon={<FiSearch className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filters.user_type}
              onChange={(e) => handleFilterChange('user_type', e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="">All Roles</option>
              <option value="player">Player</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange('is_active', e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Banned</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loading size="lg" text="Loading users..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No users found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-300">
                      User
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-300">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-300">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-300">
                      Team
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-300">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-300">
                      Joined
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.profile_image}
                            name={`${user.first_name} ${user.last_name}`}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-dark-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-300">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleBadgeVariant(user.user_type)} size="sm">
                          {user.user_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.team ? (
                          <Link
                            to={`/teams/${user.team._id}`}
                            className="text-primary-400 hover:text-primary-300"
                          >
                            {user.team.team_name}
                          </Link>
                        ) : (
                          <span className="text-dark-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={user.is_active ? 'success' : 'danger'}
                          size="sm"
                          dot
                        >
                          {user.is_active ? 'Active' : 'Banned'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === user._id ? null : user._id)
                            }
                            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === user._id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 py-2 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-20">
                                <button
                                  onClick={() => openDetailModal(user)}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                                >
                                  <FiEye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => openRoleModal(user)}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                                >
                                  <FiShield className="w-4 h-4" />
                                  Change Role
                                </button>
                                <button
                                  onClick={() => handleToggleBan(user)}
                                  disabled={actionLoading}
                                  className={`flex items-center gap-3 w-full px-4 py-2.5 transition-colors ${
                                    user.is_active
                                      ? 'text-red-400 hover:text-red-300 hover:bg-dark-700'
                                      : 'text-green-400 hover:text-green-300 hover:bg-dark-700'
                                  }`}
                                >
                                  {user.is_active ? (
                                    <>
                                      <FiUserX className="w-4 h-4" />
                                      Suspend User
                                    </>
                                  ) : (
                                    <>
                                      <FiUserCheck className="w-4 h-4" />
                                      Unsuspend User
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-dark-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  leftIcon={<FiChevronLeft />}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'text-dark-300 hover:text-white hover:bg-dark-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  rightIcon={<FiChevronRight />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={selectedUser.profile_image}
                name={`${selectedUser.first_name} ${selectedUser.last_name}`}
                size="lg"
              />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <p className="text-dark-400">@{selectedUser.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getRoleBadgeVariant(selectedUser.user_type)} size="sm">
                    {selectedUser.user_type}
                  </Badge>
                  <Badge
                    variant={selectedUser.is_active ? 'success' : 'danger'}
                    size="sm"
                    dot
                  >
                    {selectedUser.is_active ? 'Active' : 'Banned'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-400">Email</label>
                <p className="text-white mt-1">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Phone</label>
                <p className="text-white mt-1">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Team</label>
                <p className="text-white mt-1">
                  {selectedUser.team?.team_name || 'No team'}
                </p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Position</label>
                <p className="text-white mt-1 capitalize">
                  {selectedUser.position || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Skill Level</label>
                <p className="text-white mt-1 capitalize">
                  {selectedUser.skill_level || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Joined</label>
                <p className="text-white mt-1">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedUser.bio && (
              <div>
                <label className="text-sm text-dark-400">Bio</label>
                <p className="text-white mt-1">{selectedUser.bio}</p>
              </div>
            )}
          </div>
        )}
        <Modal.Actions>
          <Button
            variant="ghost"
            onClick={() => {
              setDetailModalOpen(false);
              setSelectedUser(null);
            }}
          >
            Close
          </Button>
        </Modal.Actions>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
          setNewRole('');
        }}
        title="Change User Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-dark-300">
              Update the role for{' '}
              <span className="text-white font-medium">
                {selectedUser.first_name} {selectedUser.last_name}
              </span>
            </p>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="input w-full"
              >
                <option value="player">Player</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        )}
        <Modal.Actions>
          <Button
            variant="ghost"
            onClick={() => {
              setRoleModalOpen(false);
              setSelectedUser(null);
              setNewRole('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateRole}
            isLoading={actionLoading}
          >
            Update Role
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
