import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiUsers,
  FiMapPin,
  FiStar,
  FiChevronDown,
  FiCalendar,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { Card, Badge, Button, Input, Loading, EmptyState, Avatar } from '../components/common';
import useAuthStore from '../store/authStore';
import { teamsAPI } from '../api';

const TeamsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    recruiting: 'all',
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        // Build API params from filters
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.level !== 'all') params.skill_level = filters.level;
        if (filters.recruiting === 'yes') params.recruiting = true;
        if (filters.recruiting === 'no') params.recruiting = false;

        const response = await teamsAPI.getAll(params);
        const teamsData = response.data?.teams || response.teams || [];

        // Transform API data to match component expectations
        const transformedTeams = teamsData.map(team => ({
          id: team._id || team.id,
          name: team.team_name || team.name,
          logo: team.logo || null,
          level: team.skill_level || team.level || 'recreational',
          location: team.location?.city || team.location || 'Unknown',
          members: team.members?.length || team.members || 0,
          wins: team.stats?.wins || team.wins || 0,
          losses: team.stats?.losses || team.losses || 0,
          draws: team.stats?.draws || team.draws || 0,
          recruiting: team.recruiting_status?.is_recruiting ?? team.recruiting ?? false,
          recruitingPositions: team.recruiting_status?.positions || team.recruitingPositions || [],
          captain: {
            name: team.captain?.first_name
              ? `${team.captain.first_name} ${team.captain.last_name || ''}`.trim()
              : team.captain?.name || 'Unknown',
            avatar: team.captain?.profile_image || team.captain?.avatar || null,
          },
          rating: team.rating || 0,
          founded: team.founded_year || team.founded || new Date(team.createdAt).getFullYear() || 'N/A',
        }));

        setTeams(transformedTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getLevelColor = (level) => {
    switch (level) {
      case 'recreational':
        return 'success';
      case 'intermediate':
        return 'accent';
      case 'competitive':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Client-side filtering (API may not support all filters)
  const filteredTeams = teams.filter((team) => {
    if (filters.search && !team.name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.level !== 'all' && team.level?.toLowerCase() !== filters.level.toLowerCase()) {
      return false;
    }
    if (filters.recruiting === 'yes' && !team.recruiting) {
      return false;
    }
    if (filters.recruiting === 'no' && team.recruiting) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            <span className="gradient-text">Teams</span>
          </h1>
          <p className="text-dark-400">
            Find teams looking for players or create your own.
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/teams/create" className="btn-primary">
            <FiPlus /> Create Team
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search teams..."
              leftIcon={<FiSearch size={18} />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'ring-2 ring-primary-500' : ''}
          >
            <FiFilter />
            Filters
            <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <Card className="animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Level</label>
                <select
                  className="input"
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                >
                  <option value="all">All Levels</option>
                  <option value="recreational">Recreational</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="competitive">Competitive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Recruiting</label>
                <select
                  className="input"
                  value={filters.recruiting}
                  onChange={(e) => setFilters({ ...filters, recruiting: e.target.value })}
                >
                  <option value="all">All Teams</option>
                  <option value="yes">Currently Recruiting</option>
                  <option value="no">Not Recruiting</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No teams found"
          description="Try adjusting your filters or create a new team."
          action={() => setFilters({ search: '', level: 'all', recruiting: 'all' })}
          actionLabel="Clear Filters"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="card-hover group"
            >
              {/* Team Logo */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <GiWhistle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={getLevelColor(team.level)} size="sm">
                      {team.level}
                    </Badge>
                    {team.recruiting && (
                      <Badge variant="success" size="sm">
                        Recruiting
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-dark-800/50 rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-400">{team.wins}</p>
                  <p className="text-xs text-dark-400">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-dark-400">{team.draws}</p>
                  <p className="text-xs text-dark-400">Draws</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-400">{team.losses}</p>
                  <p className="text-xs text-dark-400">Losses</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-dark-400 mb-4">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  {team.location}
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  {team.members} members
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Founded {team.founded}
                </div>
              </div>

              {/* Captain & Rating */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <div className="flex items-center gap-2">
                  <Avatar src={team.captain.avatar} name={team.captain.name} size="xs" />
                  <span className="text-sm text-dark-400">{team.captain.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-accent-400 fill-accent-400" />
                  <span className="text-sm font-medium text-white">{team.rating}</span>
                </div>
              </div>

              {/* Recruiting Positions */}
              {team.recruiting && team.recruitingPositions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <p className="text-xs text-dark-400 mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-2">
                    {team.recruitingPositions.map((pos, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full">
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
