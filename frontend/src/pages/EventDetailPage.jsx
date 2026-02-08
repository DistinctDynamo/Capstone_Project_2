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
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { Card, Badge, Button, Avatar, Loading, Modal } from '../components/common';
import useAuthStore from '../store/authStore';
import { eventsAPI } from '../api';

const EventDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Event type mapping from backend to frontend display
  const eventTypeMap = {
    pickup_game: 'pickup',
    tournament: 'tournament',
    training: 'training',
    tryout: 'tryout',
    social: 'social',
    other: 'other',
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await eventsAPI.getById(id);
        const eventData = response.data?.event || response.event || response;

        // Check if user has already joined
        const userAttendee = eventData.attendees?.find(
          a => (a.user?._id || a.user) === user?._id
        );
        if (userAttendee && userAttendee.status === 'going') {
          setHasJoined(true);
        }

        // Transform API data to match component expectations
        const transformedEvent = {
          id: eventData._id || eventData.id,
          title: eventData.title,
          type: eventTypeMap[eventData.event_type] || eventData.event_type || eventData.type || 'pickup',
          date: eventData.date || eventData.start_date,
          time: eventData.start_time || eventData.time || 'TBD',
          endTime: eventData.end_time || eventData.endTime || 'TBD',
          location: eventData.location?.name || eventData.location || 'TBD',
          address: eventData.location?.address || eventData.address || '',
          players: eventData.attendees?.filter(a => a.status === 'going')?.length || eventData.players || 0,
          maxPlayers: eventData.max_participants || eventData.maxPlayers || 0,
          skillLevel: eventData.skill_level || eventData.skillLevel || 'all',
          host: {
            id: eventData.organizer?._id || eventData.organizer?.id,
            name: eventData.organizer?.first_name
              ? `${eventData.organizer.first_name} ${eventData.organizer.last_name || ''}`.trim()
              : eventData.organizer?.name || 'Unknown',
            avatar: eventData.organizer?.profile_image || null,
            rating: eventData.organizer?.rating || 0,
            gamesHosted: eventData.organizer?.stats?.events_organized || 0,
          },
          price: eventData.cost || 0,
          description: eventData.description || 'No description available.',
          amenities: eventData.amenities || [],
          attendees: (eventData.attendees || []).map(a => ({
            id: a.user?._id || a.user,
            name: a.user?.first_name
              ? `${a.user.first_name} ${a.user.last_name || ''}`.trim()
              : a.name || 'Unknown',
            avatar: a.user?.profile_image || null,
            status: a.status || 'going',
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
      await eventsAPI.expressInterest(id, 'going');
      setHasJoined(true);
      toast.success('You have joined the event!');

      // Update local state to reflect the change
      if (event) {
        setEvent(prev => ({
          ...prev,
          players: prev.players + 1,
          attendees: [
            ...prev.attendees,
            {
              id: user?._id,
              name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You',
              avatar: user?.profile_image || null,
              status: 'going',
            },
          ],
        }));
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
      await eventsAPI.removeInterest(id);
      setHasJoined(false);
      toast.success('You have left the event');

      // Update local state to reflect the change
      if (event) {
        setEvent(prev => ({
          ...prev,
          players: Math.max(0, prev.players - 1),
          attendees: prev.attendees.filter(a => a.id !== user?._id),
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading event details..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Event not found</h1>
        <Link to="/events" className="btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  const spotsLeft = event.maxPlayers - event.players;
  const isFull = spotsLeft <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft />
        Back to Events
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
              <GiSoccerBall className="w-24 h-24 text-primary-400 opacity-50" />
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="primary" size="lg">
                {event.type}
              </Badge>
              <Badge variant="accent" size="lg">
                {event.skillLevel}
              </Badge>
            </div>
          </div>

          {/* Event Info */}
          <Card>
            <h1 className="text-3xl font-display font-bold text-white mb-4">
              {event.title}
            </h1>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-dark-300">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Date</p>
                  <p className="font-medium text-white">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-dark-300">
                <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Time</p>
                  <p className="font-medium text-white">
                    {event.time} - {event.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-dark-300">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Location</p>
                  <p className="font-medium text-white">{event.location}</p>
                  <p className="text-sm text-dark-400">{event.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-dark-300">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Price</p>
                  <p className="font-medium text-white">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-dark-700 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">About this event</h2>
              <div className="prose prose-invert max-w-none">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-dark-300 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {event.amenities && (
              <div className="border-t border-dark-700 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {event.amenities.map((amenity, index) => (
                    <Badge key={index} variant="gray">
                      <FiCheck className="w-4 h-4" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Attendees */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiUsers className="text-primary-400" />
                Attendees ({event.players}/{event.maxPlayers})
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {event.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                  <Avatar src={attendee.avatar} name={attendee.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{attendee.name}</p>
                    <p className="text-xs text-dark-400">{attendee.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Comments */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiMessageSquare className="text-primary-400" />
              Discussion ({event.comments.length})
            </h2>
            <div className="space-y-4 mb-6">
              {event.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar src={comment.user.avatar} name={comment.user.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{comment.user.name}</span>
                      <span className="text-sm text-dark-500">{comment.time}</span>
                    </div>
                    <p className="text-dark-300">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {isAuthenticated && (
              <div className="flex gap-4">
                <Avatar src={user?.profileImage} name={user?.name} size="sm" />
                <div className="flex-1">
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm">Post Comment</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join Card */}
          <Card className="sticky top-24">
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-white mb-2">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </p>
              <p className={`text-sm ${isFull ? 'text-red-400' : 'text-primary-400'}`}>
                {isFull ? 'Event is full' : `${spotsLeft} spots left`}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-400">{event.players} joined</span>
                <span className="text-dark-400">{event.maxPlayers} max</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-primary-500'}`}
                  style={{ width: `${(event.players / event.maxPlayers) * 100}%` }}
                />
              </div>
            </div>

            {hasJoined ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-500/20 text-primary-400 rounded-xl">
                  <FiCheck />
                  You're going!
                </div>
                <Button variant="secondary" className="w-full" onClick={handleLeave} isLoading={isJoining}>
                  <FiX />
                  Cancel RSVP
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                disabled={isFull}
                onClick={handleJoin}
                isLoading={isJoining}
              >
                {isFull ? 'Join Waitlist' : 'Join Event'}
              </Button>
            )}

            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowShareModal(true)}>
                <FiShare2 />
                Share
              </Button>
              <Button variant="secondary" className="flex-1">
                <FiHeart />
                Save
              </Button>
            </div>
          </Card>

          {/* Host Card */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Hosted by</h3>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={event.host.avatar} name={event.host.name} size="lg" />
              <div>
                <p className="font-medium text-white">{event.host.name}</p>
                <p className="text-sm text-dark-400">{event.host.gamesHosted} games hosted</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.floor(event.host.rating) ? 'text-accent-400' : 'text-dark-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-dark-400 ml-2">{event.host.rating}</span>
            </div>
            <Button variant="secondary" className="w-full">
              <FiMessageSquare />
              Message Host
            </Button>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Event">
        <div className="space-y-4">
          <p className="text-dark-400">Share this event with your friends!</p>
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1">Copy Link</Button>
            <Button variant="secondary" className="flex-1">Twitter</Button>
            <Button variant="secondary" className="flex-1">Facebook</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetailPage;
