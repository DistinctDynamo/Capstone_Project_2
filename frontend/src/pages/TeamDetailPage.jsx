import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiStar,
  FiArrowLeft,
  FiShare2,
  FiMessageSquare,
  FiCheck,
  FiClock,
} from 'react-icons/fi';
import { GiSoccerBall, GiWhistle, GiTrophy } from 'react-icons/gi';
import { Card, Badge, Button, Avatar, Loading, Modal } from '../components/common';
import useAuthStore from '../store/authStore';
import { teamsAPI } from '../api';

const TeamDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        const response = await teamsAPI.getById(id);
        const teamData = response.data?.team || response.team || response;

        // Transform API data to match component expectations
        const transformedTeam = {
          id: teamData._id || teamData.id,
          name: teamData.team_name || teamData.name,
          logo: teamData.logo || null,
          level: teamData.skill_level || teamData.level || 'recreational',
          location: teamData.location?.city || teamData.location || 'Unknown',
          description: teamData.description || 'No description available.',
          members: teamData.members?.length || 0,
          stats: {
            wins: teamData.stats?.wins || 0,
            losses: teamData.stats?.losses || 0,
            draws: teamData.stats?.draws || 0,
            goalsFor: teamData.stats?.goals_for || 0,
            goalsAgainst: teamData.stats?.goals_against || 0,
          },
          recruiting: teamData.recruiting_status?.is_recruiting ?? teamData.recruiting ?? false,
          recruitingPositions: teamData.recruiting_status?.positions || [],
          founded: teamData.founded_year || new Date(teamData.createdAt).getFullYear() || 'N/A',
          homeField: teamData.home_field || teamData.homeField || 'TBD',
          practiceSchedule: teamData.practice_schedule || teamData.practiceSchedule || 'TBD',
          captain: {
            id: teamData.captain?._id || teamData.captain?.id,
            name: teamData.captain?.first_name
              ? `${teamData.captain.first_name} ${teamData.captain.last_name || ''}`.trim()
              : teamData.captain?.name || 'Unknown',
            avatar: teamData.captain?.profile_image || null,
            role: 'Captain',
          },
          roster: (teamData.members || []).map((member, index) => ({
            id: member.user?._id || member.user || member.id,
            name: member.user?.first_name
              ? `${member.user.first_name} ${member.user.last_name || ''}`.trim()
              : member.name || 'Unknown',
            avatar: member.user?.profile_image || member.avatar || null,
            position: member.position || 'Player',
            number: member.jersey_number || index + 1,
            role: member.role || 'Member',
          })),
          achievements: teamData.achievements || [],
          upcomingMatches: teamData.upcoming_matches || [],
          rating: teamData.rating || 0,
        };

        setTeam(transformedTeam);

        // Check if user has already requested to join
        if (teamData.applications) {
          const userApplication = teamData.applications.find(
            app => (app.user?._id || app.user) === user?._id
          );
          if (userApplication && userApplication.status === 'pending') {
            setHasRequested(true);
          }
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        toast.error('Failed to load team details');
        setTeam(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [id, user]);

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

  const handleJoinRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join teams');
      return;
    }

    setIsRequesting(true);
    try {
      await teamsAPI.apply(id, joinMessage || `I would like to join ${team?.name}. Position: ${selectedPosition || 'Any'}`);
      setHasRequested(true);
      setShowJoinModal(false);
      setJoinMessage('');
      setSelectedPosition('');
      toast.success('Join request sent! The captain will review your request.');
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error(error.response?.data?.message || 'Failed to send join request');
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading team..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Team not found</h1>
        <Link to="/teams" className="btn-primary">
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/teams" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft />
        Back to Teams
      </Link>

      {/* Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <GiWhistle className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-white">{team.name}</h1>
              <Badge variant={getLevelColor(team.level)} size="lg">
                {team.level}
              </Badge>
              {team.recruiting && (
                <Badge variant="success" size="lg">
                  Recruiting
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-dark-400">
              <span className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" />
                {team.location}
              </span>
              <span className="flex items-center gap-1">
                <FiUsers className="w-4 h-4" />
                {team.members} members
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Founded {team.founded}
              </span>
              <span className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-accent-400" />
                {team.rating}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {team.recruiting && (
              hasRequested ? (
                <Button variant="secondary" disabled>
                  <FiCheck />
                  Request Sent
                </Button>
              ) : (
                <Button variant="primary" onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please login to join teams');
                    return;
                  }
                  setShowJoinModal(true);
                }}>
                  Request to Join
                </Button>
              )
            )}
            <Button variant="secondary">
              <FiShare2 />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Season Stats</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <p className="text-2xl font-bold text-green-400">{team.stats.wins}</p>
                <p className="text-sm text-dark-400">Wins</p>
              </div>
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <p className="text-2xl font-bold text-dark-300">{team.stats.draws}</p>
                <p className="text-sm text-dark-400">Draws</p>
              </div>
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <p className="text-2xl font-bold text-red-400">{team.stats.losses}</p>
                <p className="text-sm text-dark-400">Losses</p>
              </div>
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <p className="text-2xl font-bold text-primary-400">{team.stats.goalsFor}</p>
                <p className="text-sm text-dark-400">GF</p>
              </div>
              <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                <p className="text-2xl font-bold text-accent-400">{team.stats.goalsAgainst}</p>
                <p className="text-sm text-dark-400">GA</p>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <div className="prose prose-invert max-w-none">
              {team.description.split('\n').map((paragraph, index) => (
                <p key={index} className="text-dark-300 mb-4 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>

          {/* Roster */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Roster</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {team.roster.map((player) => (
                <Link
                  key={player.id}
                  to={`/players/${player.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-colors group"
                >
                  <div className="relative">
                    <Avatar src={player.avatar} name={player.name} size="md" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-700 text-white text-xs font-bold flex items-center justify-center">
                      {player.number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white group-hover:text-primary-400 transition-colors">{player.name}</p>
                    <p className="text-sm text-dark-400">{player.position}</p>
                  </div>
                  {player.role !== 'Member' && (
                    <Badge variant={player.role === 'Captain' ? 'accent' : 'gray'} size="sm">
                      {player.role}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Team Info</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Home Field</span>
                <span className="text-white">{team.homeField}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Practice</span>
                <span className="text-white">{team.practiceSchedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Captain</span>
                <Link to={`/players/${team.captain.id}`} className="text-white hover:text-primary-400 transition-colors">
                  {team.captain.name}
                </Link>
              </div>
            </div>
          </Card>

          {/* Recruiting */}
          {team.recruiting && (
            <Card className="border-primary-500/30">
              <h3 className="text-lg font-semibold text-primary-400 mb-4">Now Recruiting</h3>
              <p className="text-dark-400 mb-4">We're looking for players in these positions:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {team.recruitingPositions.map((pos, index) => (
                  <Badge key={index} variant="primary">
                    {pos}
                  </Badge>
                ))}
              </div>
              <Button variant="primary" className="w-full" onClick={() => setShowJoinModal(true)}>
                Apply Now
              </Button>
            </Card>
          )}

          {/* Achievements */}
          {team.achievements.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {team.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-accent-500/10">
                    <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
                      <GiTrophy className="w-5 h-5 text-accent-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{achievement.title}</p>
                      <p className="text-sm text-dark-400">{achievement.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Upcoming Matches */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Matches</h3>
            <div className="space-y-3">
              {team.upcomingMatches.map((match) => (
                <div key={match.id} className="p-4 rounded-xl bg-dark-800/50">
                  <p className="font-medium text-white mb-1">vs {match.opponent}</p>
                  <div className="text-sm text-dark-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(match.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      {match.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      {match.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Join Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title={`Join ${team.name}`}>
        <div className="space-y-4">
          <p className="text-dark-400">
            Send a request to join {team.name}. The team captain will review your application.
          </p>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Your Position
            </label>
            <select
              className="input"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <option value="">Select your position</option>
              <option value="goalkeeper">Goalkeeper</option>
              <option value="defender">Defender</option>
              <option value="midfielder">Midfielder</option>
              <option value="striker">Striker</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Message (Optional)
            </label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Tell the captain about yourself..."
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
            />
          </div>
          <Modal.Actions>
            <Button variant="secondary" onClick={() => setShowJoinModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleJoinRequest} isLoading={isRequesting}>
              Send Request
            </Button>
          </Modal.Actions>
        </div>
      </Modal>
    </div>
  );
};

export default TeamDetailPage;
