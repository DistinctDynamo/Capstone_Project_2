import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiSend, FiChevronLeft, FiChevronRight, FiMessageSquare } from 'react-icons/fi';
import { Button, Loading, EmptyState } from '../components/common';
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

  // Fetch user's team
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

  // Fetch players
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPlayers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle invite
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

  // Handle message
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Find Players</h1>
        <p className="text-dark-400 text-sm">Discover players to join your team</p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-dark-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-dark-700">
            <select
              className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
              value={filters.position}
              onChange={(e) => setFilters(f => ({ ...f, position: e.target.value }))}
            >
              <option value="">All Positions</option>
              <option value="goalkeeper">Goalkeeper</option>
              <option value="defender">Defender</option>
              <option value="midfielder">Midfielder</option>
              <option value="forward">Forward</option>
            </select>
            <select
              className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
              value={filters.skill_level}
              onChange={(e) => setFilters(f => ({ ...f, skill_level: e.target.value }))}
            >
              <option value="">All Levels</option>
              <option value="recreational">Recreational</option>
              <option value="intermediate">Intermediate</option>
              <option value="competitive">Competitive</option>
            </select>
            <select
              className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
              value={filters.available}
              onChange={(e) => setFilters(f => ({ ...f, available: e.target.value }))}
            >
              <option value="true">Available Only</option>
              <option value="">All Players</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-dark-900 border-b border-dark-700 text-xs font-medium text-dark-400 uppercase tracking-wider">
          <div className="col-span-3">Player</div>
          <div className="col-span-2">Position</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2 text-center">Stats</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="md" />
          </div>
        ) : players.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No players found"
              description="Try adjusting your filters"
            />
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {players.map((player) => {
              const id = player._id || player.id;
              const name = player.first_name
                ? `${player.first_name} ${player.last_name || ''}`.trim()
                : player.username;
              const stats = player.stats || {};

              return (
                <Link
                  key={id}
                  to={`/players/${id}`}
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-dark-700/50 transition-colors"
                >
                  {/* Player Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-dark-700 overflow-hidden flex-shrink-0">
                      <img
                        src={player.avatar || '/images/player-silhouette.png'}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/images/player-silhouette.png'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{name}</p>
                      <p className="text-dark-400 text-xs truncate">@{player.username}</p>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="col-span-2">
                    {player.position ? (
                      <span className="inline-block px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs font-medium capitalize">
                        {player.position}
                      </span>
                    ) : (
                      <span className="text-dark-500 text-sm">—</span>
                    )}
                  </div>

                  {/* Skill Level */}
                  <div className="col-span-2">
                    {player.skill_level ? (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                        player.skill_level === 'competitive' ? 'bg-green-500/20 text-green-400' :
                        player.skill_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-dark-600 text-dark-300'
                      }`}>
                        {player.skill_level}
                      </span>
                    ) : (
                      <span className="text-dark-500 text-sm">—</span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="col-span-2 text-dark-300 text-sm truncate">
                    {player.location || '—'}
                  </div>

                  {/* Stats */}
                  <div className="col-span-2 flex items-center justify-center gap-3 text-xs">
                    <div className="text-center">
                      <span className="text-white font-medium">{stats.games_played || 0}</span>
                      <span className="text-dark-500 ml-1">GP</span>
                    </div>
                    <div className="text-center">
                      <span className="text-white font-medium">{stats.goals || 0}</span>
                      <span className="text-dark-500 ml-1">G</span>
                    </div>
                    <div className="text-center">
                      <span className="text-white font-medium">{stats.assists || 0}</span>
                      <span className="text-dark-500 ml-1">A</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {isAuthenticated && id !== user?._id && (
                      <button
                        onClick={(e) => handleMessagePlayer(e, id)}
                        disabled={messagingPlayerId === id}
                        className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 hover:text-white transition-colors disabled:opacity-50"
                        title="Message"
                      >
                        {messagingPlayerId === id ? (
                          <div className="w-4 h-4 border-2 border-dark-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiMessageSquare className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {canInvite && !player.team && (
                      <button
                        onClick={(e) => handleInvitePlayer(e, id)}
                        disabled={invitingPlayerId === id}
                        className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors disabled:opacity-50"
                        title="Invite to team"
                      >
                        {invitingPlayerId === id ? (
                          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiSend className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-dark-400">
            Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-dark-300 px-3">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.pages}
              className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPlayersPage;
