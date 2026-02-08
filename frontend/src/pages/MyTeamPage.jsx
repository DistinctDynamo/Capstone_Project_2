import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSettings,
  FiUsers,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMail,
  FiCheck,
  FiX,
  FiUserPlus,
  FiSearch,
  FiSend,
  FiExternalLink,
} from 'react-icons/fi';
import { GiWhistle, GiSoccerBall } from 'react-icons/gi';
import useAuthStore from '../store/authStore';
import { teamsAPI, usersAPI } from '../api';

// Stadium Control Room Components
const StatBox = ({ value, label, color = '#4ade80' }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4 text-center">
    <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
    <p className="text-xs text-[#64748b] uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const PlayerRow = ({ player, isAdmin, onMessage, onRemove }) => (
  <div className="grid grid-cols-12 gap-4 items-center py-3 px-4 border-b border-[#1c2430] hover:bg-[#141c28]/50 transition-colors">
    {/* Jersey Number */}
    <div className="col-span-1">
      <div className="w-8 h-8 rounded bg-[#22c55e]/20 flex items-center justify-center">
        <span className="text-[#4ade80] font-mono font-bold text-sm">{player.number}</span>
      </div>
    </div>

    {/* Player Info */}
    <div className="col-span-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#141c28] border border-[#2a3a4d] overflow-hidden">
        {player.avatar ? (
          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4ade80] font-bold">
            {player.name?.[0] || '?'}
          </div>
        )}
      </div>
      <div>
        <p className="text-white font-medium">{player.name}</p>
        <p className="text-xs text-[#64748b] font-mono">{player.email}</p>
      </div>
    </div>

    {/* Position */}
    <div className="col-span-2">
      <span className="text-[#94a3b8]">{player.position}</span>
    </div>

    {/* Role */}
    <div className="col-span-3">
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
        player.role === 'Captain' || player.role === 'Owner'
          ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30'
          : player.role === 'Co-Captain'
          ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30'
          : 'bg-[#2a3a4d] text-[#94a3b8]'
      }`}>
        {(player.role === 'Captain' || player.role === 'Owner') && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
        )}
        {player.role}
      </span>
    </div>

    {/* Actions */}
    <div className="col-span-2 flex justify-end gap-2">
      <button
        onClick={() => onMessage(player)}
        className="p-2 rounded-lg bg-[#141c28] border border-[#2a3a4d] text-[#64748b] hover:text-[#4ade80] hover:border-[#22c55e]/30 transition-colors"
      >
        <FiMail className="w-4 h-4" />
      </button>
      {isAdmin && player.role !== 'Captain' && player.role !== 'Owner' && (
        <button
          onClick={() => onRemove(player)}
          className="p-2 rounded-lg bg-[#141c28] border border-[#2a3a4d] text-[#64748b] hover:text-[#ef4444] hover:border-[#ef4444]/30 transition-colors"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

const MyTeamPage = () => {
  const { user } = useAuthStore();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  // Player finder state
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitingUserId, setInvitingUserId] = useState(null);

  useEffect(() => {
    const fetchMyTeam = async () => {
      try {
        setIsLoading(true);
        const response = await teamsAPI.getMyTeam();
        const teamData = response.data?.team || response.team || response;

        if (!teamData) {
          setTeam(null);
          setPendingRequests([]);
          return;
        }

        const userMember = teamData.members?.find(
          m => (m.user?._id || m.user) === user?._id
        );
        const userRole = userMember?.role || 'member';
        const isAdmin = userRole === 'owner' || userRole === 'captain' || userRole === 'co-captain';

        const transformedTeam = {
          id: teamData._id || teamData.id,
          name: teamData.team_name || teamData.name,
          logo: teamData.logo || null,
          level: teamData.skill_level || teamData.level || 'recreational',
          location: teamData.location?.city || teamData.location || 'Unknown',
          members: teamData.members?.length || 0,
          isAdmin,
          role: userRole.charAt(0).toUpperCase() + userRole.slice(1),
          roster: (teamData.members || []).map((member, index) => ({
            id: member.user?._id || member.user || member.id,
            name: member.user?.first_name
              ? `${member.user.first_name} ${member.user.last_name || ''}`.trim()
              : member.name || 'Unknown',
            avatar: member.user?.profile_image || member.avatar || null,
            position: member.position || 'Player',
            number: member.jersey_number || index + 1,
            role: member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member',
            email: member.user?.email || '',
          })),
          upcomingEvents: teamData.upcoming_events || [],
          stats: teamData.stats || { wins: 0, draws: 0, losses: 0 },
        };

        setTeam(transformedTeam);

        if (isAdmin && teamData.applications) {
          const pending = teamData.applications
            .filter(app => app.status === 'pending')
            .map(app => ({
              id: app._id || app.id,
              userId: app.user?._id || app.user,
              name: app.user?.first_name
                ? `${app.user.first_name} ${app.user.last_name || ''}`.trim()
                : 'Unknown',
              avatar: app.user?.profile_image || null,
              position: app.position || 'Any',
              message: app.message || 'No message provided',
              requestedAt: app.createdAt || new Date().toISOString(),
            }));
          setPendingRequests(pending);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        if (error.response?.status === 404) {
          setTeam(null);
        } else {
          toast.error('Failed to load team data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTeam();
  }, [user]);

  const fetchAvailablePlayers = useCallback(async () => {
    setLoadingPlayers(true);
    try {
      const response = await usersAPI.getAll({ limit: 50, available: 'true' });
      const players = response.data?.users || response.users || [];
      const teamMemberIds = team?.roster?.map(m => m.id) || [];
      const filteredPlayers = players.filter(player => {
        const playerId = player._id || player.id;
        return !teamMemberIds.includes(playerId);
      });
      setAvailablePlayers(filteredPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoadingPlayers(false);
    }
  }, [team]);

  useEffect(() => {
    if (showInviteModal) {
      fetchAvailablePlayers();
    }
  }, [showInviteModal, fetchAvailablePlayers]);

  const handleInvitePlayer = async (playerId) => {
    if (invitingUserId) return;
    setInvitingUserId(playerId);
    try {
      await teamsAPI.invite(team.id, playerId);
      toast.success('Invitation sent successfully!');
      setAvailablePlayers(prev => prev.filter(p => (p._id || p.id) !== playerId));
    } catch (error) {
      console.error('Error inviting player:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInvitingUserId(null);
    }
  };

  const filteredPlayers = availablePlayers.filter(player => {
    if (!searchQuery) return true;
    const fullName = `${player.first_name || ''} ${player.last_name || ''}`.toLowerCase();
    const username = (player.username || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });

  const handleAcceptRequest = async (requestId) => {
    if (isProcessingRequest) return;
    setIsProcessingRequest(true);
    try {
      await teamsAPI.handleApplication(team.id, requestId, 'accepted');
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success('Player added to the team!');
      const response = await teamsAPI.getMyTeam();
      const teamData = response.data?.team || response.team || response;
      if (teamData) {
        setTeam(prev => ({
          ...prev,
          members: teamData.members?.length || prev.members,
          roster: (teamData.members || []).map((member, index) => ({
            id: member.user?._id || member.user || member.id,
            name: member.user?.first_name
              ? `${member.user.first_name} ${member.user.last_name || ''}`.trim()
              : member.name || 'Unknown',
            avatar: member.user?.profile_image || member.avatar || null,
            position: member.position || 'Player',
            number: member.jersey_number || index + 1,
            role: member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member',
            email: member.user?.email || '',
          })),
        }));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    if (isProcessingRequest) return;
    setIsProcessingRequest(true);
    try {
      await teamsAPI.handleApplication(team.id, requestId, 'rejected');
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success('Request declined');
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error(error.response?.data?.message || 'Failed to decline request');
    } finally {
      setIsProcessingRequest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748b]">Loading your team...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0a0e14]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-6">
              <GiWhistle className="w-10 h-10 text-[#64748b]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Team Yet</h2>
            <p className="text-[#64748b] mb-8 max-w-md mx-auto">
              You're not part of any team. Create a new team or browse teams looking for players.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/teams/create"
                className="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22c55e]/25"
              >
                <FiPlus className="w-4 h-4" />
                Create Team
              </Link>
              <Link
                to="/teams"
                className="flex items-center gap-2 px-6 py-3 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg font-medium hover:bg-[#1c2430] transition-colors"
              >
                Browse Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'roster', label: 'Roster', icon: FiUsers },
    { id: 'schedule', label: 'Schedule', icon: FiCalendar },
    { id: 'requests', label: 'Requests', icon: FiUserPlus, count: pendingRequests.length },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Header */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-[#64748b]">My Team</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
              team.role === 'Owner' || team.role === 'Captain'
                ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30'
                : 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {team.role}
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 border border-[#22c55e]/30 flex items-center justify-center">
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <GiWhistle className="w-10 h-10 text-[#4ade80]" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    {team.members} members
                  </span>
                  <span>{team.location}</span>
                  <span className="capitalize">{team.level}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/teams/${team.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-sm text-white hover:bg-[#1c2430] transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Public Page
                </Link>
                <Link
                  to="/players"
                  className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22c55e]/25"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Find Players
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1c2430]">
              <StatBox value={team.stats?.wins || 0} label="Wins" color="#4ade80" />
              <StatBox value={team.stats?.draws || 0} label="Draws" color="#64748b" />
              <StatBox value={team.stats?.losses || 0} label="Losses" color="#ef4444" />
              <StatBox value={team.members} label="Squad" color="#3b82f6" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25'
                  : 'bg-[#0d1219] border border-[#1c2430] text-[#94a3b8] hover:text-white hover:bg-[#141c28]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'roster' && (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Team Roster</span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-xs text-[#94a3b8] hover:text-white transition-colors">
                <FiEdit2 className="w-3 h-3" />
                Edit Roster
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#141c28] border-b border-[#1c2430] text-xs uppercase tracking-wider text-[#64748b]">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2">Position</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Roster Rows */}
            <div>
              {team.roster.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  isAdmin={team.isAdmin}
                  onMessage={(p) => toast.success(`Opening chat with ${p.name}...`)}
                  onRemove={(p) => toast.success(`Removing ${p.name}...`)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Upcoming Events</span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e] rounded-lg text-xs text-white font-medium hover:bg-[#16a34a] transition-colors">
                <FiPlus className="w-3 h-3" />
                Add Event
              </button>
            </div>
            <div className="p-4 space-y-3">
              {team.upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <FiCalendar className="w-12 h-12 text-[#2a3a4d] mx-auto mb-4" />
                  <p className="text-[#64748b]">No upcoming events</p>
                </div>
              ) : (
                team.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      event.type === 'match' ? 'bg-[#22c55e]/20' : 'bg-[#a855f7]/20'
                    }`}>
                      {event.type === 'match' ? (
                        <GiSoccerBall className="w-6 h-6 text-[#4ade80]" />
                      ) : (
                        <GiWhistle className="w-6 h-6 text-[#c084fc]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{event.title}</p>
                      <p className="text-sm text-[#64748b]">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      event.type === 'match'
                        ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30'
                        : 'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/30'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430]">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Join Requests</span>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiUserPlus className="w-12 h-12 text-[#2a3a4d] mx-auto mb-4" />
                <p className="text-white font-medium mb-2">No pending requests</p>
                <p className="text-[#64748b] text-sm">When players request to join your team, they'll appear here.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-start gap-4 p-4 bg-[#141c28] rounded-lg border border-[#2a3a4d]">
                    <div className="w-12 h-12 rounded-lg bg-[#0d1219] border border-[#2a3a4d] overflow-hidden flex-shrink-0">
                      {request.avatar ? (
                        <img src={request.avatar} alt={request.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#4ade80] font-bold">
                          {request.name?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white">{request.name}</p>
                        <span className="px-2 py-0.5 bg-[#2a3a4d] rounded text-xs text-[#94a3b8]">{request.position}</span>
                      </div>
                      <p className="text-sm text-[#64748b] mb-2">"{request.message}"</p>
                      <p className="text-xs text-[#4b5563]">
                        Requested {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={isProcessingRequest}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        disabled={isProcessingRequest}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#141c28] border border-[#2a3a4d] text-[#94a3b8] rounded-lg text-sm hover:text-[#ef4444] hover:border-[#ef4444]/30 transition-colors disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1c2430]">
                <span className="text-xs uppercase tracking-wider text-[#64748b]">Team Settings</span>
              </div>
              <div className="p-6">
                <p className="text-[#64748b]">Coming soon - edit team details, manage permissions, and more.</p>
              </div>
            </div>

            <div className="bg-[#0d1219] border border-[#ef4444]/30 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#ef4444]/30 bg-[#ef4444]/5">
                <span className="text-xs uppercase tracking-wider text-[#ef4444]">Danger Zone</span>
              </div>
              <div className="p-6">
                <p className="text-[#94a3b8] mb-6">
                  Disbanding the team will remove all members and delete all team data. This action cannot be undone.
                </p>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] rounded-lg font-medium hover:bg-[#ef4444]/20 transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                  Disband Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#64748b]">Find & Invite Players</span>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 text-[#64748b] hover:text-white transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input
                    type="text"
                    className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e]"
                    placeholder="Search players by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {loadingPlayers ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-8 text-[#64748b]">
                      {searchQuery ? 'No players found' : 'No available players'}
                    </div>
                  ) : (
                    filteredPlayers.map((player) => {
                      const playerId = player._id || player.id;
                      const fullName = player.first_name
                        ? `${player.first_name} ${player.last_name || ''}`.trim()
                        : player.username;
                      const isInviting = invitingUserId === playerId;

                      return (
                        <div
                          key={playerId}
                          className="flex items-center gap-3 p-3 bg-[#141c28] rounded-lg border border-[#2a3a4d] hover:border-[#22c55e]/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#0d1219] border border-[#2a3a4d] overflow-hidden">
                            {player.avatar ? (
                              <img src={player.avatar} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#4ade80] font-bold">
                                {fullName[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{fullName}</p>
                            <p className="text-xs text-[#64748b]">@{player.username}</p>
                          </div>
                          <button
                            onClick={() => handleInvitePlayer(playerId)}
                            disabled={isInviting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e] text-white rounded text-sm font-medium hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                          >
                            {isInviting ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <FiSend className="w-3 h-3" />
                                Invite
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeamPage;
