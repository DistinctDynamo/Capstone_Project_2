import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiEye,
  FiUsers,
  FiMail,
  FiCheckCircle,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Card, Badge, Loading, Modal, Button, EmptyState } from '../../components/common';
import { adminAPI } from '../../api';

const AdminPendingPage = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [eventsRes, teamsRes] = await Promise.all([
        adminAPI.getPendingEvents(),
        adminAPI.getPendingTeams(),
      ]);

      setPendingEvents(eventsRes.data.data.events || []);
      setPendingTeams(teamsRes.data.data.teams || []);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (item, type) => {
    setActionLoading(true);
    try {
      if (type === 'team') {
        await adminAPI.approveTeam(item._id);
        setPendingTeams((prev) => prev.filter((t) => t._id !== item._id));
        toast.success(`Team "${item.team_name}" approved successfully`);
      } else {
        await adminAPI.approveEvent(item._id);
        setPendingEvents((prev) => prev.filter((e) => e._id !== item._id));
        toast.success(`Event "${item.title}" approved successfully`);
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      if (selectedItem.type === 'team') {
        await adminAPI.rejectTeam(selectedItem.item._id, rejectReason);
        setPendingTeams((prev) => prev.filter((t) => t._id !== selectedItem.item._id));
        toast.success(`Team "${selectedItem.item.team_name}" rejected`);
      } else {
        await adminAPI.rejectEvent(selectedItem.item._id, rejectReason);
        setPendingEvents((prev) => prev.filter((e) => e._id !== selectedItem.item._id));
        toast.success(`Event "${selectedItem.item.title}" rejected`);
      }
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (item, type) => {
    setSelectedItem({ item, type });
    setRejectModalOpen(true);
  };

  const openPreviewModal = (item, type) => {
    setSelectedItem({ item, type });
    setPreviewModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading pending approvals..." />
      </div>
    );
  }

  const tabs = [
    { id: 'teams', label: 'Teams', count: pendingTeams.length },
    { id: 'events', label: 'Events', count: pendingEvents.length },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Pending Approvals
        </h1>
        <p className="text-dark-400">
          Review and approve teams and events awaiting moderation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${
                activeTab === tab.id
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                  : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-700 hover:border-dark-600'
              }
            `}
          >
            {tab.label}
            <Badge
              variant={tab.count > 0 ? 'warning' : 'gray'}
              size="sm"
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {pendingTeams.length === 0 ? (
            <EmptyState
              icon={FiCheckCircle}
              title="All caught up!"
              description="There are no teams pending approval at the moment."
            />
          ) : (
            pendingTeams.map((team) => (
              <Card key={team._id} className="hover:border-dark-600 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <GiSoccerBall className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {team.team_name}
                        </h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-dark-400 text-sm mb-2 line-clamp-2">
                        {team.description || 'No description provided'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          {team.owner?.first_name} {team.owner?.last_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMail className="w-4 h-4" />
                          {team.owner?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {new Date(team.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPreviewModal(team, 'team')}
                      leftIcon={<FiEye />}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openRejectModal(team, 'team')}
                      leftIcon={<FiX />}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(team, 'team')}
                      leftIcon={<FiCheck />}
                      isLoading={actionLoading}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {pendingEvents.length === 0 ? (
            <EmptyState
              icon={FiCheckCircle}
              title="All caught up!"
              description="There are no events pending approval at the moment."
            />
          ) : (
            pendingEvents.map((event) => (
              <Card key={event._id} className="hover:border-dark-600 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {event.title}
                        </h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-dark-400 text-sm mb-2 line-clamp-2">
                        {event.description || 'No description provided'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          {event.creator?.first_name} {event.creator?.last_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(event.date || event.start_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {event.location?.name || event.location || 'TBD'}
                        </span>
                        {event.team && (
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            {event.team?.team_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPreviewModal(event, 'event')}
                      leftIcon={<FiEye />}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openRejectModal(event, 'event')}
                      leftIcon={<FiX />}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(event, 'event')}
                      leftIcon={<FiCheck />}
                      isLoading={actionLoading}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem?.type === 'team' ? 'Team Preview' : 'Event Preview'}
        size="lg"
      >
        {selectedItem?.type === 'team' && selectedItem?.item && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <GiSoccerBall className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedItem.item.team_name}
                </h3>
                <p className="text-dark-400">
                  Created by {selectedItem.item.owner?.first_name} {selectedItem.item.owner?.last_name}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-400">Description</label>
                <p className="text-white mt-1">
                  {selectedItem.item.description || 'No description provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Skill Level</label>
                  <p className="text-white mt-1 capitalize">
                    {selectedItem.item.skill_level || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Max Members</label>
                  <p className="text-white mt-1">
                    {selectedItem.item.max_members || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Owner Email</label>
                <p className="text-white mt-1">{selectedItem.item.owner?.email}</p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Created At</label>
                <p className="text-white mt-1">
                  {new Date(selectedItem.item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedItem?.type === 'event' && selectedItem?.item && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FiCalendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedItem.item.title}
                </h3>
                <p className="text-dark-400">
                  Created by {selectedItem.item.creator?.first_name} {selectedItem.item.creator?.last_name}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-400">Description</label>
                <p className="text-white mt-1">
                  {selectedItem.item.description || 'No description provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Date</label>
                  <p className="text-white mt-1">
                    {new Date(selectedItem.item.date || selectedItem.item.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Time</label>
                  <p className="text-white mt-1">
                    {selectedItem.item.time || selectedItem.item.start_time || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Location</label>
                <p className="text-white mt-1">
                  {selectedItem.item.location?.name || selectedItem.item.location || 'TBD'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Event Type</label>
                  <p className="text-white mt-1 capitalize">
                    {selectedItem.item.event_type || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Max Participants</label>
                  <p className="text-white mt-1">
                    {selectedItem.item.max_participants || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Creator Email</label>
                <p className="text-white mt-1">{selectedItem.item.creator?.email}</p>
              </div>
            </div>
          </div>
        )}

        <Modal.Actions>
          <Button
            variant="ghost"
            onClick={() => {
              setPreviewModalOpen(false);
              setSelectedItem(null);
            }}
          >
            Close
          </Button>
        </Modal.Actions>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedItem(null);
        }}
        title={`Reject ${selectedItem?.type === 'team' ? 'Team' : 'Event'}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            Please provide a reason for rejecting{' '}
            <span className="text-white font-medium">
              "{selectedItem?.item?.team_name || selectedItem?.item?.title}"
            </span>
            . This will be sent to the creator.
          </p>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={4}
              className="input w-full resize-none"
            />
          </div>
        </div>
        <Modal.Actions>
          <Button
            variant="ghost"
            onClick={() => {
              setRejectModalOpen(false);
              setRejectReason('');
              setSelectedItem(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            isLoading={actionLoading}
          >
            Reject {selectedItem?.type === 'team' ? 'Team' : 'Event'}
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default AdminPendingPage;
