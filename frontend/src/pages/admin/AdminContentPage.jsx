import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiShoppingBag,
  FiSearch,
  FiTrash2,
  FiEye,
  FiUser,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiAlertTriangle,
  FiExternalLink,
} from 'react-icons/fi';
import { GiWhistle } from 'react-icons/gi';
import { Loading, Modal, Button } from '../../components/common';
import { eventsAPI, classifiedsAPI } from '../../api';

const AdminContentPage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, classifiedsRes] = await Promise.all([
          eventsAPI.getAll({ limit: 50 }),
          classifiedsAPI.getAll({ limit: 50 }),
        ]);

        setEvents(eventsRes.data.data?.events || eventsRes.data.events || []);
        setClassifieds(classifiedsRes.data.data?.classifieds || classifiedsRes.data.classifieds || []);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteEvent = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await eventsAPI.delete(selectedItem._id);
      setEvents((prev) => prev.filter((e) => e._id !== selectedItem._id));
      toast.success('Event deleted successfully');
      setDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClassified = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await classifiedsAPI.delete(selectedItem._id);
      setClassifieds((prev) => prev.filter((c) => c._id !== selectedItem._id));
      toast.success('Listing deleted successfully');
      setDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting classified:', error);
      toast.error('Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  const openPreview = (item, type) => {
    setSelectedItem({ ...item, type });
    setPreviewModalOpen(true);
  };

  const openDeleteModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setDeleteModalOpen(true);
  };

  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.creator?.first_name?.toLowerCase().includes(query) ||
      event.creator?.last_name?.toLowerCase().includes(query)
    );
  });

  const filteredClassifieds = classifieds.filter((classified) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      classified.title?.toLowerCase().includes(query) ||
      classified.description?.toLowerCase().includes(query) ||
      classified.seller?.first_name?.toLowerCase().includes(query) ||
      classified.seller?.last_name?.toLowerCase().includes(query)
    );
  });

  const tabs = [
    { id: 'events', label: 'Events', count: filteredEvents.length, icon: FiCalendar, color: '#a855f7' },
    { id: 'classifieds', label: 'Listings', count: filteredClassifieds.length, icon: FiShoppingBag, color: '#f59e0b' },
  ];

  const activeItems = activeTab === 'events' ? filteredEvents : filteredClassifieds;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading content..." />
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
              <div className="w-12 h-12 bg-[#a855f7]/20 rounded-lg flex items-center justify-center">
                <GiWhistle className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Content Moderation</h1>
                <p className="text-[#64748b] text-sm">Review and manage platform content</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <StatBadge label="Events" value={events.length} color="#a855f7" />
              <StatBadge label="Listings" value={classifieds.length} color="#f59e0b" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-[#0d1219] border-b border-[#1c2430]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            {/* Tabs */}
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-[#64748b] hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-[#a855f7]/20 text-[#a855f7]'
                      : 'bg-[#374151] text-[#9ca3af]'
                  }`}>
                    {tab.count}
                  </span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: tab.color }} />
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white text-sm placeholder:text-[#4a5568] focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeItems.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a2332] flex items-center justify-center">
              {activeTab === 'events' ? (
                <FiCalendar className="w-8 h-8 text-[#4a5568]" />
              ) : (
                <FiShoppingBag className="w-8 h-8 text-[#4a5568]" />
              )}
            </div>
            <p className="text-[#64748b]">No {activeTab} found</p>
            <p className="text-[#4a5568] text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeItems.map((item, idx) => (
              <ContentCard
                key={item._id}
                item={item}
                type={activeTab === 'events' ? 'event' : 'classified'}
                index={idx}
                onPreview={() => openPreview(item, activeTab === 'events' ? 'event' : 'classified')}
                onDelete={() => openDeleteModal(item, activeTab === 'events' ? 'event' : 'classified')}
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
        title={selectedItem?.type === 'event' ? 'Event Preview' : 'Listing Preview'}
        size="lg"
      >
        {selectedItem && <PreviewContent item={selectedItem} />}
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
          <Link
            to={`/${selectedItem?.type === 'event' ? 'events' : 'classifieds'}/${selectedItem?._id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors text-sm font-medium"
          >
            <FiExternalLink className="w-4 h-4" />
            View Full Page
          </Link>
        </Modal.Actions>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
            <p className="text-[#94a3b8] text-sm">
              This action cannot be undone. The content will be permanently removed.
            </p>
          </div>
          <p className="text-[#94a3b8]">
            Delete{' '}
            <span className="text-white font-medium">
              "{selectedItem?.title}"
            </span>
            ?
          </p>
        </div>
        <Modal.Actions>
          <Button
            variant="ghost"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedItem(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={
              selectedItem?.type === 'event'
                ? handleDeleteEvent
                : handleDeleteClassified
            }
            isLoading={actionLoading}
          >
            Delete {selectedItem?.type === 'event' ? 'Event' : 'Listing'}
          </Button>
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

const ContentCard = ({ item, type, index, onPreview, onDelete }) => {
  const isEvent = type === 'event';
  const Icon = isEvent ? FiCalendar : FiShoppingBag;
  const color = isEvent ? '#a855f7' : '#f59e0b';

  const getCreator = () => {
    if (isEvent) return `${item.creator?.first_name || ''} ${item.creator?.last_name || ''}`.trim() || 'Unknown';
    return `${item.seller?.first_name || ''} ${item.seller?.last_name || ''}`.trim() || 'Unknown';
  };

  const getStatus = () => {
    const status = item.approval_status || item.status || 'active';
    const styles = {
      approved: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
      active: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
      pending: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
      rejected: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20',
      sold: 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20',
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${styles[status] || styles.active}`}>
        {status}
      </span>
    );
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
      index % 2 === 0 ? 'bg-[#0d1219]' : 'bg-[#0f1520]'
    } border-[#1c2430] hover:border-[#2a3a4d]`}>
      {/* Icon */}
      <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Link
            to={`/${isEvent ? 'events' : 'classifieds'}/${item._id}`}
            className="text-white font-medium hover:text-[#3b82f6] transition-colors truncate"
          >
            {item.title}
          </Link>
          {getStatus()}
        </div>

        <p className="text-[#64748b] text-sm line-clamp-1 mb-2">
          {item.description || 'No description'}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#4a5568]">
          <span className="flex items-center gap-1">
            <FiUser className="w-3 h-3" />
            {getCreator()}
          </span>
          {isEvent ? (
            <>
              <span className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {new Date(item.date || item.start_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {item.location?.name || item.location || 'TBD'}
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 text-[#22c55e]">
                <FiDollarSign className="w-3 h-3" />
                ${item.price || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onPreview}
          className="p-2 rounded-lg text-[#64748b] hover:text-white hover:bg-[#1c2430] transition-colors"
          title="Preview"
        >
          <FiEye className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-[#64748b] hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
          title="Delete"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const PreviewContent = ({ item }) => {
  const isEvent = item.type === 'event';
  const Icon = isEvent ? FiCalendar : FiShoppingBag;
  const color = isEvent ? '#a855f7' : '#f59e0b';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 pb-4 border-b border-[#1c2430]">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-white">{item.title}</h3>
          <p className="text-[#64748b] text-sm">
            {isEvent
              ? `Created by ${item.creator?.first_name} ${item.creator?.last_name}`
              : `Posted by ${item.seller?.first_name} ${item.seller?.last_name}`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <DetailBlock label="Description" value={item.description || 'No description provided'} />

        {isEvent ? (
          <div className="grid grid-cols-2 gap-4">
            <DetailBlock label="Date" value={new Date(item.date || item.start_date).toLocaleDateString()} />
            <DetailBlock label="Location" value={item.location?.name || item.location || 'TBD'} />
            <DetailBlock label="Event Type" value={item.event_type || 'Not specified'} capitalize />
            <DetailBlock label="Status" value={item.approval_status || 'active'} capitalize />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <DetailBlock label="Price" value={item.price > 0 ? `$${item.price}` : 'Free'} highlight />
            <DetailBlock label="Category" value={item.category || item.classified_type || 'Not specified'} capitalize />
            <DetailBlock label="Condition" value={item.condition || 'Not specified'} capitalize />
            <DetailBlock label="Posted" value={new Date(item.created_at).toLocaleDateString()} />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailBlock = ({ label, value, capitalize, highlight }) => (
  <div className="p-3 bg-[#141c28] rounded-lg">
    <p className="text-[#4a5568] text-[10px] uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-sm ${highlight ? 'text-[#22c55e] font-medium' : 'text-white'} ${capitalize ? 'capitalize' : ''}`}>
      {value}
    </p>
  </div>
);

export default AdminContentPage;
