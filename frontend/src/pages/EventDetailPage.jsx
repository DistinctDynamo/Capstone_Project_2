import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiShare2,
  FiHeart,
  FiMessageSquare,
  FiArrowLeft,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { eventsAPI } from '../api';

// Capacity Meter Component
const CapacityMeter = ({ current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isFull = current >= max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#64748b]">{current} joined</span>
        <span className="text-[#64748b]">{max} max</span>
      </div>
      <div className="flex gap-0.5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-3 rounded-sm ${
              i < Math.ceil(percentage / 5)
                ? isFull ? 'bg-[#ef4444]' : 'bg-[#4ade80]'
                : 'bg-[#2a3a4d]'
            }`}
          />
        ))}
      </div>
      <p className={`text-center text-sm font-medium ${isFull ? 'text-[#ef4444]' : 'text-[#4ade80]'}`}>
        {isFull ? 'Event is full' : `${max - current} spots left`}
      </p>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, color = '#4ade80' }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-[#64748b] uppercase tracking-wider">{label}</p>
        <p className="font-medium text-white">{value}</p>
      </div>
    </div>
  </div>
);

// Attendee Card Component
const AttendeeCard = ({ attendee }) => (
  <Link
    to={`/players/${attendee.id}`}
    className="flex items-center gap-3 p-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg hover:border-[#3d4f63] transition-all group"
  >
    {attendee.avatar ? (
      <img src={attendee.avatar} alt={attendee.name} className="w-10 h-10 rounded-full object-cover" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-[#1a5f2a] flex items-center justify-center">
        <span className="text-sm font-bold text-[#4ade80]">
          {attendee.name?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white group-hover:text-[#4ade80] transition-colors truncate">
        {attendee.name}
      </p>
      <p className="text-xs text-[#64748b] capitalize">{attendee.status}</p>
    </div>
  </Link>
);

// Comment Component
const Comment = ({ comment }) => (
  <div className="flex gap-4 p-4 bg-[#141c28] border border-[#2a3a4d] rounded-lg">
    {comment.user.avatar ? (
      <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-[#1a5f2a] flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-[#4ade80]">
          {comment.user.name?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-white">{comment.user.name}</span>
        <span className="text-xs text-[#64748b]">{comment.time}</span>
      </div>
      <p className="text-[#94a3b8]">{comment.text}</p>
    </div>
  </div>
);

const EventDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userStatus, setUserStatus] = useState('none');

  const eventTypeMap = {
    pickup_game: 'pickup',
    tournament: 'tournament',
    training: 'training',
    tryout: 'tryout',
    social: 'social',
    other: 'other',
  };

  const typeColors = {
    pickup: { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
    tournament: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
    training: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    tryout: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    social: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    other: { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' },
  };

  const levelColors = {
    all: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    beginner: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    intermediate: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    advanced: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await eventsAPI.getById(id);
        const eventData = response.data?.event || response.event || response;

        const userId = user?._id?.toString() || user?._id;
        if (userId) {
          const isParticipant = eventData.participants?.some(
            p => (p.user?._id || p.user)?.toString() === userId
          );

          const pendingRequest = eventData.join_requests?.find(
            r => (r.user?._id || r.user)?.toString() === userId && r.status === 'pending'
          );

          const isGoing = eventData.interested?.some(
            i => (i.user?._id || i.user)?.toString() === userId && i.status === 'going'
          );

          if (isParticipant || isGoing) {
            setUserStatus('approved');
          } else if (pendingRequest) {
            setUserStatus('pending');
          } else {
            setUserStatus('none');
          }
        }

        const participantsList = [];

        if (eventData.participants) {
          eventData.participants.forEach(p => {
            const pUser = p.user || p;
            participantsList.push({
              id: pUser._id || pUser,
              name: pUser.first_name
                ? `${pUser.first_name} ${pUser.last_name || ''}`.trim()
                : pUser.username || 'Unknown',
              avatar: pUser.avatar || null,
              status: 'going',
            });
          });
        }

        if (eventData.interested) {
          eventData.interested.forEach(i => {
            if (i.status === 'going') {
              const iUser = i.user || i;
              if (!participantsList.some(p => p.id?.toString() === (iUser._id || iUser)?.toString())) {
                participantsList.push({
                  id: iUser._id || iUser,
                  name: iUser.first_name
                    ? `${iUser.first_name} ${iUser.last_name || ''}`.trim()
                    : iUser.username || 'Unknown',
                  avatar: iUser.avatar || null,
                  status: 'going',
                });
              }
            }
          });
        }

        const creator = eventData.creator || eventData.organizer;

        const transformedEvent = {
          id: eventData._id || eventData.id,
          title: eventData.title,
          type: eventTypeMap[eventData.event_type] || eventData.event_type || eventData.type || 'pickup',
          date: eventData.date || eventData.start_date,
          time: eventData.start_time || eventData.time || 'TBD',
          endTime: eventData.end_time || eventData.endTime || 'TBD',
          location: eventData.location?.name || eventData.location || 'TBD',
          address: eventData.location?.address || eventData.address || '',
          players: participantsList.length,
          maxPlayers: eventData.max_participants || eventData.maxPlayers || 22,
          skillLevel: eventData.skill_level || eventData.skillLevel || 'all',
          requiresApproval: eventData.requires_approval !== false,
          host: {
            id: creator?._id || creator?.id,
            name: creator?.first_name
              ? `${creator.first_name} ${creator.last_name || ''}`.trim()
              : creator?.username || 'Unknown',
            avatar: creator?.avatar || null,
            rating: creator?.rating || 0,
            gamesHosted: creator?.stats?.events_organized || 0,
          },
          price: eventData.price || eventData.cost || 0,
          description: eventData.description || 'No description available.',
          amenities: eventData.amenities || [],
          attendees: participantsList,
          pendingRequests: (eventData.join_requests || []).filter(r => r.status === 'pending').map(r => ({
            id: r._id,
            user: r.user,
            message: r.message,
            requestedAt: r.requested_at,
          })),
          comments: (eventData.comments || []).map(c => ({
            id: c._id || c.id,
            user: {
              name: c.user?.first_name
                ? `${c.user.first_name} ${c.user.last_name || ''}`.trim()
                : c.user?.name || 'Unknown',
              avatar: c.user?.profile_image || null,
            },
            text: c.content || c.text,
            time: c.createdAt
              ? new Date(c.createdAt).toLocaleDateString()
              : c.time || 'Unknown',
          })),
          isCreator: creator?._id?.toString() === userId || creator?.toString() === userId,
        };

        setEvent(transformedEvent);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join events');
      return;
    }
    setIsJoining(true);
    try {
      if (event?.requiresApproval) {
        const response = await eventsAPI.requestJoin(id);
        if (response.data?.status === 'approved') {
          setUserStatus('approved');
          toast.success('You have joined the event!');
          if (event) {
            setEvent(prev => ({
              ...prev,
              players: prev.players + 1,
              attendees: [
                ...prev.attendees,
                {
                  id: user?._id,
                  name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You',
                  avatar: user?.avatar || null,
                  status: 'going',
                },
              ],
            }));
          }
        } else {
          setUserStatus('pending');
          toast.success('Join request submitted! Waiting for approval.');
        }
      } else {
        await eventsAPI.expressInterest(id, 'going');
        setUserStatus('approved');
        toast.success('You have joined the event!');
        if (event) {
          setEvent(prev => ({
            ...prev,
            players: prev.players + 1,
            attendees: [
              ...prev.attendees,
              {
                id: user?._id,
                name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You',
                avatar: user?.avatar || null,
                status: 'going',
              },
            ],
          }));
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error(error.response?.data?.message || 'Failed to join event');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    setIsJoining(true);
    try {
      try {
        await eventsAPI.leaveEvent(id, user?._id);
      } catch {
        await eventsAPI.removeInterest(id);
      }

      setUserStatus('none');
      toast.success('You have left the event');

      if (event) {
        setEvent(prev => ({
          ...prev,
          players: Math.max(0, prev.players - 1),
          attendees: prev.attendees.filter(a => a.id?.toString() !== user?._id?.toString()),
        }));
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error(error.response?.data?.message || 'Failed to leave event');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading event details..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
            <GiSoccerBall className="w-10 h-10 text-[#64748b]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Event not found</h1>
          <p className="text-[#64748b] mb-6">This event may have been removed or doesn't exist</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const type = typeColors[event.type] || typeColors.other;
  const level = levelColors[event.skillLevel] || levelColors.all;
  const isFull = event.players >= event.maxPlayers;

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Events</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-[#1a5f2a]/30 to-[#141c28] flex items-center justify-center relative">
                <GiSoccerBall className="w-24 h-24 text-[#4ade80]/30" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-lg ${type.bg}`}>
                    <span className={`text-xs font-medium uppercase tracking-wider ${type.text}`}>
                      {event.type}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${level.bg}`}>
                    <span className={`text-xs font-medium uppercase tracking-wider ${level.text}`}>
                      {event.skillLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-6">{event.title}</h1>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <InfoCard
                    icon={FiCalendar}
                    label="Date"
                    value={new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                    color="#a855f7"
                  />
                  <InfoCard
                    icon={FiClock}
                    label="Time"
                    value={`${event.time} - ${event.endTime}`}
                    color="#f59e0b"
                  />
                  <InfoCard
                    icon={FiMapPin}
                    label="Location"
                    value={event.location}
                    color="#3b82f6"
                  />
                  <InfoCard
                    icon={FiDollarSign}
                    label="Price"
                    value={event.price === 0 ? 'Free' : `$${event.price}`}
                    color="#22c55e"
                  />
                </div>

                <div className="border-t border-[#1c2430] pt-6">
                  <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                    About This Event
                  </h2>
                  <div className="text-[#94a3b8] whitespace-pre-wrap">
                    {event.description}
                  </div>
                </div>

                {event.amenities.length > 0 && (
                  <div className="border-t border-[#1c2430] pt-6 mt-6">
                    <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                      Amenities
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {event.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#141c28] border border-[#2a3a4d] text-[#94a3b8] text-sm rounded-lg"
                        >
                          <FiCheck className="w-4 h-4 text-[#4ade80]" />
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-[#4ade80]" />
                  Attendees
                </h2>
                <span className="text-sm font-mono text-white">
                  {event.players}/{event.maxPlayers}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {event.attendees.map((attendee) => (
                  <AttendeeCard key={attendee.id} attendee={attendee} />
                ))}
              </div>
              {event.attendees.length === 0 && (
                <p className="text-center text-[#64748b] py-8">No attendees yet. Be the first to join!</p>
              )}
            </div>

            {/* Discussion */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4 text-[#a855f7]" />
                Discussion ({event.comments.length})
              </h2>
              <div className="space-y-3 mb-6">
                {event.comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
                {event.comments.length === 0 && (
                  <p className="text-center text-[#64748b] py-8">No comments yet. Start the discussion!</p>
                )}
              </div>
              {isAuthenticated && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1a5f2a] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#4ade80]">
                      {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      className="w-full px-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 min-h-[80px] resize-none"
                      placeholder="Add a comment..."
                    />
                    <div className="flex justify-end mt-2">
                      <button className="px-4 py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all text-sm font-medium">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold font-mono text-white mb-1">
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </p>
                {event.price > 0 && <p className="text-xs text-[#64748b] uppercase tracking-wider">per person</p>}
              </div>

              {/* Capacity Meter */}
              <div className="mb-6">
                <CapacityMeter current={event.players} max={event.maxPlayers} />
              </div>

              {/* Action Button */}
              {userStatus === 'approved' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-[#22c55e]/10 text-[#4ade80] rounded-lg border border-[#22c55e]/30">
                    <FiCheck className="w-5 h-5" />
                    <span className="font-medium">You're going!</span>
                  </div>
                  <button
                    onClick={handleLeave}
                    disabled={isJoining}
                    className="w-full py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    <FiX className="w-5 h-5" />
                    Cancel RSVP
                  </button>
                </div>
              ) : userStatus === 'pending' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg border border-[#f59e0b]/30">
                    <FiClock className="w-5 h-5" />
                    <span className="font-medium">Request Pending</span>
                  </div>
                  <p className="text-xs text-[#64748b] text-center">
                    Waiting for the host to approve your request
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isFull || isJoining}
                  className="w-full py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Processing...' : isFull ? 'Join Waitlist' : event?.requiresApproval ? 'Request to Join' : 'Join Event'}
                </button>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 py-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex-1 py-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2">
                  <FiHeart className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            {/* Host Card */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                Hosted By
              </h3>
              <Link
                to={`/players/${event.host.id}`}
                className="flex items-center gap-4 mb-4 group"
              >
                {event.host.avatar ? (
                  <img src={event.host.avatar} alt={event.host.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1a5f2a] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#4ade80]">
                      {event.host.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-white group-hover:text-[#4ade80] transition-colors">
                    {event.host.name}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {event.host.gamesHosted} games hosted
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.floor(event.host.rating) ? 'text-[#f59e0b]' : 'text-[#2a3a4d]'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-[#64748b] ml-2 font-mono">{event.host.rating.toFixed(1)}</span>
              </div>
              <button className="w-full py-2 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <FiMessageSquare className="w-4 h-4" />
                Message Host
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Share Event</h2>
            <p className="text-sm text-[#64748b] mb-6">Share this event with your friends!</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all font-medium">
                Copy Link
              </button>
              <button className="flex-1 py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all font-medium">
                Twitter
              </button>
              <button className="flex-1 py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all font-medium">
                Facebook
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
