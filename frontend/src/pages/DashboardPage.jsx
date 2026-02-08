import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiMapPin,
  FiPlus,
  FiArrowRight,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiActivity,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import useAuthStore from '../store/authStore';
import { Loading } from '../components/common';
import { teamsAPI, eventsAPI } from '../api';

// Stat Cell Component
const StatCell = ({ icon: Icon, value, label, color, trend }) => ( // eslint-disable-line no-unused-vars
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-xl p-3 sm:p-5">
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
      </div>
      {trend && (
        <span className="text-[10px] sm:text-xs text-[#4ade80] bg-[#1a5f2a]/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
          {trend}
        </span>
      )}
    </div>
    <p className="text-xl sm:text-3xl font-bold text-white font-mono mb-1">{value}</p>
    <p className="text-[10px] sm:text-xs text-[#64748b] uppercase tracking-wider truncate">{label}</p>
  </div>
);

// Quick Action Button
const QuickAction = ({ to, icon: Icon, label, code, color }) => ( // eslint-disable-line no-unused-vars
  <Link
    to={to}
    className="group flex items-center gap-3 p-3 sm:p-4 bg-[#0d1219] border border-[#1c2430] rounded-xl hover:border-[#2a3a4d] transition-all"
  >
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white group-hover:text-[#4ade80] transition-colors text-sm sm:text-base truncate">{label}</p>
      <p className="text-[10px] sm:text-xs font-mono text-[#64748b] uppercase">{code}</p>
    </div>
    <FiArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#4ade80] group-hover:translate-x-1 transition-all flex-shrink-0" />
  </Link>
);

// Event Row Component
const EventRow = ({ event }) => {
  const dateStr = new Date(event.date || event.start_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const statusColors = {
    pending: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', label: 'PENDING' },
    approved: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', label: 'CONFIRMED' },
    going: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', label: 'GOING' },
  };

  const status = statusColors[event.user_status] || statusColors.going;

  return (
    <Link
      to={`/events/${event._id || event.id}`}
      className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0d1219] border border-[#1c2430] rounded-xl hover:border-[#2a3a4d] transition-all"
    >
      {/* Date Box */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#141c28] border border-[#2a3a4d] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[10px] sm:text-xs text-[#64748b] uppercase">{dateStr.split(' ')[0]}</span>
        <span className="text-base sm:text-lg font-bold text-white font-mono">{dateStr.split(' ')[2]}</span>
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white group-hover:text-[#4ade80] transition-colors truncate text-sm sm:text-base">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 sm:gap-4 mt-1 text-[10px] sm:text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3 flex-shrink-0" />
            {event.time || event.start_time}
          </span>
          <span className="flex items-center gap-1 truncate">
            <FiMapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.location?.name || event.location || 'TBD'}</span>
          </span>
        </div>
      </div>

      {/* Status */}
      <div className={`px-2 sm:px-3 py-1 rounded-lg ${status.bg} flex-shrink-0`}>
        <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Capacity - Hidden on small screens */}
      <div className="hidden md:flex items-center gap-2 text-sm flex-shrink-0">
        <FiUsers className="w-4 h-4 text-[#64748b]" />
        <span className="font-mono text-white">
          {event.participants?.length || event.attendees?.length || 0}
        </span>
        <span className="text-[#64748b]">/</span>
        <span className="font-mono text-[#64748b]">
          {event.max_participants || '?'}
        </span>
      </div>
    </Link>
  );
};

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [_myTeam, setMyTeam] = useState(null); // eslint-disable-line no-unused-vars
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      gamesPlayed: 0,
      upcomingGames: 0,
      teamsJoined: 0,
      unreadMessages: 0,
    },
    teams: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const [teamRes, eventsRes] = await Promise.all([
          teamsAPI.getMyTeam().catch(() => ({ team: null })),
          eventsAPI.getAttending().catch(() => ({ events: [] })),
        ]);

        const team = teamRes?.data?.team || teamRes?.team || null;
        const events = eventsRes?.data?.events || eventsRes?.events || [];

        setMyTeam(team);
        setUpcomingEvents(events);

        setDashboardData({
          stats: {
            gamesPlayed: user?.stats?.games_played || 0,
            upcomingGames: events.length,
            teamsJoined: team ? 1 : 0,
            unreadMessages: 0,
          },
          teams: team ? [{
            id: team._id,
            name: team.team_name || team.name,
            role: team.members?.find(m => m.user === user?._id || m.user?._id === user?._id)?.role || 'Member',
            members: team.members?.length || 0,
          }] : [],
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const quickActions = [
    { label: 'My Player Card', code: 'PLR-CARD', icon: FiAward, to: `/players/${user?._id}`, color: '#f59e0b' },
    { label: 'Find Games', code: 'EVT-FIND', icon: FiCalendar, to: '/events', color: '#a855f7' },
    { label: 'Browse Teams', code: 'TMS-BROW', icon: FiUsers, to: '/teams', color: '#22c55e' },
    { label: 'Find Fields', code: 'FLD-FIND', icon: FiMapPin, to: '/fields', color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1a5f2a] rounded-xl flex items-center justify-center flex-shrink-0">
                <GiSoccerBall className="w-6 h-6 sm:w-8 sm:h-8 text-[#4ade80]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                    Welcome, <span className="text-[#4ade80]">{user?.first_name || 'Player'}</span>
                  </h1>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748b] truncate">
                  Here's what's happening in your soccer world
                </p>
              </div>
            </div>
            <Link
              to="/events/create"
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base sm:self-start"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
          <StatCell
            icon={GiSoccerBall}
            value={dashboardData.stats.gamesPlayed}
            label="Games Played"
            color="#22c55e"
          />
          <StatCell
            icon={FiCalendar}
            value={dashboardData.stats.upcomingGames}
            label="Upcoming"
            color="#a855f7"
          />
          <StatCell
            icon={FiUsers}
            value={dashboardData.stats.teamsJoined}
            label="Teams"
            color="#3b82f6"
          />
          <StatCell
            icon={FiMessageSquare}
            value={dashboardData.stats.unreadMessages}
            label="Messages"
            color="#f59e0b"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <FiZap className="w-4 h-4 text-[#4ade80]" />
            <h2 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1c2430]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#a855f7]/20 flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-4 h-4 text-[#a855f7]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white text-sm sm:text-base">Upcoming Events</h2>
                    <p className="text-[10px] sm:text-xs text-[#64748b]">{upcomingEvents.length} scheduled</p>
                  </div>
                </div>
                <Link
                  to="/events"
                  className="text-xs sm:text-sm text-[#4ade80] hover:text-[#22c55e] flex items-center gap-1 flex-shrink-0"
                >
                  View all <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>

              {/* Events List */}
              <div className="p-3 sm:p-4 space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FiCalendar className="w-7 h-7 sm:w-8 sm:h-8 text-[#64748b]" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#64748b] mb-3 sm:mb-4">No upcoming events</p>
                    <Link
                      to="/events"
                      className="text-xs sm:text-sm text-[#4ade80] hover:text-[#22c55e]"
                    >
                      Browse available games
                    </Link>
                  </div>
                ) : (
                  upcomingEvents.slice(0, 5).map((event) => (
                    <EventRow key={event._id || event.id} event={event} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Teams */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1c2430]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
                    <FiUsers className="w-4 h-4 text-[#22c55e]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white text-sm sm:text-base">My Teams</h2>
                    <p className="text-[10px] sm:text-xs text-[#64748b]">{dashboardData.teams.length} teams</p>
                  </div>
                </div>
                <Link
                  to="/teams"
                  className="text-xs sm:text-sm text-[#4ade80] hover:text-[#22c55e] flex items-center gap-1 flex-shrink-0"
                >
                  Browse <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>

              <div className="p-3 sm:p-4">
                {dashboardData.teams.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <GiWhistle className="w-6 h-6 sm:w-7 sm:h-7 text-[#64748b]" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#64748b] mb-4">Not on a team yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.teams.map((team) => (
                      <Link
                        key={team.id}
                        to={`/teams/${team.id}`}
                        className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#141c28] border border-[#2a3a4d] rounded-xl hover:border-[#3d4f63] transition-all"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1a5f2a] flex items-center justify-center flex-shrink-0">
                          <GiWhistle className="w-5 h-5 sm:w-6 sm:h-6 text-[#4ade80]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-white group-hover:text-[#4ade80] transition-colors truncate">
                            {team.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-[#64748b]">{team.members} members</p>
                        </div>
                        <span className={`text-[10px] sm:text-xs px-2 py-1 rounded uppercase tracking-wider flex-shrink-0 ${
                          team.role === 'captain' || team.role === 'Captain'
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                            : 'bg-[#3b82f6]/10 text-[#3b82f6]'
                        }`}>
                          {team.role}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  to="/teams/create"
                  className="mt-3 sm:mt-4 w-full py-2.5 sm:py-3 bg-[#141c28] border border-[#2a3a4d] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#1c2430] hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Team
                </Link>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-5 border-b border-[#1c2430]">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0">
                  <FiActivity className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-white text-sm sm:text-base">Recent Activity</h2>
                  <p className="text-[10px] sm:text-xs text-[#64748b]">Your latest actions</p>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiTrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[#64748b]" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748b]">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
