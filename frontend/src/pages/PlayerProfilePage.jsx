import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiMessageSquare,
  FiSend,
  FiClock,
  FiAward,
  FiActivity,
} from 'react-icons/fi';
import { GiSoccerBall, GiSoccerKick, GiWhistle } from 'react-icons/gi';
import useAuthStore from '../store/authStore';
import { usersAPI, messagesAPI, teamsAPI } from '../api';

// Stadium Control Room Components
const StatBox = ({ value, label, icon: Icon, color = '#4ade80' }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4 text-center relative overflow-hidden">
    <div className="absolute top-2 right-2">
      {Icon && <Icon className="w-4 h-4" style={{ color: color + '60' }} />}
    </div>
    <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
    <p className="text-xs text-[#64748b] uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#1c2430] last:border-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-[#64748b]" />}
      <span className="text-xs uppercase tracking-wider text-[#64748b]">{label}</span>
    </div>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const HistoryRow = ({ teamName, role, joinDate, leftDate }) => (
  <div className="flex items-center gap-4 py-3 px-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]">
    <div className="w-10 h-10 rounded-lg bg-[#0d1219] border border-[#2a3a4d] flex items-center justify-center">
      <GiWhistle className="w-5 h-5 text-[#64748b]" />
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{teamName}</p>
      <p className="text-xs text-[#64748b] capitalize">{role}</p>
    </div>
    <div className="text-right">
      <p className="text-xs text-[#4b5563] font-mono">{joinDate} - {leftDate}</p>
    </div>
  </div>
);

