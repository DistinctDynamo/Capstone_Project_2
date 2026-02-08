import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiX,
  FiMapPin,
  FiCalendar,
  FiShield,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { Loading, Modal, Button, Input } from '../../components/common';
import { adminAPI } from '../../api';

const AdminTeamsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: '', approval_status: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchTeams = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (filters.approval_status) params.approval_status = filters.approval_status;
      if (filters.search) params.search = filters.search;

      const response = await adminAPI.getTeams(params);
      setTeams(response.data.data.teams || []);
      setPagination(response.data.data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [filters.approval_status]);

  const handleSearch = (e) => e.key === 'Enter' && fetchTeams();
  const handlePageChange = (newPage) => newPage >= 1 && newPage <= pagination.pages && fetchTeams(newPage);

  const openDetailModal = (team) => { setSelectedTeam(team); setDetailModalOpen(true); setOpenMenuId(null); };
  const openEditModal = (team) => {
    setSelectedTeam(team);
    setEditForm({
      team_name: team.team_name,
      description: team.description || '',
      skill_level: team.skill_level || 'intermediate',
      max_members: team.max_members || 25,
      is_recruiting: team.is_recruiting !== false,
      approval_status: team.approval_status || 'pending',
    });
    setEditModalOpen(true);
    setOpenMenuId(null);
  };
  const openDeleteModal = (team) => { setSelectedTeam(team); setDeleteModalOpen(true); setOpenMenuId(null); };

  const handleEditSubmit = async () => {
    setActionLoading(true);
    try {
      await adminAPI.updateTeam(selectedTeam._id, editForm);
      setTeams((prev) => prev.map((t) => t._id === selectedTeam._id ? { ...t, ...editForm } : t));
      toast.success('Team updated');
      setEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminAPI.deleteTeam(selectedTeam._id);
      setTeams((prev) => prev.filter((t) => t._id !== selectedTeam._id));
      toast.success('Team deleted');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickApprove = async (team) => {
    try {
      await adminAPI.approveTeam(team._id);
      setTeams((prev) => prev.map((t) => t._id === team._id ? { ...t, approval_status: 'approved' } : t));
      toast.success(`"${team.team_name}" approved`);
    } catch (error) {
      toast.error('Failed to approve');
    }
    setOpenMenuId(null);
  };

  const filteredTeams = teams.filter((team) =>
    team.team_name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const statusCounts = {
    all: teams.length,
    approved: teams.filter(t => t.approval_status === 'approved').length,
    pending: teams.filter(t => t.approval_status === 'pending').length,
    rejected: teams.filter(t => t.approval_status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Page Header */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1a5f2a] rounded-lg flex items-center justify-center">
              <GiSoccerBall className="w-6 h-6 text-[#4ade80]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Team Registry</h1>
              <p className="text-[#64748b] text-sm">{teams.length} teams registered on platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs & Search */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            {/* Status Filter Tabs */}
            <div className="flex gap-1 bg-[#141c28] p-1 rounded-lg">
              {[
                { key: '', label: 'All', count: statusCounts.all },
                { key: 'approved', label: 'Active', count: statusCounts.approved },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilters(prev => ({ ...prev, approval_status: tab.key }))}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors ${
                    filters.approval_status === tab.key
                      ? 'bg-[#1a5f2a] text-[#4ade80]'
                      : 'text-[#64748b] hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 opacity-60">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search teams..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm placeholder:text-[#4a5568] focus:outline-none focus:border-[#4ade80]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredTeams.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a2332] flex items-center justify-center">
              <GiSoccerBall className="w-8 h-8 text-[#4a5568]" />
            </div>
            <p className="text-[#64748b]">No teams found</p>
            <p className="text-[#4a5568] text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team, idx) => (
              <TeamRow
                key={team._id}
                team={team}
                index={idx}
                isMenuOpen={openMenuId === team._id}
                onToggleMenu={() => setOpenMenuId(openMenuId === team._id ? null : team._id)}
                onCloseMenu={() => setOpenMenuId(null)}
                onView={() => openDetailModal(team)}
                onEdit={() => openEditModal(team)}
                onDelete={() => openDeleteModal(team)}
                onApprove={() => handleQuickApprove(team)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1c2430]">
            <p className="text-[#64748b] text-sm">
              Page <span className="text-white font-medium">{pagination.page}</span> of{' '}
              <span className="text-white font-medium">{pagination.pages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded bg-[#141c28] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
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

      {/* Detail Modal */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Team Details" size="lg">
        {selectedTeam && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-[#1c2430]">
              <div className="w-14 h-14 bg-[#1a5f2a] rounded-lg flex items-center justify-center">
                <GiSoccerBall className="w-7 h-7 text-[#4ade80]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedTeam.team_name}</h3>
                <StatusBadge status={selectedTeam.approval_status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoBlock label="Owner" value={`${selectedTeam.owner?.first_name} ${selectedTeam.owner?.last_name}`} icon={FiShield} />
              <InfoBlock label="Email" value={selectedTeam.owner?.email} icon={FiUsers} />
              <InfoBlock label="Members" value={`${selectedTeam.members?.length || 0} / ${selectedTeam.max_members || 25}`} icon={FiUsers} />
              <InfoBlock label="Skill Level" value={selectedTeam.skill_level || 'Any'} icon={GiWhistle} capitalize />
              <InfoBlock label="Location" value={selectedTeam.location || 'Not specified'} icon={FiMapPin} />
              <InfoBlock label="Recruiting" value={selectedTeam.is_recruiting ? 'Yes' : 'No'} icon={FiCheck} />
            </div>

            {selectedTeam.description && (
              <div className="pt-4 border-t border-[#1c2430]">
                <p className="text-[#64748b] text-xs uppercase tracking-wide mb-2">Description</p>
                <p className="text-[#94a3b8] text-sm">{selectedTeam.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-[#1c2430]">
              <p className="text-[#4a5568] text-xs">
                Created on {new Date(selectedTeam.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}
        <Modal.Actions><Button variant="ghost" onClick={() => setDetailModalOpen(false)}>Close</Button></Modal.Actions>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Team" size="md">
        <div className="space-y-4">
          <Input label="Team Name" value={editForm.team_name || ''} onChange={(e) => setEditForm({ ...editForm, team_name: e.target.value })} />
          <div>
            <label className="block text-xs text-[#64748b] uppercase tracking-wide mb-2">Description</label>
            <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm resize-none focus:outline-none focus:border-[#4ade80]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#64748b] uppercase tracking-wide mb-2">Skill Level</label>
              <select className="w-full px-3 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#4ade80]" value={editForm.skill_level || ''} onChange={(e) => setEditForm({ ...editForm, skill_level: e.target.value })}>
                <option value="recreational">Recreational</option>
                <option value="intermediate">Intermediate</option>
                <option value="competitive">Competitive</option>
              </select>
            </div>
            <Input label="Max Members" type="number" value={editForm.max_members || 25} onChange={(e) => setEditForm({ ...editForm, max_members: parseInt(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#64748b] uppercase tracking-wide mb-2">Status</label>
              <select className="w-full px-3 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#4ade80]" value={editForm.approval_status || ''} onChange={(e) => setEditForm({ ...editForm, approval_status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#64748b] uppercase tracking-wide mb-2">Recruiting</label>
              <select className="w-full px-3 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#4ade80]" value={editForm.is_recruiting ? 'yes' : 'no'} onChange={(e) => setEditForm({ ...editForm, is_recruiting: e.target.value === 'yes' })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>
        <Modal.Actions>
          <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleEditSubmit} isLoading={actionLoading}>Save Changes</Button>
        </Modal.Actions>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Team" size="sm">
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="w-7 h-7 text-[#dc2626]" />
          </div>
          <p className="text-[#94a3b8] mb-2">Delete <span className="text-white font-bold">"{selectedTeam?.team_name}"</span>?</p>
          <p className="text-sm text-[#4a5568]">This action cannot be undone.</p>
        </div>
        <Modal.Actions>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={actionLoading}>Delete</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

// === HELPER COMPONENTS ===

const TeamRow = ({ team, index, isMenuOpen, onToggleMenu, onCloseMenu, onView, onEdit, onDelete, onApprove }) => (
  <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
    index % 2 === 0 ? 'bg-[#0d1219]' : 'bg-[#0f1520]'
  } border-[#1c2430] hover:border-[#2a3a4d]`}>
    {/* Team Info */}
    <div className="w-11 h-11 bg-[#1a5f2a]/50 rounded-lg flex items-center justify-center flex-shrink-0">
      <GiSoccerBall className="w-5 h-5 text-[#4ade80]" />
    </div>

    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
      {/* Name & Location */}
      <div className="md:col-span-1">
        <p className="text-white font-medium truncate">{team.team_name}</p>
        <p className="text-[#4a5568] text-xs flex items-center gap-1">
          <FiMapPin className="w-3 h-3" />
          {team.location || 'No location'}
        </p>
      </div>

      {/* Owner */}
      <div className="hidden md:block">
        <p className="text-[#94a3b8] text-sm truncate">{team.owner?.first_name} {team.owner?.last_name}</p>
        <p className="text-[#4a5568] text-xs truncate">{team.owner?.email}</p>
      </div>

      {/* Members */}
      <div className="hidden md:flex items-center gap-1.5 text-[#64748b] text-sm">
        <FiUsers className="w-3.5 h-3.5" />
        {team.members?.length || 0} / {team.max_members || 25}
      </div>

      {/* Status */}
      <div className="hidden md:block">
        <StatusBadge status={team.approval_status} />
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
              <FiEye className="w-4 h-4" /> View Details
            </button>
            <button onClick={onEdit} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#94a3b8] hover:bg-[#1c2430] hover:text-white transition-colors">
              <FiEdit2 className="w-4 h-4" /> Edit Team
            </button>
            {team.approval_status === 'pending' && (
              <button onClick={onApprove} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#22c55e] hover:bg-[#1a5f2a]/20 transition-colors">
                <FiCheck className="w-4 h-4" /> Approve
              </button>
            )}
            <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors">
              <FiTrash2 className="w-4 h-4" /> Delete Team
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    approved: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
    pending: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
    rejected: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const InfoBlock = ({ label, value, icon: Icon, capitalize }) => (
  <div className="flex items-start gap-3 p-3 bg-[#141c28] rounded-lg">
    <div className="w-8 h-8 bg-[#1c2430] rounded flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-[#4ade80]" />
    </div>
    <div className="min-w-0">
      <p className="text-[#4a5568] text-[10px] uppercase tracking-wide">{label}</p>
      <p className={`text-white text-sm truncate ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  </div>
);

export default AdminTeamsPage;
