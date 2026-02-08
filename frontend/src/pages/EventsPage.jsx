import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiSearch,
  FiPlus,
  FiGrid,
  FiList,
  FiX,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { eventsAPI } from '../api';

// Filter Tab Component
const FilterTab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
      active
        ? 'bg-[#1a5f2a] text-[#4ade80] border border-[#22c55e]/30'
        : 'text-[#64748b] hover:text-white hover:bg-[#1c2430]'
    }`}
  >
    {children}
    {count !== undefined && (
      <span className={`text-xs px-1.5 py-0.5 rounded ${
        active ? 'bg-[#22c55e]/20' : 'bg-[#2a3a4d]'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// Capacity Meter Component
const CapacityMeter = ({ current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isFull = current >= max;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm ${
              i < Math.ceil(percentage / 10)
                ? isFull ? 'bg-[#ef4444]' : 'bg-[#4ade80]'
                : 'bg-[#2a3a4d]'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-mono ${isFull ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
        {current}/{max}
      </span>
    </div>
  );
};

// Event Row Component
const EventRow = ({ event }) => {
  const dateStr = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const typeColors = {
    pickup: { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
    tournament: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    training: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    tryout: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    social: { bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]' },
    other: { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' },
  };

  const skillColors = {
    beginner: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    intermediate: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    advanced: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
    all: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
  };

  const type = typeColors[event.type?.toLowerCase()] || typeColors.other;
  const skill = skillColors[event.skillLevel?.toLowerCase()] || skillColors.all;
  const isFull = event.players >= event.maxPlayers;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex items-center gap-4 p-4 bg-[#0d1219] border border-[#1c2430] rounded-xl hover:border-[#2a3a4d] transition-all"
    >
      {/* Date Box */}
      <div className="w-16 h-16 bg-[#141c28] border border-[#2a3a4d] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-xs text-[#64748b] uppercase">{dateStr.split(' ')[1]}</span>
        <span className="text-2xl font-bold text-white font-mono">{dateStr.split(' ')[2]}</span>
        <span className="text-[10px] text-[#64748b] uppercase">{dateStr.split(' ')[0]}</span>
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors truncate">
            {event.title}
          </h3>
          {isFull && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#ef4444]/10 text-[#ef4444] rounded uppercase">
              Full
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {event.time}
          </span>
          <span className="flex items-center gap-1 truncate">
            <FiMapPin className="w-3 h-3" />
            {event.location}
          </span>
        </div>
      </div>

      {/* Type Badge */}
      <div className={`hidden sm:block px-3 py-1 rounded-lg ${type.bg}`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${type.text}`}>
          {event.type}
        </span>
      </div>

      {/* Skill Level */}
      <div className={`hidden md:block px-3 py-1 rounded-lg ${skill.bg}`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${skill.text}`}>
          {event.skillLevel}
        </span>
      </div>

      {/* Capacity */}
      <div className="hidden lg:block">
        <CapacityMeter current={event.players} max={event.maxPlayers} />
      </div>

      {/* Price */}
      <div className="text-right">
        <span className={`font-semibold ${event.price === 'Free' ? 'text-[#4ade80]' : 'text-white'}`}>
          {event.price}
        </span>
      </div>
    </Link>
  );
};

// Event Card Component (Grid View)
const EventCard = ({ event }) => {
  const dateStr = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const typeColors = {
    pickup: { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
    tournament: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    training: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    tryout: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    social: { bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]' },
    other: { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' },
  };

  const type = typeColors[event.type?.toLowerCase()] || typeColors.other;
  const isFull = event.players >= event.maxPlayers;
  const percentage = event.maxPlayers > 0 ? (event.players / event.maxPlayers) * 100 : 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden hover:border-[#2a3a4d] transition-all"
    >
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-[#1a5f2a]/20 to-[#141c28] flex items-center justify-center">
        <GiSoccerBall className="w-16 h-16 text-[#4ade80]/20" />
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg ${type.bg}`}>
          <span className={`text-xs font-medium uppercase tracking-wider ${type.text}`}>
            {event.type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`font-semibold text-sm ${event.price === 'Free' ? 'text-[#4ade80]' : 'text-white'}`}>
            {event.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors mb-3 truncate">
          {event.title}
        </h3>

        <div className="space-y-2 text-xs text-[#64748b] mb-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-3 h-3" />
            {dateStr}
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-3 h-3" />
            {event.time}
          </div>
          <div className="flex items-center gap-2 truncate">
            <FiMapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[#64748b]">
              <FiUsers className="w-3 h-3" />
              Players
            </span>
            <span className={`font-mono ${isFull ? 'text-[#ef4444]' : 'text-white'}`}>
              {event.players}/{event.maxPlayers}
            </span>
          </div>
          <div className="h-1.5 bg-[#2a3a4d] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? 'bg-[#ef4444]' : 'bg-[#4ade80]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

const EventsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    skillLevel: 'all',
  });

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
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.type !== 'all') params.event_type = reverseEventTypeMap[filters.type] || filters.type;
        if (filters.skillLevel !== 'all') params.skill_level = filters.skillLevel;

        const response = await eventsAPI.getAll(params);
        const eventsData = response.data?.events || response.events || [];

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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#a855f7]/20 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Upcoming <span className="text-[#4ade80]">Events</span>
                </h1>
                <p className="text-sm text-[#64748b]">
                  {events.length} events • Find pickup games, tournaments, and more
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <Link
                to="/events/create"
                className="px-5 py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center gap-2 self-start lg:self-center"
              >
                <FiPlus className="w-5 h-5" />
                Create Event
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <FilterTab
                active={filters.type === 'all'}
                onClick={() => setFilters({ ...filters, type: 'all' })}
              >
                All Types
              </FilterTab>
              <FilterTab
                active={filters.type === 'pickup'}
                onClick={() => setFilters({ ...filters, type: 'pickup' })}
              >
                Pickup
              </FilterTab>
              <FilterTab
                active={filters.type === 'tournament'}
                onClick={() => setFilters({ ...filters, type: 'tournament' })}
              >
                Tournament
              </FilterTab>
              <FilterTab
                active={filters.type === 'training'}
                onClick={() => setFilters({ ...filters, type: 'training' })}
              >
                Training
              </FilterTab>
            </div>

            {/* View Toggle */}
            <div className="flex border border-[#2a3a4d] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-[#1a5f2a] text-[#4ade80]' : 'bg-[#141c28] text-[#64748b] hover:text-white'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-[#1a5f2a] text-[#4ade80]' : 'bg-[#141c28] text-[#64748b] hover:text-white'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredEvents.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-16 text-center">
            <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
              <GiSoccerBall className="w-10 h-10 text-[#64748b]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
            <p className="text-[#64748b] mb-6">Try adjusting your filters or check back later</p>
            <button
              onClick={() => setFilters({ search: '', type: 'all', skillLevel: 'all' })}
              className="px-4 py-2 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg hover:bg-[#1c2430] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden lg:flex items-center gap-4 px-4 py-3 bg-[#141c28] border-b border-[#1c2430] text-xs text-[#64748b] uppercase tracking-wider">
              <div className="w-16" />
              <div className="flex-1">Event</div>
              <div className="w-24 text-center">Type</div>
              <div className="w-28 text-center">Skill</div>
              <div className="w-32 text-center">Capacity</div>
              <div className="w-16 text-right">Price</div>
            </div>

            {/* Events List */}
            <div className="p-4 space-y-3">
              {filteredEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-[#141c28] border-t border-[#1c2430] flex items-center justify-between text-xs text-[#64748b]">
              <span>Showing {filteredEvents.length} of {events.length} events</span>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
