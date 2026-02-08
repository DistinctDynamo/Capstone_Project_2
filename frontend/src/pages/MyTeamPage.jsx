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
} from 'react-icons/fi';
import { GiWhistle, GiSoccerBall } from 'react-icons/gi';
import { Card, Badge, Button, Avatar, Loading, Modal, EmptyState } from '../components/common';
import useAuthStore from '../store/authStore';
import { teamsAPI, usersAPI } from '../api';

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

        // Determine user's role in the team
        const userMember = teamData.members?.find(
          m => (m.user?._id || m.user) === user?._id
        );
        const userRole = userMember?.role || 'member';
        const isAdmin = userRole === 'owner' || userRole === 'captain' || userRole === 'co-captain';

        // Transform team data
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
        };

        setTeam(transformedTeam);

        // Set pending requests if user is admin
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
        // User might not have a team
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

  // Fetch available players when invite modal opens
  const fetchAvailablePlayers = useCallback(async () => {
    setLoadingPlayers(true);
    try {
      // Fetch only available players (no team, not admins)
      const response = await usersAPI.getAll({ limit: 50, available: 'true' });
      const players = response.data?.users || response.users || [];

      // Also filter out current team members (just in case)
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
      // Remove player from list after inviting
      setAvailablePlayers(prev => prev.filter(p => (p._id || p.id) !== playerId));
    } catch (error) {
      console.error('Error inviting player:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInvitingUserId(null);
    }
  };

  // Filter players based on search
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

      // Refresh team data to show new member
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading your team..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon={GiWhistle}
          title="No Team Yet"
          description="You're not part of any team. Create a new team or browse teams looking for players."
          action={() => {}}
          actionLabel="Create Team"
        />
        <div className="flex justify-center gap-4 mt-6">
          <Link to="/teams/create" className="btn-primary">
            <FiPlus /> Create Team
          </Link>
          <Link to="/teams" className="btn-secondary">
            Browse Teams
          </Link>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <GiWhistle className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-display font-bold text-white">{team.name}</h1>
              <Badge variant="accent">{team.role}</Badge>
            </div>
            <p className="text-dark-400">{team.members} members | {team.location}</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/teams/${team.id}`} className="btn-secondary">
              View Public Page
            </Link>
            <Link to="/players" className="btn-primary inline-flex items-center gap-2">
              <FiUserPlus /> Find Players
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap
              transition-colors
              ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'roster' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Team Roster</h2>
            <Button variant="secondary" size="sm">
              <FiEdit2 /> Edit Roster
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Player</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Position</th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">Role</th>
                  <th className="text-right py-3 px-4 text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.roster.map((player) => (
                  <tr key={player.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                    <td className="py-4 px-4 font-bold text-white">{player.number}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={player.avatar} name={player.name} size="sm" />
                        <div>
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-sm text-dark-400">{player.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-dark-300">{player.position}</td>
                    <td className="py-4 px-4">
                      <Badge variant={player.role === 'Captain' ? 'accent' : player.role === 'Co-Captain' ? 'primary' : 'gray'} size="sm">
                        {player.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 text-dark-400 hover:text-white transition-colors">
                        <FiMail className="w-4 h-4" />
                      </button>
                      {team.isAdmin && player.role !== 'Captain' && (
                        <button className="p-2 text-dark-400 hover:text-red-400 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'schedule' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
            <Button variant="primary" size="sm">
              <FiPlus /> Add Event
            </Button>
          </div>
          <div className="space-y-4">
            {team.upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  event.type === 'match' ? 'bg-primary-500/20' : 'bg-accent-500/20'
                }`}>
                  {event.type === 'match' ? (
                    <GiSoccerBall className={`w-6 h-6 ${event.type === 'match' ? 'text-primary-400' : 'text-accent-400'}`} />
                  ) : (
                    <GiWhistle className="w-6 h-6 text-accent-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="text-sm text-dark-400">
                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}
                  </p>
                </div>
                <Badge variant={event.type === 'match' ? 'primary' : 'accent'}>
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'requests' && (
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Join Requests</h2>
          {pendingRequests.length === 0 ? (
            <EmptyState
              icon={FiUserPlus}
              title="No pending requests"
              description="When players request to join your team, they'll appear here."
            />
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-start gap-4 p-4 rounded-xl bg-dark-800/50">
                  <Avatar src={request.avatar} name={request.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{request.name}</p>
                      <Badge variant="gray" size="sm">{request.position}</Badge>
                    </div>
                    <p className="text-sm text-dark-400 mb-2">"{request.message}"</p>
                    <p className="text-xs text-dark-500">
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(request.id)}>
                      <FiCheck /> Accept
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleDeclineRequest(request.id)}>
                      <FiX /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Team Settings</h2>
            <p className="text-dark-400">Coming soon - edit team details, manage permissions, and more.</p>
          </Card>
          <Card className="border-red-500/30">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-dark-400 mb-6">
              Disbanding the team will remove all members and delete all team data. This action cannot be undone.
            </p>
            <Button variant="danger">
              <FiTrash2 /> Disband Team
            </Button>
          </Card>
        </div>
      )}

      {/* Invite Modal - Player Finder */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Find & Invite Players">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search players by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Players List */}
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {loadingPlayers ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="md" text="Loading players..." />
              </div>
            ) : filteredPlayers.length === 0 ? (
              <EmptyState
                icon={FiUsers}
                title={searchQuery ? 'No players found' : 'No available players'}
                description={searchQuery ? 'Try a different search term' : 'All players are currently in teams'}
              />
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
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
                  >
                    <Avatar src={player.avatar} name={fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{fullName}</p>
                      <div className="flex items-center gap-2 text-sm text-dark-400">
                        <span>@{player.username}</span>
                        {player.position && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{player.position}</span>
                          </>
                        )}
                        {player.skill_level && (
                          <>
                            <span>•</span>
                            <Badge variant="gray" size="sm" className="capitalize">
                              {player.skill_level}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInvitePlayer(playerId)}
                      disabled={isInviting}
                    >
                      {isInviting ? (
                        <Loading size="xs" />
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          Invite
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <Modal.Actions>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Close
            </Button>
          </Modal.Actions>
        </div>
      </Modal>
    </div>
  );
};

export default MyTeamPage;
