import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiUsers,
  FiCalendar,
  FiShoppingBag,
  FiTrendingUp,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiActivity,
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { Card, Badge, Loading } from '../../components/common';
import { adminAPI } from '../../api';

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes, teamsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getPendingEvents(),
          adminAPI.getPendingTeams(),
        ]);

        setStats(statsRes.data.data);
        setPendingEvents(eventsRes.data.data.events || []);
        setPendingTeams(teamsRes.data.data.teams || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total || 0,
      subValue: `${stats?.users?.active || 0} active`,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      label: 'Total Teams',
      value: stats?.teams?.total || 0,
      subValue: `${stats?.teams?.pending || 0} pending`,
      icon: GiSoccerBall,
      color: 'from-primary-500 to-emerald-600',
      bgColor: 'bg-primary-500/20',
      textColor: 'text-primary-400',
    },
    {
      label: 'Total Events',
      value: stats?.events?.total || 0,
      subValue: `${stats?.events?.pending || 0} pending`,
      icon: FiCalendar,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
    },
    {
      label: 'Pending Approvals',
      value: (stats?.teams?.pending || 0) + (stats?.events?.pending || 0),
      subValue: 'Needs attention',
      icon: FiClock,
      color: 'from-accent-500 to-orange-600',
      bgColor: 'bg-accent-500/20',
      textColor: 'text-accent-400',
    },
  ];

  const totalPending = pendingEvents.length + pendingTeams.length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-dark-400">
          Overview of your Soccer Connect platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className={`text-sm ${stat.textColor} mt-1`}>{stat.subValue}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {totalPending > 0 && (
        <Card className="mb-8 border-accent-500/30 bg-accent-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {totalPending} items awaiting approval
                </h3>
                <p className="text-sm text-dark-400">
                  {pendingTeams.length} teams and {pendingEvents.length} events need review
                </p>
              </div>
            </div>
            <Link
              to="/admin/pending"
              className="btn-accent whitespace-nowrap"
            >
              Review Now
              <FiArrowRight />
            </Link>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Teams */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <GiSoccerBall className="text-primary-400" />
              Pending Teams
            </h2>
            <Link
              to="/admin/pending"
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
            >
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingTeams.length === 0 ? (
              <div className="text-center py-8 text-dark-400">
                <FiCheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No pending team approvals</p>
              </div>
            ) : (
              pendingTeams.slice(0, 5).map((team) => (
                <div
                  key={team._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <GiSoccerBall className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{team.team_name}</p>
                      <p className="text-sm text-dark-400">
                        by {team.owner?.first_name} {team.owner?.last_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Events */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiCalendar className="text-purple-400" />
              Pending Events
            </h2>
            <Link
              to="/admin/pending"
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
            >
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingEvents.length === 0 ? (
              <div className="text-center py-8 text-dark-400">
                <FiCheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No pending event approvals</p>
              </div>
            ) : (
              pendingEvents.slice(0, 5).map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{event.title}</p>
                      <p className="text-sm text-dark-400">
                        by {event.creator?.first_name} {event.creator?.last_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Platform Activity */}
      <Card className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiActivity className="text-primary-400" />
            Platform Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl bg-dark-800/50">
            <p className="text-3xl font-bold text-white mb-1">
              {stats?.users?.active || 0}
            </p>
            <p className="text-sm text-dark-400">Active Users</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-dark-800/50">
            <p className="text-3xl font-bold text-white mb-1">
              {(stats?.teams?.total || 0) - (stats?.teams?.pending || 0)}
            </p>
            <p className="text-sm text-dark-400">Approved Teams</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-dark-800/50">
            <p className="text-3xl font-bold text-white mb-1">
              {(stats?.events?.total || 0) - (stats?.events?.pending || 0)}
            </p>
            <p className="text-sm text-dark-400">Approved Events</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-dark-800/50">
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round(((stats?.users?.active || 0) / (stats?.users?.total || 1)) * 100)}%
            </p>
            <p className="text-sm text-dark-400">User Activity Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
