import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiArrowLeft,
  FiShare2,
  FiCheck,
  FiClock,
  FiUserPlus,
} from 'react-icons/fi';
import { GiWhistle, GiTrophy, GiSoccerBall } from 'react-icons/gi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { teamsAPI } from '../api';

// Stat Box Component
const StatBox = ({ value, label, color = '#4ade80' }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4 text-center">
    <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
    <p className="text-xs text-[#64748b] uppercase tracking-wider mt-1">{label}</p>
  </div>
);

// Info Row Component
const InfoRow = ({ label, value, link }) => (
  <div className="flex justify-between items-center py-3 border-b border-[#1c2430] last:border-0">
    <span className="text-xs text-[#64748b] uppercase tracking-wider">{label}</span>
    {link ? (
      <Link to={link} className="text-[#4ade80] hover:text-[#22c55e] transition-colors font-medium">
        {value}
      </Link>
    ) : (
      <span className="text-white font-medium">{value}</span>
    )}
  </div>
);

// Player Row Component
const PlayerRow = ({ player, index }) => (
  <Link
    to={`/players/${player.id}`}
    className="flex items-center gap-4 p-3 bg-[#0d1219] border border-[#1c2430] rounded-lg hover:border-[#2a3a4d] transition-all group"
  >
    <div className="w-10 h-10 rounded-lg bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center">
      <span className="text-sm font-bold font-mono text-[#4ade80]">{player.number || index + 1}</span>
    </div>
    {player.avatar ? (
      <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-[#1a5f2a] flex items-center justify-center">
        <span className="text-sm font-bold text-[#4ade80]">
          {player.name?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white group-hover:text-[#4ade80] transition-colors truncate">
        {player.name}
      </p>
      <p className="text-xs text-[#64748b]">{player.position || 'Player'}</p>
    </div>
    {player.role && player.role !== 'Member' && (
      <div className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
        player.role === 'Captain' || player.role === 'owner'
          ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
          : 'bg-[#3b82f6]/10 text-[#3b82f6]'
      }`}>
        {player.role}
      </div>
    )}
  </Link>
);

// Match Card Component
const MatchCard = ({ match }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-[#64748b] uppercase tracking-wider">vs</span>
      <span className="px-2 py-0.5 bg-[#a855f7]/10 text-[#a855f7] text-xs rounded uppercase">
        {match.type || 'Match'}
      </span>
    </div>
    <p className="font-semibold text-white mb-3">{match.opponent}</p>
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-[#64748b]">
        <FiCalendar className="w-4 h-4" />
        <span>
          {new Date(match.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[#64748b]">
        <FiClock className="w-4 h-4" />
        <span>{match.time}</span>
      </div>
      <div className="flex items-center gap-2 text-[#64748b]">
        <FiMapPin className="w-4 h-4" />
        <span className="truncate">{match.location}</span>
      </div>
    </div>
  </div>
);

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

  const levelColors = {
    recreational: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    intermediate: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    competitive: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading team..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
            <GiWhistle className="w-10 h-10 text-[#64748b]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Team not found</h1>
          <p className="text-[#64748b] mb-6">This team may have been removed or doesn't exist</p>
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const level = levelColors[team.level] || levelColors.recreational;
  const totalGames = team.stats.wins + team.stats.draws + team.stats.losses;
  const winRate = totalGames > 0 ? Math.round((team.stats.wins / totalGames) * 100) : 0;
  const goalDiff = team.stats.goalsFor - team.stats.goalsAgainst;

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Teams</span>
        </Link>

        {/* Header Card */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Team Logo */}
            <div className="w-24 h-24 rounded-xl bg-[#1a5f2a] border border-[#22c55e]/30 flex items-center justify-center flex-shrink-0">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <GiSoccerBall className="w-12 h-12 text-[#4ade80]" />
              )}
            </div>

            {/* Team Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                <div className={`px-3 py-1 rounded-lg ${level.bg}`}>
                  <span className={`text-xs font-medium uppercase tracking-wider ${level.text}`}>
                    {team.level}
                  </span>
                </div>
                {team.recruiting && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#22c55e]/10 rounded-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                    </span>
                    <span className="text-xs font-medium text-[#4ade80] uppercase tracking-wider">
                      Recruiting
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748b]">
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="w-4 h-4" />
                  {team.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiUsers className="w-4 h-4" />
                  {team.members} members
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  Founded {team.founded}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {team.recruiting && (
                hasRequested ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] flex items-center gap-2 cursor-not-allowed"
                  >
                    <FiCheck className="w-4 h-4" />
                    Request Sent
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please login to join teams');
                        return;
                      }
                      setShowJoinModal(true);
                    }}
                    className="px-4 py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all flex items-center gap-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Request to Join
                  </button>
                )
              )}
              <button className="p-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Season Stats */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                Season Statistics
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <StatBox value={team.stats.wins} label="Wins" color="#22c55e" />
                <StatBox value={team.stats.draws} label="Draws" color="#64748b" />
                <StatBox value={team.stats.losses} label="Losses" color="#ef4444" />
                <StatBox value={team.stats.goalsFor} label="GF" color="#3b82f6" />
                <StatBox value={team.stats.goalsAgainst} label="GA" color="#f59e0b" />
                <StatBox value={`${goalDiff >= 0 ? '+' : ''}${goalDiff}`} label="GD" color={goalDiff >= 0 ? '#22c55e' : '#ef4444'} />
              </div>
              {totalGames > 0 && (
                <div className="mt-4 pt-4 border-t border-[#1c2430]">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#64748b]">Win Rate</span>
                    <span className="font-mono text-white">{winRate}%</span>
                  </div>
                  <div className="h-2 bg-[#141c28] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#22c55e] rounded-full transition-all"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                About
              </h2>
              <div className="text-[#94a3b8] whitespace-pre-wrap">
                {team.description}
              </div>
            </div>

            {/* Roster */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
                  Roster
                </h2>
                <span className="text-sm text-[#64748b]">{team.roster.length} players</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {team.roster.map((player, index) => (
                  <PlayerRow key={player.id} player={player} index={index} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                Team Info
              </h3>
              <div>
                <InfoRow label="Home Field" value={team.homeField} />
                <InfoRow label="Practice" value={team.practiceSchedule} />
                <InfoRow label="Captain" value={team.captain.name} link={`/players/${team.captain.id}`} />
                <InfoRow label="Total Games" value={totalGames} />
              </div>
            </div>

            {/* Recruiting */}
            {team.recruiting && (
              <div className="bg-[#0d1219] border border-[#22c55e]/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                  </span>
                  <h3 className="text-xs font-medium text-[#4ade80] uppercase tracking-wider">
                    Now Recruiting
                  </h3>
                </div>
                <p className="text-sm text-[#94a3b8] mb-4">
                  Looking for players in these positions:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {team.recruitingPositions.length > 0 ? (
                    team.recruitingPositions.map((pos, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#1a5f2a] text-[#4ade80] text-xs rounded-lg border border-[#22c55e]/30"
                      >
                        {pos}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#64748b]">All positions</span>
                  )}
                </div>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all text-sm font-medium"
                >
                  Apply Now
                </button>
              </div>
            )}

            {/* Achievements */}
            {team.achievements.length > 0 && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
                <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                  Achievements
                </h3>
                <div className="space-y-3">
                  {team.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
                        <GiTrophy className="w-5 h-5 text-[#f59e0b]" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{achievement.title}</p>
                        <p className="text-xs text-[#64748b]">{achievement.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Matches */}
            {team.upcomingMatches.length > 0 && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
                <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                  Upcoming Matches
                </h3>
                <div className="space-y-3">
                  {team.upcomingMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowJoinModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Join {team.name}</h2>
            <p className="text-sm text-[#64748b] mb-6">
              Send a request to join. The team captain will review your application.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Your Position
                </label>
                <select
                  className="w-full px-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white focus:outline-none focus:border-[#4ade80]/50"
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
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Message (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 min-h-[100px] resize-none"
                  placeholder="Tell the captain about yourself..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRequest}
                disabled={isRequesting}
                className="flex-1 py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all font-medium disabled:opacity-50"
              >
                {isRequesting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;
