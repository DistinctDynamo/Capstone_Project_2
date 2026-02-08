import { useState, useEffect } from 'react';
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
  FiTag,
  FiDollarSign,
  FiChevronRight,
  FiAlertTriangle,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { Loading, Modal, Button } from '../../components/common';
import { adminAPI } from '../../api';

const AdminPendingPage = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [pendingClassifieds, setPendingClassifieds] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [eventsRes, teamsRes, classifiedsRes] = await Promise.all([
        adminAPI.getPendingEvents(),
        adminAPI.getPendingTeams(),
        adminAPI.getPendingClassifieds(),
      ]);

      setPendingEvents(eventsRes.data.data.events || []);
      setPendingTeams(teamsRes.data.data.teams || []);
      setPendingClassifieds(classifiedsRes.data.data.classifieds || []);
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
        toast.success(`Team "${item.team_name}" approved`);
      } else if (type === 'classified') {
        await adminAPI.approveClassified(item._id);
        setPendingClassifieds((prev) => prev.filter((c) => c._id !== item._id));
        toast.success(`Listing "${item.title}" approved`);
      } else {
        await adminAPI.approveEvent(item._id);
        setPendingEvents((prev) => prev.filter((e) => e._id !== item._id));
        toast.success(`Event "${item.title}" approved`);
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve');
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
      } else if (selectedItem.type === 'classified') {
        await adminAPI.rejectClassified(selectedItem.item._id, rejectReason);
        setPendingClassifieds((prev) => prev.filter((c) => c._id !== selectedItem.item._id));
        toast.success(`Listing "${selectedItem.item.title}" rejected`);
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
      toast.error('Failed to reject');
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
        <Loading size="lg" text="Loading pending items..." />
      </div>
    );
  }

  const totalPending = pendingTeams.length + pendingEvents.length + pendingClassifieds.length;

  const tabs = [
    { id: 'teams', label: 'Teams', count: pendingTeams.length, icon: GiSoccerBall, color: '#22c55e' },
    { id: 'events', label: 'Events', count: pendingEvents.length, icon: FiCalendar, color: '#a855f7' },
    { id: 'classifieds', label: 'Listings', count: pendingClassifieds.length, icon: FiTag, color: '#f59e0b' },
  ];

  const activeItems = activeTab === 'teams' ? pendingTeams
    : activeTab === 'events' ? pendingEvents
    : pendingClassifieds;

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Header with Queue Status */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center">
                <GiWhistle className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Approval Queue</h1>
                <p className="text-[#64748b] text-sm">{totalPending} items awaiting review</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              {tabs.map((tab) => (
                <div key={tab.id} className="text-center">
                  <p className="text-2xl font-bold" style={{ color: tab.color }}>{tab.count}</p>
                  <p className="text-[#4a5568] text-xs uppercase tracking-wide">{tab.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-[#64748b] hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-[#dc2626] text-white'
                      : 'bg-[#374151] text-[#9ca3af]'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: tab.color }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeItems.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
              <FiCheck className="w-10 h-10 text-[#22c55e]" />
            </div>
            <p className="text-white font-medium text-lg">All cleared!</p>
            <p className="text-[#4a5568] text-sm mt-1">No {activeTab} pending approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeItems.map((item, idx) => (
              <ApprovalCard
                key={item._id}
                item={item}
                type={activeTab === 'teams' ? 'team' : activeTab === 'events' ? 'event' : 'classified'}
                index={idx}
                onPreview={() => openPreviewModal(item, activeTab === 'teams' ? 'team' : activeTab === 'events' ? 'event' : 'classified')}
                onApprove={() => handleApprove(item, activeTab === 'teams' ? 'team' : activeTab === 'events' ? 'event' : 'classified')}
                onReject={() => openRejectModal(item, activeTab === 'teams' ? 'team' : activeTab === 'events' ? 'event' : 'classified')}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedItem(null);
        }}
        title={
          selectedItem?.type === 'team'
            ? 'Team Preview'
            : selectedItem?.type === 'classified'
            ? 'Listing Preview'
            : 'Event Preview'
        }
        size="lg"
      >
        {selectedItem && <PreviewContent selectedItem={selectedItem} />}
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
        title={`Reject ${selectedItem?.type === 'team' ? 'Team' : selectedItem?.type === 'classified' ? 'Listing' : 'Event'}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
            <p className="text-[#94a3b8] text-sm">
              You are about to reject{' '}
              <span className="text-white font-medium">
                "{selectedItem?.item?.team_name || selectedItem?.item?.title}"
              </span>
            </p>
          </div>
          <div>
            <label className="block text-xs text-[#64748b] uppercase tracking-wide mb-2">
              Reason for Rejection
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this submission is being rejected..."
              rows={4}
              className="w-full px-3 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm resize-none placeholder:text-[#4a5568] focus:outline-none focus:border-[#dc2626]"
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
            Confirm Rejection
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

// === APPROVAL CARD COMPONENT ===
const ApprovalCard = ({ item, type, index, onPreview, onApprove, onReject, actionLoading }) => {
  const getName = () => type === 'team' ? item.team_name : item.title;
  const getSubmitter = () => {
    if (type === 'team') return `${item.owner?.first_name || ''} ${item.owner?.last_name || ''}`.trim() || 'Unknown';
    return `${item.creator?.first_name || ''} ${item.creator?.last_name || ''}`.trim() || 'Unknown';
  };

  const typeConfig = {
    team: { icon: GiSoccerBall, color: '#22c55e', label: 'Team Registration' },
    event: { icon: FiCalendar, color: '#a855f7', label: 'Event Submission' },
    classified: { icon: FiTag, color: '#f59e0b', label: 'Listing' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden ${index % 2 === 1 ? 'bg-[#0f1520]' : ''}`}>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1c2430] bg-[#141c28]">
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
          <Icon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">{getName()}</p>
          <p className="text-[#4a5568] text-xs">{config.label}</p>
        </div>
        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
          <FiClock className="w-2.5 h-2.5 inline mr-1" />
          Pending
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <InfoItem icon={FiUser} label="Submitted by" value={getSubmitter()} />

          {type === 'team' && (
            <>
              <InfoItem icon={FiMail} label="Contact" value={item.owner?.email || 'N/A'} />
              <InfoItem icon={FiUsers} label="Max Members" value={item.max_members || 25} />
            </>
          )}

          {type === 'event' && (
            <>
              <InfoItem icon={FiCalendar} label="Date" value={new Date(item.date || item.start_date).toLocaleDateString()} />
              <InfoItem icon={FiMapPin} label="Location" value={item.location?.name || item.location || 'TBD'} />
            </>
          )}

          {type === 'classified' && (
            <>
              <InfoItem icon={FiTag} label="Category" value={item.classified_type?.replace(/_/g, ' ') || 'General'} />
              <InfoItem icon={FiDollarSign} label="Price" value={item.price > 0 ? `$${item.price}` : 'Free'} highlight />
            </>
          )}
        </div>

        {item.description && (
          <p className="text-[#64748b] text-sm line-clamp-2 mb-4">{item.description}</p>
        )}

        <div className="text-[#4a5568] text-xs mb-4">
          Submitted {formatTimeAgo(item.created_at)}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1c2430]">
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-white transition-colors"
          >
            <FiEye className="w-4 h-4" />
            View Details
            <FiChevronRight className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#dc2626]/10 text-[#dc2626] hover:bg-[#dc2626]/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <FiX className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={onApprove}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#22c55e] text-white hover:bg-[#16a34a] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <FiCheck className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === INFO ITEM COMPONENT ===
const InfoItem = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-2">
    <div className="w-6 h-6 rounded bg-[#1c2430] flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-3 h-3 text-[#64748b]" />
    </div>
    <div className="min-w-0">
      <p className="text-[#4a5568] text-[10px] uppercase tracking-wide">{label}</p>
      <p className={`text-sm truncate ${highlight ? 'text-[#22c55e] font-medium' : 'text-white'}`}>{value}</p>
    </div>
  </div>
);

// === PREVIEW CONTENT COMPONENT ===
const PreviewContent = ({ selectedItem }) => {
  const { item, type } = selectedItem;

  const typeConfig = {
    team: { icon: GiSoccerBall, color: '#22c55e' },
    event: { icon: FiCalendar, color: '#a855f7' },
    classified: { icon: FiTag, color: '#f59e0b' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 pb-4 border-b border-[#1c2430]">
        <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
          <Icon className="w-7 h-7" style={{ color: config.color }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{item.team_name || item.title}</h3>
          <p className="text-[#64748b] text-sm">
            {type === 'team'
              ? `by ${item.owner?.first_name} ${item.owner?.last_name}`
              : `by ${item.creator?.first_name} ${item.creator?.last_name}`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <DetailBlock label="Description" value={item.description || 'No description provided'} />

        {type === 'team' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <DetailBlock label="Skill Level" value={item.skill_level || 'Not specified'} capitalize />
              <DetailBlock label="Max Members" value={item.max_members || 'Not specified'} />
            </div>
            <DetailBlock label="Owner Email" value={item.owner?.email} />
          </>
        )}

        {type === 'event' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <DetailBlock label="Date" value={new Date(item.date || item.start_date).toLocaleDateString()} />
              <DetailBlock label="Time" value={item.time || item.start_time || 'Not specified'} />
            </div>
            <DetailBlock label="Location" value={item.location?.name || item.location || 'TBD'} />
            <div className="grid grid-cols-2 gap-4">
              <DetailBlock label="Event Type" value={item.event_type || 'Not specified'} capitalize />
              <DetailBlock label="Max Participants" value={item.max_participants || 'Not specified'} />
            </div>
          </>
        )}

        {type === 'classified' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <DetailBlock label="Type" value={item.classified_type?.replace(/_/g, ' ') || 'Not specified'} capitalize />
              <DetailBlock label="Price" value={item.price > 0 ? `$${item.price}` : 'Free'} />
            </div>
            <DetailBlock label="Location" value={item.location || 'Not specified'} />
          </>
        )}

        <DetailBlock label="Submitted" value={new Date(item.created_at).toLocaleString()} />
      </div>
    </div>
  );
};

// === DETAIL BLOCK COMPONENT ===
const DetailBlock = ({ label, value, capitalize }) => (
  <div className="p-3 bg-[#141c28] rounded-lg">
    <p className="text-[#4a5568] text-[10px] uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-white text-sm ${capitalize ? 'capitalize' : ''}`}>{value}</p>
  </div>
);

// === UTILITY FUNCTIONS ===
const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default AdminPendingPage;
