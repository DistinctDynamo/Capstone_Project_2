import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';
import { GiSoccerBall, GiSoccerKick, GiWhistle } from 'react-icons/gi';
import { Card, Badge, Button, Loading, Modal } from '../components/common';
import PlayerStatsRadar from '../components/player/PlayerStatsRadar';
import PlayerCard from '../components/player/PlayerCard';
import useAuthStore from '../store/authStore';
import { usersAPI } from '../api';

const PlayerProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedStats, setEditedStats] = useState({});
  const [showCardReveal, setShowCardReveal] = useState(true);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setIsLoading(true);
        const response = await usersAPI.getPlayerStats(id);
        setPlayerData(response.data);
        setEditedStats(response.data.player_attributes || {});

        // Show card reveal animation
        setShowCardReveal(true);
        setTimeout(() => setShowCardReveal(false), 2000);
      } catch (error) {
        console.error('Error fetching player data:', error);
        toast.error('Failed to load player profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  // Calculate overall rating
  const overallRating = useMemo(() => {
    if (!playerData) return 0;
    return playerData.overall_rating || 50;
  }, [playerData]);

  // Get tier based on rating
  const tier = useMemo(() => {
    if (overallRating >= 80) return 'gold';
    if (overallRating >= 65) return 'silver';
    return 'bronze';
  }, [overallRating]);

  // Tier styles
  const tierStyles = {
    gold: {
      gradient: 'from-amber-600/20 via-yellow-500/10 to-amber-400/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_60px_rgba(251,191,36,0.15)]',
      badge: 'accent',
    },
    silver: {
      gradient: 'from-slate-500/20 via-gray-400/10 to-slate-300/20',
      border: 'border-slate-400/30',
      text: 'text-slate-300',
      glow: 'shadow-[0_0_40px_rgba(148,163,184,0.15)]',
      badge: 'gray',
    },
    bronze: {
      gradient: 'from-amber-800/20 via-orange-700/10 to-amber-600/20',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      glow: 'shadow-[0_0_30px_rgba(217,119,6,0.15)]',
      badge: 'warning',
    },
  };

  const style = tierStyles[tier];

  // Get position label
  const getPositionLabel = (position) => {
    switch (position) {
      case 'goalkeeper': return 'Goalkeeper';
      case 'defender': return 'Defender';
      case 'midfielder': return 'Midfielder';
      case 'forward': return 'Forward';
      default: return 'Player';
    }
  };

  // Get position icon
  const getPositionIcon = (position) => {
    switch (position) {
      case 'goalkeeper': return <GiWhistle className="w-5 h-5" />;
      case 'forward': return <GiSoccerKick className="w-5 h-5" />;
      default: return <GiSoccerBall className="w-5 h-5" />;
    }
  };

  // Handle stat edit
  const handleStatChange = (stat, value) => {
    const numValue = Math.max(1, Math.min(99, parseInt(value, 10) || 1));
    setEditedStats(prev => ({ ...prev, [stat]: numValue }));
  };

  // Save edited stats
  const handleSaveStats = async () => {
    setIsSaving(true);
    try {
      await usersAPI.updatePlayerStats(editedStats);
      toast.success('Player attributes updated!');
      // Refresh data
      const response = await usersAPI.getPlayerStats(id);
      setPlayerData(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving stats:', error);
      toast.error('Failed to save attributes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading player profile..." />
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Player not found</h1>
        <Link to="/teams" className="btn-primary">
          Back to Teams
        </Link>
      </div>
    );
  }

  const { user, player_attributes } = playerData;
  const playerName = user.full_name || `${user.first_name} ${user.last_name}`;

  return (
    <div className="min-h-screen">
      {/* Card Reveal Animation Overlay */}
      {showCardReveal && (
        <div className="fixed inset-0 z-50 bg-dark-950 flex items-center justify-center animate-fade-in">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary-500/50 via-accent-500/50 to-primary-500/50 animate-pulse" />

            {/* Card with reveal animation */}
            <div className="relative animate-[cardReveal_1.5s_ease-out_forwards]">
              <PlayerCard
                player={{
                  ...user,
                  player_attributes,
                  overall_rating: overallRating,
                }}
                size="lg"
                showStats={true}
                clickable={false}
              />
            </div>
          </div>

          <style>{`
            @keyframes cardReveal {
              0% {
                transform: perspective(1000px) rotateY(180deg) scale(0.5);
                opacity: 0;
              }
              50% {
                transform: perspective(1000px) rotateY(0deg) scale(1.1);
                opacity: 1;
              }
              100% {
                transform: perspective(1000px) rotateY(0deg) scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft />
          Back
        </Link>

        {/* Hero Section */}
        <div
          className={`
            relative overflow-hidden rounded-2xl mb-8
            bg-gradient-to-br ${style.gradient}
            ${style.border} border
            ${style.glow}
          `}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Player Card */}
              <div className="flex-shrink-0">
                <PlayerCard
                  player={{
                    ...user,
                    player_attributes,
                    overall_rating: overallRating,
                  }}
                  size="lg"
                  showStats={true}
                  clickable={false}
                />
              </div>

              {/* Player Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                  <Badge variant={style.badge} size="lg" icon={getPositionIcon(user.position)}>
                    {getPositionLabel(user.position)}
                  </Badge>
                  {user.team?.team_name && (
                    <Badge variant="primary" size="lg">
                      {user.team.team_name}
                    </Badge>
                  )}
                  {user.nationality && (
                    <Badge variant="gray" size="lg">
                      {user.nationality}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                  {playerName}
                </h1>
                <p className="text-dark-400 text-lg mb-6">@{user.username}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <GiSoccerBall className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{user.stats?.games_played || 0}</p>
                    <p className="text-sm text-dark-400">Games</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <FiTarget className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{user.stats?.goals || 0}</p>
                    <p className="text-sm text-dark-400">Goals</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <FiTrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{user.stats?.assists || 0}</p>
                    <p className="text-sm text-dark-400">Assists</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <GiWhistle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{user.stats?.clean_sheets || 0}</p>
                    <p className="text-sm text-dark-400">Clean Sheets</p>
                  </div>
                </div>

                {/* Edit button for own profile */}
                {isOwnProfile && isAuthenticated && (
                  <div className="flex gap-3 justify-center lg:justify-start">
                    {isEditing ? (
                      <>
                        <Button
                          variant="primary"
                          onClick={handleSaveStats}
                          isLoading={isSaving}
                          leftIcon={<FiSave />}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedStats(player_attributes);
                          }}
                          leftIcon={<FiX />}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        leftIcon={<FiEdit2 />}
                      >
                        Edit Attributes
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <GiSoccerBall className="text-primary-400" />
              Player Attributes
            </h2>
            <div className="flex justify-center">
              <PlayerStatsRadar
                stats={isEditing ? editedStats : player_attributes}
                size={320}
                animated={!isEditing}
              />
            </div>
          </Card>

          {/* Detailed Stats */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-accent-400" />
              Attribute Details
            </h2>
            <div className="space-y-4">
              {[
                { key: 'pace', label: 'Pace', abbr: 'PAC', color: 'bg-green-500', desc: 'Sprint Speed & Acceleration' },
                { key: 'shooting', label: 'Shooting', abbr: 'SHO', color: 'bg-red-500', desc: 'Shot Power & Accuracy' },
                { key: 'passing', label: 'Passing', abbr: 'PAS', color: 'bg-blue-500', desc: 'Vision & Ball Control' },
                { key: 'dribbling', label: 'Dribbling', abbr: 'DRI', color: 'bg-purple-500', desc: 'Ball Control & Agility' },
                { key: 'defending', label: 'Defending', abbr: 'DEF', color: 'bg-yellow-500', desc: 'Tackling & Positioning' },
                { key: 'physical', label: 'Physical', abbr: 'PHY', color: 'bg-orange-500', desc: 'Strength & Stamina' },
              ].map(({ key, label, abbr, color, desc }) => {
                const value = isEditing ? editedStats[key] : (player_attributes[key] || 50);
                const percentage = (value / 99) * 100;

                return (
                  <div key={key} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                          {abbr}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{label}</p>
                          <p className="text-xs text-dark-400">{desc}</p>
                        </div>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={value}
                          onChange={(e) => handleStatChange(key, e.target.value)}
                          className="w-16 px-2 py-1 bg-dark-700 border border-dark-600 rounded-lg text-white text-center font-bold focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <span className={`text-2xl font-bold ${value >= 80 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : 'text-dark-300'}`}>
                          {value}
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Team Info */}
        {user.team && (
          <Card className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiUsers className="text-primary-400" />
              Team
            </h2>
            <Link
              to={`/teams/${user.team._id}`}
              className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                {user.team.logo ? (
                  <img
                    src={user.team.logo}
                    alt={user.team.team_name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <GiWhistle className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{user.team.team_name}</p>
                <p className="text-sm text-dark-400">View team profile</p>
              </div>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayerProfilePage;
