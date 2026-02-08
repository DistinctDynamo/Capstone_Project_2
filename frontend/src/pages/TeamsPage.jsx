import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiMapPin,
  FiStar,
  FiCalendar,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { teamsAPI } from '../api';

// Filter Tab Component
const FilterTab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
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

// Team Row Component
const TeamRow = ({ team }) => {
  const levelColors = {
    recreational: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    intermediate: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    competitive: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  };

  const level = levelColors[team.level?.toLowerCase()] || levelColors.recreational;

  return (
    <Link
      to={`/teams/${team.id}`}
      className="group flex items-center gap-4 p-4 bg-[#0d1219] border border-[#1c2430] rounded-xl hover:border-[#2a3a4d] transition-all"
    >
      {/* Team Logo */}
      <div className="w-14 h-14 bg-[#1a5f2a] rounded-xl flex items-center justify-center flex-shrink-0">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <GiWhistle className="w-7 h-7 text-[#4ade80]" />
        )}
      </div>

      {/* Team Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors truncate">
            {team.name}
          </h3>
          {team.recruiting && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <FiMapPin className="w-3 h-3" />
            {team.location}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers className="w-3 h-3" />
            {team.members} members
          </span>
          <span className="flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            Est. {team.founded}
          </span>
        </div>
      </div>

      {/* Level Badge */}
      <div className={`hidden sm:block px-3 py-1 rounded-lg ${level.bg}`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${level.text}`}>
          {team.level}
        </span>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-sm font-mono">
        <div className="text-center">
          <p className="text-[#22c55e] font-bold">{team.wins}</p>
          <p className="text-[10px] text-[#64748b] uppercase">W</p>
        </div>
        <div className="text-center">
          <p className="text-[#64748b] font-bold">{team.draws}</p>
          <p className="text-[10px] text-[#64748b] uppercase">D</p>
        </div>
        <div className="text-center">
          <p className="text-[#ef4444] font-bold">{team.losses}</p>
          <p className="text-[10px] text-[#64748b] uppercase">L</p>
        </div>
      </div>

      {/* Rating */}
      <div className="hidden lg:flex items-center gap-1 text-sm">
        <FiStar className="w-4 h-4 text-[#f59e0b]" />
        <span className="font-mono text-white">{team.rating || '—'}</span>
      </div>

      {/* Recruiting Status */}
      {team.recruiting && (
        <div className="hidden xl:block px-3 py-1 rounded-lg bg-[#22c55e]/10">
          <span className="text-xs font-medium text-[#22c55e] uppercase tracking-wider">
            Recruiting
          </span>
        </div>
      )}
    </Link>
  );
};

const TeamsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    recruiting: 'all',
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.level !== 'all') params.skill_level = filters.level;
        if (filters.recruiting === 'yes') params.recruiting = true;
        if (filters.recruiting === 'no') params.recruiting = false;

        const response = await teamsAPI.getAll(params);
        const teamsData = response.data?.teams || response.teams || [];

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

  // Client-side filtering
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

  const recruitingCount = teams.filter(t => t.recruiting).length;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#22c55e]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-[#22c55e]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  <span className="text-[#4ade80]">Teams</span> Directory
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  {teams.length} teams registered • {recruitingCount} recruiting
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <Link
                to="/teams/create"
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Team
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search teams..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 text-sm sm:text-base"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Level Filter - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap scrollbar-hide">
              <FilterTab
                active={filters.level === 'all'}
                onClick={() => setFilters({ ...filters, level: 'all' })}
              >
                All Levels
              </FilterTab>
              <FilterTab
                active={filters.level === 'recreational'}
                onClick={() => setFilters({ ...filters, level: 'recreational' })}
              >
                Recreational
              </FilterTab>
              <FilterTab
                active={filters.level === 'intermediate'}
                onClick={() => setFilters({ ...filters, level: 'intermediate' })}
              >
                Intermediate
              </FilterTab>
              <FilterTab
                active={filters.level === 'competitive'}
                onClick={() => setFilters({ ...filters, level: 'competitive' })}
              >
                Competitive
              </FilterTab>

              {/* Recruiting Filter */}
              <FilterTab
                active={filters.recruiting === 'yes'}
                onClick={() => setFilters({
                  ...filters,
                  recruiting: filters.recruiting === 'yes' ? 'all' : 'yes'
                })}
                count={recruitingCount}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                </span>
                Recruiting
              </FilterTab>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-[#141c28] border-b border-[#1c2430] text-xs text-[#64748b] uppercase tracking-wider">
            <div className="w-14" />
            <div className="flex-1">Team</div>
            <div className="w-24 text-center hidden sm:block">Level</div>
            <div className="w-28 text-center">Record</div>
            <div className="w-16 text-center hidden lg:block">Rating</div>
            <div className="w-24 text-center hidden xl:block">Status</div>
          </div>

          {/* Teams List */}
          <div className="p-4 space-y-3">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
                  <GiSoccerBall className="w-10 h-10 text-[#64748b]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No teams found</h3>
                <p className="text-[#64748b] mb-6">Try adjusting your filters or create a new team</p>
                <button
                  onClick={() => setFilters({ search: '', level: 'all', recruiting: 'all' })}
                  className="px-4 py-2 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg hover:bg-[#1c2430] transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <TeamRow key={team.id} team={team} />
              ))
            )}
          </div>

          {/* Footer Stats */}
          {filteredTeams.length > 0 && (
            <div className="px-4 py-3 bg-[#141c28] border-t border-[#1c2430] flex items-center justify-between text-xs text-[#64748b]">
              <span>Showing {filteredTeams.length} of {teams.length} teams</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  {recruitingCount} recruiting
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
