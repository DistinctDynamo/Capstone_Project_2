import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiShoppingBag,
  FiSearch,
  FiFlag,
  FiTrash2,
  FiEye,
  FiUser,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiAlertTriangle,
} from 'react-icons/fi';
import { Card, Badge, Loading, Modal, Button, Input, EmptyState } from '../../components/common';
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
      toast.success('Classified deleted successfully');
      setDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting classified:', error);
      toast.error('Failed to delete classified');
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
    { id: 'events', label: 'Events', count: filteredEvents.length, icon: FiCalendar },
    { id: 'classifieds', label: 'Classifieds', count: filteredClassifieds.length, icon: FiShoppingBag },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'sold':
        return <Badge variant="gray" size="sm">Sold</Badge>;
      default:
        return <Badge variant="gray" size="sm">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Content Moderation
        </h1>
        <p className="text-dark-400">
          Review and moderate events and classifieds on the platform
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search content by title, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FiSearch className="w-5 h-5" />}
            />
          </div>
        </div>
      </Card>

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
            <tab.icon className="w-5 h-5" />
            {tab.label}
            <Badge variant="gray" size="sm">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loading size="lg" text="Loading content..." />
        </div>
      ) : (
        <>
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <EmptyState
                  icon={FiCalendar}
                  title="No events found"
                  description="No events match your search criteria"
                />
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event._id} className="hover:border-dark-600 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <FiCalendar className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link
                              to={`/events/${event._id}`}
                              className="text-lg font-semibold text-white hover:text-primary-400 transition-colors"
                            >
                              {event.title}
                            </Link>
                            {getStatusBadge(event.approval_status)}
                          </div>
                          <p className="text-dark-400 text-sm mb-2 line-clamp-1">
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
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreview(event, 'event')}
                          leftIcon={<FiEye />}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(event, 'event')}
                          leftIcon={<FiTrash2 />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Classifieds Tab */}
          {activeTab === 'classifieds' && (
            <div className="space-y-4">
              {filteredClassifieds.length === 0 ? (
                <EmptyState
                  icon={FiShoppingBag}
                  title="No classifieds found"
                  description="No classifieds match your search criteria"
                />
              ) : (
                filteredClassifieds.map((classified) => (
                  <Card key={classified._id} className="hover:border-dark-600 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {classified.images && classified.images.length > 0 ? (
                          <img
                            src={classified.images[0]}
                            alt={classified.title}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <FiShoppingBag className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link
                              to={`/classifieds/${classified._id}`}
                              className="text-lg font-semibold text-white hover:text-primary-400 transition-colors"
                            >
                              {classified.title}
                            </Link>
                            {getStatusBadge(classified.status)}
                          </div>
                          <p className="text-dark-400 text-sm mb-2 line-clamp-1">
                            {classified.description || 'No description provided'}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                            <span className="flex items-center gap-1">
                              <FiUser className="w-4 h-4" />
                              {classified.seller?.first_name} {classified.seller?.last_name}
                            </span>
                            <span className="flex items-center gap-1 text-primary-400 font-medium">
                              <FiDollarSign className="w-4 h-4" />
                              ${classified.price || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-4 h-4" />
                              {new Date(classified.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreview(classified, 'classified')}
                          leftIcon={<FiEye />}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(classified, 'classified')}
                          leftIcon={<FiTrash2 />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem?.type === 'event' ? 'Event Preview' : 'Classified Preview'}
        size="lg"
      >
        {selectedItem?.type === 'event' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FiCalendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedItem.title}
                </h3>
                <p className="text-dark-400">
                  Created by {selectedItem.creator?.first_name} {selectedItem.creator?.last_name}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-400">Description</label>
                <p className="text-white mt-1">
                  {selectedItem.description || 'No description provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Date</label>
                  <p className="text-white mt-1">
                    {new Date(selectedItem.date || selectedItem.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedItem.approval_status)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Location</label>
                <p className="text-white mt-1">
                  {selectedItem.location?.name || selectedItem.location || 'TBD'}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedItem?.type === 'classified' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <img
                  src={selectedItem.images[0]}
                  alt={selectedItem.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-500 to-orange-500 flex items-center justify-center">
                  <FiShoppingBag className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedItem.title}
                </h3>
                <p className="text-dark-400">
                  Posted by {selectedItem.seller?.first_name} {selectedItem.seller?.last_name}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-400">Description</label>
                <p className="text-white mt-1">
                  {selectedItem.description || 'No description provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Price</label>
                  <p className="text-primary-400 font-semibold mt-1">
                    ${selectedItem.price || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Category</label>
                  <p className="text-white mt-1 capitalize">
                    {selectedItem.category || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Condition</label>
                <p className="text-white mt-1 capitalize">
                  {selectedItem.condition || 'Not specified'}
                </p>
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
          <Link
            to={`/${selectedItem?.type === 'event' ? 'events' : 'classifieds'}/${selectedItem?._id}`}
            className="btn-primary"
          >
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
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <FiAlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              This action cannot be undone. The content will be permanently removed.
            </p>
          </div>
          <p className="text-dark-300">
            Are you sure you want to delete{' '}
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
            Delete {selectedItem?.type === 'event' ? 'Event' : 'Classified'}
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default AdminContentPage;
