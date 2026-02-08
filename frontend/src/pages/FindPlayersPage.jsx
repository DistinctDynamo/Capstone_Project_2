import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiSend, FiChevronLeft, FiChevronRight, FiMessageSquare, FiX } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { usersAPI, teamsAPI, messagesAPI } from '../api';

const FindPlayersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    skill_level: '',
    available: 'true',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [invitingPlayerId, setInvitingPlayerId] = useState(null);
  const [messagingPlayerId, setMessagingPlayerId] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchMyTeam = async () => {
      if (!isAuthenticated || !user?.team) return;
      try {
        const response = await teamsAPI.getMyTeam();
        setMyTeam(response.data?.team || response.team);
      } catch (error) {
        console.error('Error fetching team:', error);
      }
    };
    fetchMyTeam();
  }, [isAuthenticated, user]);

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      if (searchQuery) params.search = searchQuery;
      const response = await usersAPI.getAll(params);
      setPlayers(response.data?.users || response.users || []);
      setPagination(response.data?.pagination || response.pagination);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, searchQuery]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPlayers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInvitePlayer = async (e, playerId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!myTeam) {
      toast.error('You need a team to invite players');
      return;
    }
    setInvitingPlayerId(playerId);
    try {
      await teamsAPI.invite(myTeam._id || myTeam.id, playerId);
      toast.success('Invitation sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite');
    } finally {
      setInvitingPlayerId(null);
    }
  };

  const canInvite = myTeam && ['owner', 'captain'].includes(user?.team_role);

  const handleMessagePlayer = async (e, playerId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to message players');
      return;
    }
    setMessagingPlayerId(playerId);
    try {
      const response = await messagesAPI.createConversation({ participantId: playerId, type: 'direct' });
      const conversation = response.data?.conversation || response.conversation;
      navigate(`/messages?conversation=${conversation._id || conversation.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    } finally {
      setMessagingPlayerId(null);
    }
  };

  const getSkillColor = (level) => {
    switch (level) {
      case 'competitive': return { bg: '#22c55e', text: '#4ade80' };
      case 'intermediate': return { bg: '#f59e0b', text: '#fbbf24' };
      default: return { bg: '#64748b', text: '#94a3b8' };
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'goalkeeper': return { bg: '#a855f7', text: '#c084fc' };
      case 'defender': return { bg: '#3b82f6', text: '#60a5fa' };
      case 'midfielder': return { bg: '#22c55e', text: '#4ade80' };
      case 'forward': return { bg: '#ef4444', text: '#f87171' };
      default: return { bg: '#64748b', text: '#94a3b8' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">FIND PLAYERS</h1>
          </div>
          <p className="text-[#64748b] text-xs sm:text-sm">Discover players to join your team</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden mb-4 sm:mb-6">
          <div className="px-3 sm:px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#64748b]">Search & Filter</span>
            <div className="flex items-center gap-2">
              {Object.values(filters).some(v => v) && (
                <button
                  onClick={() => setFilters({ position: '', skill_level: '', available: 'true' })}
                  className="text-xs text-[#ef4444] hover:text-[#f87171] transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg pl-10 pr-4 py-2.5 sm:py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors text-sm sm:text-base"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all ${
                  showFilters
                    ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25'
                    : 'bg-[#141c28] border border-[#2a3a4d] text-[#94a3b8] hover:text-white'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1c2430]">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-2">Position</label>
                  <select
                    className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#22c55e] text-sm"
                    value={filters.position}
                    onChange={(e) => setFilters(f => ({ ...f, position: e.target.value }))}
                  >
                    <option value="">All Positions</option>
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-2">Skill Level</label>
                  <select
                    className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#22c55e] text-sm"
                    value={filters.skill_level}
                    onChange={(e) => setFilters(f => ({ ...f, skill_level: e.target.value }))}
                  >
                    <option value="">All Levels</option>
                    <option value="recreational">Recreational</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="competitive">Competitive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-2">Availability</label>
                  <select
                    className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#22c55e] text-sm"
                    value={filters.available}
                    onChange={(e) => setFilters(f => ({ ...f, available: e.target.value }))}
                  >
                    <option value="true">Available Only</option>
                    <option value="">All Players</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Players Table/Cards */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
          {/* Table Header - Hidden on Mobile */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 px-4 py-3 bg-[#141c28] border-b border-[#1c2430] text-xs uppercase tracking-wider text-[#64748b]">
            <div className="col-span-4">Player</div>
            <div className="col-span-2">Position</div>
            <div className="col-span-2">Level</div>
            <div className="col-span-2">Stats</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#64748b]">Loading players...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-16">
              <FiSearch className="w-12 h-12 text-[#2a3a4d] mx-auto mb-4" />
              <p className="text-white font-medium mb-2">No players found</p>
              <p className="text-[#64748b] text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1c2430]">
              {players.map((player) => {
                const id = player._id || player.id;
                const name = player.first_name
                  ? `${player.first_name} ${player.last_name || ''}`.trim()
                  : player.username;
                const stats = player.stats || {};
                const posColor = getPositionColor(player.position);
                const skillColor = getSkillColor(player.skill_level);

                return (
                  <Link
                    key={id}
                    to={`/players/${id}`}
                    className="block hover:bg-[#141c28]/50 transition-colors"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#141c28] border border-[#2a3a4d] overflow-hidden flex-shrink-0">
                          {player.avatar ? (
                            <img
                              src={player.avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#4ade80] font-bold text-lg">
                              {name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{name}</p>
                          <p className="text-xs text-[#64748b] font-mono">@{player.username}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {player.position && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                                style={{ backgroundColor: posColor.bg + '20', color: posColor.text }}
                              >
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: posColor.text }} />
                                {player.position}
                              </span>
                            )}
                            {player.skill_level && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                                style={{ backgroundColor: skillColor.bg + '20', color: skillColor.text }}
                              >
                                {player.skill_level}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isAuthenticated && id !== user?._id && (
                            <button
                              onClick={(e) => handleMessagePlayer(e, id)}
                              disabled={messagingPlayerId === id}
                              className="p-2 rounded-lg bg-[#141c28] border border-[#2a3a4d] text-[#64748b] hover:text-[#4ade80] transition-colors disabled:opacity-50"
                              title="Message"
                            >
                              {messagingPlayerId === id ? (
                                <div className="w-4 h-4 border-2 border-[#64748b] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiMessageSquare className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {canInvite && !player.team && (
                            <button
                              onClick={(e) => handleInvitePlayer(e, id)}
                              disabled={invitingPlayerId === id}
                              className="p-2 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#4ade80] hover:bg-[#22c55e]/30 transition-colors disabled:opacity-50"
                              title="Invite"
                            >
                              {invitingPlayerId === id ? (
                                <div className="w-4 h-4 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiSend className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Mobile Stats Row */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1c2430]/50">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-white font-bold font-mono">{stats.games_played || 0}</span>
                          <span className="text-[#64748b]">GP</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[#f59e0b] font-bold font-mono">{stats.goals || 0}</span>
                          <span className="text-[#64748b]">Goals</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-[#3b82f6] font-bold font-mono">{stats.assists || 0}</span>
                          <span className="text-[#64748b]">Assists</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-12 gap-2 px-4 py-4 items-center">
                      {/* Player Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#141c28] border border-[#2a3a4d] overflow-hidden flex-shrink-0">
                          {player.avatar ? (
                            <img
                              src={player.avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#4ade80] font-bold text-lg">
                              {name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{name}</p>
                          <p className="text-xs text-[#64748b] font-mono truncate">@{player.username}</p>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="col-span-2">
                        {player.position ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium capitalize"
                            style={{ backgroundColor: posColor.bg + '20', color: posColor.text, border: `1px solid ${posColor.bg}30` }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: posColor.text }} />
                            {player.position}
                          </span>
                        ) : (
                          <span className="text-[#4b5563]">—</span>
                        )}
                      </div>

                      {/* Skill Level */}
                      <div className="col-span-2">
                        {player.skill_level ? (
                          <span
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize"
                            style={{ backgroundColor: skillColor.bg + '20', color: skillColor.text, border: `1px solid ${skillColor.bg}30` }}
                          >
                            {player.skill_level}
                          </span>
                        ) : (
                          <span className="text-[#4b5563]">—</span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="col-span-2 flex items-center gap-4 text-xs">
                        <div className="text-center">
                          <span className="text-white font-bold font-mono">{stats.games_played || 0}</span>
                          <span className="text-[#64748b] ml-1">GP</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[#f59e0b] font-bold font-mono">{stats.goals || 0}</span>
                          <span className="text-[#64748b] ml-1">G</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[#3b82f6] font-bold font-mono">{stats.assists || 0}</span>
                          <span className="text-[#64748b] ml-1">A</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {isAuthenticated && id !== user?._id && (
                          <button
                            onClick={(e) => handleMessagePlayer(e, id)}
                            disabled={messagingPlayerId === id}
                            className="p-2 rounded-lg bg-[#141c28] border border-[#2a3a4d] text-[#64748b] hover:text-[#4ade80] hover:border-[#22c55e]/30 transition-colors disabled:opacity-50"
                            title="Message"
                          >
                            {messagingPlayerId === id ? (
                              <div className="w-4 h-4 border-2 border-[#64748b] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiMessageSquare className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {canInvite && !player.team && (
                          <button
                            onClick={(e) => handleInvitePlayer(e, id)}
                            disabled={invitingPlayerId === id}
                            className="p-2 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#4ade80] hover:bg-[#22c55e]/30 transition-colors disabled:opacity-50"
                            title="Invite to team"
                          >
                            {invitingPlayerId === id ? (
                              <div className="w-4 h-4 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiSend className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-[#64748b]">
              Showing <span className="text-white font-mono">{((page - 1) * 20) + 1}</span>-<span className="text-white font-mono">{Math.min(page * 20, pagination.total)}</span> of <span className="text-white font-mono">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg bg-[#0d1219] border border-[#1c2430] text-[#64748b] hover:text-white hover:bg-[#141c28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-sm text-white font-mono">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= pagination.pages}
                className="p-2 rounded-lg bg-[#0d1219] border border-[#1c2430] text-[#64748b] hover:text-white hover:bg-[#141c28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayersPage;
