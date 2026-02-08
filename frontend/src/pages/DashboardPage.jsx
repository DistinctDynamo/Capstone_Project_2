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
  FiStar,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import useAuthStore from '../store/authStore';
import { Card, Badge, Avatar, Loading } from '../components/common';
import { teamsAPI, eventsAPI } from '../api';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [myTeam, setMyTeam] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [error, setError] = useState(null);

  // Dashboard data with defaults
  const [dashboardData, setDashboardData] = useState({
    stats: {
      gamesPlayed: 0,
      upcomingGames: 0,
      teamsJoined: 0,
      unreadMessages: 0,
    },
    recentActivity: [],
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

        // Update dashboard data based on API responses
        setDashboardData({
          stats: {
            gamesPlayed: user?.stats?.games_played || 0,
            upcomingGames: events.length,
            teamsJoined: team ? 1 : 0,
            unreadMessages: 0, // Would need messages API integration
          },
          recentActivity: [],
          teams: team ? [{
            id: team._id,
            name: team.team_name || team.name,
            role: team.members?.find(m => m.user === user?._id || m.user?._id === user?._id)?.role || 'Member',
            members: team.members?.length || 0,
          }] : [],
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const quickActions = [
    { label: 'My Player Card', icon: FiAward, to: `/players/${user?._id}`, color: 'from-amber-500 to-yellow-600' },
    { label: 'Find Games', icon: FiCalendar, to: '/events', color: 'from-primary-500 to-emerald-600' },
    { label: 'Browse Teams', icon: FiUsers, to: '/teams', color: 'from-purple-500 to-pink-600' },
    { label: 'Find Fields', icon: FiMapPin, to: '/fields', color: 'from-accent-500 to-orange-600' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'join':
        return <GiSoccerBall className="w-5 h-5" />;
      case 'message':
        return <FiMessageSquare className="w-5 h-5" />;
      case 'team':
        return <FiUsers className="w-5 h-5" />;
      case 'rating':
        return <FiStar className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Welcome back, <span className="gradient-text">{user?.first_name || 'Player'}</span>!
            </h1>
            <p className="text-dark-400">
              Here's what's happening in your soccer world.
            </p>
          </div>
          <Link to="/events/create" className="btn-primary">
            <FiPlus />
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
            <GiSoccerBall className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboardData.stats.gamesPlayed}</p>
          <p className="text-sm text-dark-400">Games Played</p>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center mx-auto mb-3">
            <FiCalendar className="w-6 h-6 text-accent-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboardData.stats.upcomingGames}</p>
          <p className="text-sm text-dark-400">Upcoming</p>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <FiUsers className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboardData.stats.teamsJoined}</p>
          <p className="text-sm text-dark-400">Teams</p>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
            <FiMessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboardData.stats.unreadMessages}</p>
          <p className="text-sm text-dark-400">Messages</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className="card-hover group flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{action.label}</p>
              <FiArrowRight className="w-4 h-4 text-dark-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiCalendar className="text-primary-400" />
                Upcoming Events
              </h2>
              <Link to="/events" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  <p>No upcoming events</p>
                  <Link to="/events" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
                    Browse events
                  </Link>
                </div>
              ) : (
                upcomingEvents.slice(0, 5).map((event) => (
                  <Link
                    key={event._id || event.id}
                    to={`/events/${event._id || event.id}`}
                    className="block p-4 rounded-xl bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                            {event.title}
                          </h3>
                          {event.user_status === 'pending' && (
                            <Badge variant="warning" size="sm">Pending</Badge>
                          )}
                          {event.user_status === 'approved' && (
                            <Badge variant="success" size="sm">Confirmed</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-dark-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {new Date(event.date || event.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {event.time || event.start_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            {event.location?.name || event.location || 'TBD'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={(event.participants?.length || event.attendees?.length || 0) >= (event.max_participants || 0) ? 'danger' : 'gray'}
                          size="sm"
                        >
                          {event.participants?.length || event.attendees?.length || 0}/{event.max_participants || '?'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* My Teams */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiUsers className="text-primary-400" />
                My Teams
              </h2>
              <Link to="/teams" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData.teams.length === 0 ? (
                <div className="text-center py-4 text-dark-400">
                  <p>You're not part of any team yet</p>
                </div>
              ) : (
                dashboardData.teams.map((team) => (
                  <Link
                    key={team.id}
                    to={`/teams/${team.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <GiWhistle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{team.name}</p>
                      <p className="text-sm text-dark-400">{team.members} members</p>
                    </div>
                    <Badge variant={team.role === 'captain' || team.role === 'Captain' ? 'accent' : 'gray'} size="sm">
                      {team.role}
                    </Badge>
                  </Link>
                ))
              )}
              <Link to="/teams/create" className="btn-secondary w-full mt-4">
                <FiPlus /> Create Team
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-primary-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {dashboardData.recentActivity.length === 0 ? (
                <p className="text-center text-dark-400 py-4">No recent activity</p>
              ) : (
                dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm text-dark-200">{activity.message}</p>
                      <p className="text-xs text-dark-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