const PlayerProfilePage = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardReveal, setShowCardReveal] = useState(true);
  const [myTeam, setMyTeam] = useState(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;
  const playerId = paramId === 'me' ? currentUserId : paramId;
  const isOwnProfile = currentUserId === playerId || paramId === 'me';

  useEffect(() => {
    const fetchMyTeam = async () => {
      if (!isAuthenticated || !currentUser?.team) return;
      try {
        const response = await teamsAPI.getMyTeam();
        setMyTeam(response.data?.team || response.team);
      } catch (error) {
        console.error('Error fetching team:', error);
      }
    };
    fetchMyTeam();
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (paramId === 'me' && !currentUserId) {
        if (!isAuthenticated) {
          toast.error('Please log in to view your profile');
          setIsLoading(false);
          return;
        }
        return;
      }

      if (!playerId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await usersAPI.getPlayerStats(playerId);
        setPlayerData(response.data);
        setShowCardReveal(true);
        setTimeout(() => setShowCardReveal(false), 2000);
      } catch (error) {
        console.error('Error fetching player data:', error);
        if (error.response?.status === 400) {
          toast.error('Invalid player ID');
        } else if (error.response?.status === 404) {
          toast.error('Player not found');
        } else {
          toast.error('Failed to load player profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId, paramId, currentUser, isAuthenticated]);

  const overallRating = useMemo(() => {
    if (!playerData) return 0;
    return playerData.overall_rating || 50;
  }, [playerData]);

  const tier = useMemo(() => {
    if (overallRating >= 80) return 'gold';
    if (overallRating >= 65) return 'silver';
    return 'bronze';
  }, [overallRating]);

  const tierConfig = {
    gold: { color: '#fbbf24', glow: '#fbbf24', label: 'ELITE' },
    silver: { color: '#94a3b8', glow: '#94a3b8', label: 'PRO' },
    bronze: { color: '#f59e0b', glow: '#f59e0b', label: 'RISING' },
  };

  const getPositionLabel = (position) => {
    switch (position) {
      case 'goalkeeper': return 'GK';
      case 'defender': return 'DEF';
      case 'midfielder': return 'MID';
      case 'forward': return 'FWD';
      default: return 'PLR';
    }
  };

  const handleMessagePlayer = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to message players');
      return;
    }
    setIsMessaging(true);
    try {
      const response = await messagesAPI.createConversation({ participantId: playerId, type: 'direct' });
      const conversation = response.data?.conversation || response.conversation;
      navigate(`/messages?conversation=${conversation._id || conversation.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    } finally {
      setIsMessaging(false);
    }
  };

  const handleInvitePlayer = async () => {
    if (!myTeam) {
      toast.error('You need a team to invite players');
      return;
    }
    setIsInviting(true);
    try {
      await teamsAPI.invite(myTeam._id || myTeam.id, playerId);
      toast.success('Invitation sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite player');
    } finally {
      setIsInviting(false);
    }
  };

  const canInvite = myTeam && ['owner', 'captain'].includes(currentUser?.team_role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748b]">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0a0e14]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-6">
            <FiUsers className="w-10 h-10 text-[#64748b]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Player not found</h1>
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const { user } = playerData;
  const playerName = user.full_name || `${user.first_name} ${user.last_name}`;
  const config = tierConfig[tier];

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Card Reveal Animation */}
      {showCardReveal && (
        <div className="fixed inset-0 z-50 bg-[#0a0e14] flex items-center justify-center">
          <div className="relative animate-pulse">
            <div
              className="absolute inset-0 blur-3xl opacity-50 animate-ping"
              style={{ backgroundColor: config.color + '30' }}
            />
            <div
              className="relative w-64 h-80 rounded-xl border-2 flex flex-col items-center justify-center"
              style={{
                borderColor: config.color,
                background: `linear-gradient(135deg, ${config.color}10 0%, #0d1219 50%, ${config.color}05 100%)`,
                boxShadow: `0 0 60px ${config.color}30`,
              }}
            >
              <p className="text-6xl font-bold font-mono mb-2" style={{ color: config.color }}>{overallRating}</p>
              <p className="text-white font-bold text-xl">{playerName}</p>
              <p className="text-[#64748b] text-sm uppercase tracking-wider">{getPositionLabel(user.position)}</p>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <span
                  className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: config.color + '20', color: config.color }}
                >
                  {config.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Players</span>
        </Link>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Player Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Player Card */}
            <div
              className="bg-[#0d1219] border rounded-lg overflow-hidden relative"
              style={{ borderColor: config.color + '50' }}
            >
              {/* Tier Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: config.color + '10', borderBottom: `1px solid ${config.color}30` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs uppercase tracking-wider" style={{ color: config.color }}>
                    {config.label} Player
                  </span>
                </div>
                <span
                  className="text-2xl font-bold font-mono"
                  style={{ color: config.color }}
                >
                  {overallRating}
                </span>
              </div>

              {/* Player Photo & Info */}
              <div className="p-6 text-center">
                <div
                  className="w-32 h-32 rounded-xl mx-auto mb-4 overflow-hidden border-2"
                  style={{ borderColor: config.color + '50' }}
                >
                  {user.profile_image || user.avatar ? (
                    <img
                      src={user.profile_image || user.avatar}
                      alt={playerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl font-bold"
                      style={{ backgroundColor: config.color + '20', color: config.color }}
                    >
                      {playerName?.[0] || '?'}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">{playerName}</h1>
                <p className="text-[#64748b] font-mono mb-4">@{user.username}</p>

                {/* Position Badge */}
                <div className="flex justify-center gap-3 mb-4">
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider"
                    style={{ backgroundColor: config.color + '20', color: config.color, border: `1px solid ${config.color}30` }}
                  >
                    {user.position || 'Player'}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-[#141c28] rounded-lg p-3 border border-[#2a3a4d]">
                    <p className="text-xl font-bold font-mono text-[#4ade80]">{user.stats?.games_played || 0}</p>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider">GP</p>
                  </div>
                  <div className="bg-[#141c28] rounded-lg p-3 border border-[#2a3a4d]">
                    <p className="text-xl font-bold font-mono text-[#f59e0b]">{user.stats?.goals || 0}</p>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Goals</p>
                  </div>
                  <div className="bg-[#141c28] rounded-lg p-3 border border-[#2a3a4d]">
                    <p className="text-xl font-bold font-mono text-[#3b82f6]">{user.stats?.assists || 0}</p>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Assists</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-[#1c2430]">
                {isAuthenticated && !isOwnProfile && (
                  <div className="space-y-2">
                    <button
                      onClick={handleMessagePlayer}
                      disabled={isMessaging}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                    >
                      {isMessaging ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiMessageSquare className="w-4 h-4" />
                      )}
                      Message
                    </button>
                    {canInvite && !user.team && (
                      <button
                        onClick={handleInvitePlayer}
                        disabled={isInviting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg hover:bg-[#1c2430] transition-colors disabled:opacity-50"
                      >
                        {isInviting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiSend className="w-4 h-4" />
                        )}
                        Invite to Team
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Player Info */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1c2430]">
                <span className="text-xs uppercase tracking-wider text-[#64748b]">Player Info</span>
              </div>
              <div className="p-4">
                <InfoRow icon={FiMapPin} label="Location" value={user.location || 'Not specified'} />
                <InfoRow icon={FiAward} label="Skill Level" value={user.skill_level || 'Recreational'} />
                {user.team?.team_name && (
                  <InfoRow icon={GiWhistle} label="Team" value={user.team.team_name} />
                )}
                <InfoRow icon={FiCalendar} label="Joined" value={new Date(user.createdAt || Date.now()).toLocaleDateString()} />
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Stats */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-[#64748b]">Performance Stats</span>
                </div>
                <FiActivity className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox value={user.stats?.games_played || 0} label="Games Played" icon={GiSoccerBall} color="#4ade80" />
                <StatBox value={user.stats?.goals || 0} label="Goals" icon={GiSoccerKick} color="#f59e0b" />
                <StatBox value={user.stats?.assists || 0} label="Assists" icon={FiTrendingUp} color="#3b82f6" />
                <StatBox value={user.stats?.clean_sheets || 0} label="Clean Sheets" icon={GiWhistle} color="#a855f7" />
              </div>
            </div>

            {/* Current Team */}
            {user.team && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1c2430]">
                  <span className="text-xs uppercase tracking-wider text-[#64748b]">Current Team</span>
                </div>
                <div className="p-4">
                  <Link
                    to={`/teams/${user.team._id}`}
                    className="flex items-center gap-4 p-4 bg-[#141c28] rounded-lg border border-[#2a3a4d] hover:border-[#22c55e]/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 border border-[#22c55e]/30 flex items-center justify-center">
                      {user.team.logo ? (
                        <img src={user.team.logo} alt={user.team.team_name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <GiWhistle className="w-7 h-7 text-[#4ade80]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-white">{user.team.team_name}</p>
                      <p className="text-sm text-[#64748b] capitalize">{user.team_role || 'Member'}</p>
                    </div>
                    <FiArrowLeft className="w-5 h-5 text-[#64748b] rotate-180" />
                  </Link>
                </div>
              </div>
            )}

            {/* Team History */}
            {user.team_history && user.team_history.length > 0 && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1c2430] flex items-center gap-3">
                  <FiClock className="w-4 h-4 text-[#64748b]" />
                  <span className="text-xs uppercase tracking-wider text-[#64748b]">Team History</span>
                </div>
                <div className="p-4 space-y-3">
                  {user.team_history.map((history, index) => (
                    <HistoryRow
                      key={index}
                      teamName={history.team_name || 'Unknown Team'}
                      role={history.role || 'Member'}
                      joinDate={history.joined_at ? new Date(history.joined_at).toLocaleDateString() : 'Unknown'}
                      leftDate={history.left_at ? new Date(history.left_at).toLocaleDateString() : 'Present'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfilePage;
