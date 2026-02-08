import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiFilter,
  FiSearch,
  FiPlus,
  FiGrid,
  FiList,
  FiChevronDown,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Card, Badge, Button, Input, Loading, EmptyState } from '../components/common';
import useAuthStore from '../store/authStore';
import { eventsAPI } from '../api';

const EventsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    date: 'all',
    skillLevel: 'all',
  });

  // Event type mapping from backend to frontend display
  const eventTypeMap = {
    pickup_game: 'pickup',
    tournament: 'tournament',
    training: 'training',
    tryout: 'tryout',
    social: 'social',
    other: 'other',
  };

  const reverseEventTypeMap = {
    pickup: 'pickup_game',
    tournament: 'tournament',
    training: 'training',
    tryout: 'tryout',
    social: 'social',
    other: 'other',
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Build API params from filters
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.type !== 'all') params.event_type = reverseEventTypeMap[filters.type] || filters.type;
        if (filters.skillLevel !== 'all') params.skill_level = filters.skillLevel;

        const response = await eventsAPI.getAll(params);
        const eventsData = response.data?.events || response.events || [];

        // Transform API data to match component expectations
        const transformedEvents = eventsData.map(event => ({
          id: event._id || event.id,
          title: event.title,
          type: eventTypeMap[event.event_type] || event.event_type || event.type || 'pickup',
          date: event.date || event.start_date,
          time: event.start_time || event.time || 'TBD',
          location: event.location?.name || event.location || 'TBD',
          address: event.location?.address || event.address || '',
          players: event.attendees?.filter(a => a.status === 'going')?.length || event.players || 0,
          maxPlayers: event.max_participants || event.maxPlayers || 0,
          skillLevel: event.skill_level || event.skillLevel || 'all',
          host: {
            name: event.organizer?.first_name
              ? `${event.organizer.first_name} ${event.organizer.last_name || ''}`.trim()
              : event.organizer?.name || event.host?.name || 'Unknown',
            avatar: event.organizer?.profile_image || event.host?.avatar || null,
          },
          price: event.cost === 0 || !event.cost ? 'Free' : `$${event.cost}`,
          description: event.description || '',
        }));

        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'pickup':
        return 'primary';
      case 'league':
        return 'accent';
      case 'tournament':
        return 'warning';
      case 'private':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getSkillColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'accent';
      case 'advanced':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Client-side filtering
  const filteredEvents = events.filter((event) => {
    if (filters.search && !event.title?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && event.type?.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    if (filters.skillLevel !== 'all' && event.skillLevel?.toLowerCase() !== filters.skillLevel.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Upcoming <span className="gradient-text">Events</span>
          </h1>
          <p className="text-dark-400">
            Find pickup games, tournaments, and league matches near you.
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/events/create" className="btn-primary">
            <FiPlus /> Create Event
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              leftIcon={<FiSearch size={18} />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'ring-2 ring-primary-500' : ''}
            >
              <FiFilter />
              Filters
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <div className="flex border border-dark-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card className="animate-slide-up">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Event Type</label>
                <select
                  className="input"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="all">All Types</option>
                  <option value="pickup">Pickup Games</option>
                  <option value="tournament">Tournaments</option>
                  <option value="training">Training</option>
                  <option value="tryout">Tryouts</option>
                  <option value="social">Social Events</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Date</label>
                <select
                  className="input"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                >
                  <option value="all">Any Date</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                  <option value="weekend">This Weekend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Skill Level</label>
                <select
                  className="input"
                  value={filters.skillLevel}
                  onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value })}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={GiSoccerBall}
          title="No events found"
          description="Try adjusting your filters or check back later for new events."
          action={() => setFilters({ search: '', type: 'all', date: 'all', skillLevel: 'all' })}
          actionLabel="Clear Filters"
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className={`card-hover group ${viewMode === 'list' ? 'flex gap-6' : ''}`}
            >
              {/* Event Image Placeholder */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'mb-4'}`}>
                <div className={`bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center ${viewMode === 'list' ? 'h-full' : 'h-40'}`}>
                  <GiSoccerBall className="w-12 h-12 text-primary-400 opacity-50" />
                </div>
                <Badge variant={getTypeColor(event.type)} className="absolute top-3 left-3">
                  {event.type}
                </Badge>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {event.title}
                  </h3>
                  <span className="text-primary-400 font-semibold whitespace-nowrap">
                    {event.price}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-dark-400 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-dark-400" />
                    <span className={`text-sm font-medium ${event.players >= event.maxPlayers ? 'text-red-400' : 'text-dark-300'}`}>
                      {event.players}/{event.maxPlayers} players
                    </span>
                  </div>
                  <Badge variant={getSkillColor(event.skillLevel)} size="sm">
                    {event.skillLevel}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      event.players >= event.maxPlayers ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${(event.players / event.maxPlayers) * 100}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
