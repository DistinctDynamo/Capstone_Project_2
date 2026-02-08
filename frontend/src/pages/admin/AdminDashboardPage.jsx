import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiUsers,
  FiCalendar,
  FiArrowRight,
  FiClock,
  FiTag,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiActivity,
} from 'react-icons/fi';
import { GiSoccerBall, GiSoccerField, GiWhistle } from 'react-icons/gi';
import { Loading } from '../../components/common';
import { adminAPI } from '../../api';

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [pendingClassifieds, setPendingClassifieds] = useState([]);
  const [activeTab, setActiveTab] = useState('teams');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes, teamsRes, classifiedsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getPendingEvents(),
          adminAPI.getPendingTeams(),
          adminAPI.getPendingClassifieds(),
        ]);
        setStats(statsRes.data.data);
        setPendingEvents(eventsRes.data.data.events || []);
        setPendingTeams(teamsRes.data.data.teams || []);
        setPendingClassifieds(classifiedsRes.data.data.classifieds || []);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  const totalPending = pendingTeams.length + pendingEvents.length + pendingClassifieds.length;

  const tabs = [
    { id: 'teams', label: 'Teams', count: pendingTeams.length, icon: GiSoccerBall },
    { id: 'events', label: 'Events', count: pendingEvents.length, icon: FiCalendar },
    { id: 'listings', label: 'Listings', count: pendingClassifieds.length, icon: FiTag },
  ];

  const activeItems = activeTab === 'teams' ? pendingTeams
    : activeTab === 'events' ? pendingEvents
    : pendingClassifieds;

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* === TOP SCOREBOARD HEADER === */}
      <div className="bg-[#0d1219] border-b-4 border-[#1a5f2a]">
        <div className="max-w-7xl mx-auto">
          {/* Stadium Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1c2430]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-[#22c55e] text-xs font-mono uppercase tracking-widest">Live System</span>
            </div>
            <div className="text-[#4a5568] text-xs font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Main Scoreboard Display */}
          <div className="grid grid-cols-4 divide-x divide-[#1c2430]">
            <ScoreboardCell
              value={stats?.users?.total || 0}
              label="PLAYERS"
              sublabel={`${stats?.users?.active || 0} Active`}
              color="#3b82f6"
            />
            <ScoreboardCell
              value={stats?.teams?.total || 0}
              label="TEAMS"
              sublabel={`${stats?.teams?.pending || 0} Pending`}
              color="#22c55e"
            />
            <ScoreboardCell
              value={stats?.events?.total || 0}
              label="MATCHES"
              sublabel={`${stats?.events?.pending || 0} Pending`}
              color="#a855f7"
            />
            <ScoreboardCell
              value={stats?.classifieds?.total || 0}
              label="LISTINGS"
              sublabel={`${stats?.classifieds?.pending || 0} Pending`}
              color="#f59e0b"
            />
          </div>
        </div>
      </div>

      {/* === MAIN COMMAND CENTER === */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT PANEL - Approval Queue */}
          <div className="flex-1">
            {/* Panel Header with Metal Texture */}
            <div className="bg-gradient-to-b from-[#1a2332] to-[#141c28] rounded-t-lg border border-[#2a3a4d] border-b-0">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1a5f2a] rounded flex items-center justify-center">
                    <GiWhistle className="w-4 h-4 text-[#4ade80]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm uppercase tracking-wide">Approval Queue</h2>
                    <p className="text-[#64748b] text-xs">{totalPending} items awaiting review</p>
                  </div>
                </div>
                <Link
                  to="/admin/pending"
                  className="flex items-center gap-1.5 text-xs text-[#4ade80] hover:text-[#86efac] transition-colors font-medium"
                >
                  View All <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Tab Switches - Physical Toggle Style */}
              <div className="flex border-t border-[#2a3a4d]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 relative py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#0d1219] text-white'
                        : 'text-[#64748b] hover:text-white hover:bg-[#141c28]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          activeTab === tab.id
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-[#374151] text-[#9ca3af]'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue List - Data Table Style */}
            <div className="bg-[#0d1219] border border-[#2a3a4d] border-t-0 rounded-b-lg overflow-hidden">
              {activeItems.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a2332] flex items-center justify-center">
                    <FiCheck className="w-8 h-8 text-[#22c55e]" />
                  </div>
                  <p className="text-[#64748b] text-sm">All {activeTab} cleared</p>
                  <p className="text-[#4a5568] text-xs mt-1">No pending approvals</p>
                </div>
              ) : (
                <div>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-[#141c28] text-[#64748b] text-[10px] font-bold uppercase tracking-wider border-b border-[#2a3a4d]">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Submitted By</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>

                  {/* Table Rows */}
                  {activeItems.slice(0, 6).map((item, idx) => (
                    <QueueRow
                      key={item._id}
                      item={item}
                      type={activeTab}
                      isEven={idx % 2 === 0}
                    />
                  ))}

                  {/* Footer with count */}
                  {activeItems.length > 6 && (
                    <div className="px-4 py-3 bg-[#141c28] border-t border-[#2a3a4d] text-center">
                      <Link
                        to="/admin/pending"
                        className="text-xs text-[#4ade80] hover:underline"
                      >
                        +{activeItems.length - 6} more items →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - Control Switches & Meters */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Quick Actions Panel */}
            <div className="bg-[#0d1219] rounded-lg border border-[#2a3a4d] overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-b from-[#1a2332] to-[#141c28] border-b border-[#2a3a4d]">
                <h3 className="text-white font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                  <FiActivity className="w-3.5 h-3.5 text-[#4ade80]" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-3 space-y-2">
                <ActionButton to="/admin/teams" icon={GiSoccerBall} label="Manage Teams" color="emerald" />
                <ActionButton to="/admin/users" icon={FiUsers} label="User Directory" color="blue" />
                <ActionButton to="/admin/content" icon={FiAlertCircle} label="Moderation Queue" color="amber" />
              </div>
            </div>

            {/* System Meters */}
            <div className="bg-[#0d1219] rounded-lg border border-[#2a3a4d] overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-b from-[#1a2332] to-[#141c28] border-b border-[#2a3a4d]">
                <h3 className="text-white font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                  <GiSoccerField className="w-3.5 h-3.5 text-[#4ade80]" />
                  Platform Metrics
                </h3>
              </div>
              <div className="p-4 space-y-5">
                <Meter
                  label="User Engagement"
                  value={Math.round(((stats?.users?.active || 0) / Math.max(stats?.users?.total || 1, 1)) * 100)}
                  segments={10}
                />
                <Meter
                  label="Team Activity"
                  value={Math.round((((stats?.teams?.total || 0) - (stats?.teams?.pending || 0)) / Math.max(stats?.teams?.total || 1, 1)) * 100)}
                  segments={10}
                />
                <Meter
                  label="Event Coverage"
                  value={Math.round((((stats?.events?.total || 0) - (stats?.events?.pending || 0)) / Math.max(stats?.events?.total || 1, 1)) * 100)}
                  segments={10}
                />
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-[#0d1219] rounded-lg border border-[#2a3a4d] p-4">
              <div className="grid grid-cols-2 gap-3">
                <StatusIndicator
                  label="Active Teams"
                  value={(stats?.teams?.total || 0) - (stats?.teams?.pending || 0)}
                  status="online"
                />
                <StatusIndicator
                  label="Live Events"
                  value={(stats?.events?.total || 0) - (stats?.events?.pending || 0)}
                  status="online"
                />
                <StatusIndicator
                  label="Pending Review"
                  value={totalPending}
                  status={totalPending > 0 ? 'warning' : 'online'}
                />
                <StatusIndicator
                  label="New Today"
                  value={pendingTeams.filter(t => isToday(t.created_at)).length + pendingEvents.filter(e => isToday(e.created_at)).length}
                  status="info"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === HELPER COMPONENTS ===

const ScoreboardCell = ({ value, label, sublabel, color }) => (
  <div className="py-6 px-4 text-center">
    <div
      className="text-4xl lg:text-5xl font-black font-mono tracking-tighter"
      style={{ color, textShadow: `0 0 20px ${color}40` }}
    >
      {value.toLocaleString()}
    </div>
    <div className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-[0.2em] mt-2">{label}</div>
    <div className="text-[#475569] text-[10px] mt-1">{sublabel}</div>
  </div>
);

const QueueRow = ({ item, type, isEven }) => {
  const getName = () => {
    if (type === 'teams') return item.team_name;
    if (type === 'events') return item.title;
    return item.title;
  };

  const getSubmitter = () => {
    if (type === 'teams') return `${item.owner?.first_name || ''} ${item.owner?.last_name || ''}`.trim() || 'Unknown';
    if (type === 'events') return `${item.creator?.first_name || ''} ${item.creator?.last_name || ''}`.trim() || 'Unknown';
    return `${item.seller?.first_name || ''} ${item.seller?.last_name || ''}`.trim() || 'Unknown';
  };

  return (
    <div className={`grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-[#1c2430] hover:bg-[#141c28] transition-colors ${isEven ? 'bg-[#0d1219]' : 'bg-[#0f1520]'}`}>
      <div className="col-span-5">
        <p className="text-white text-sm font-medium truncate">{getName()}</p>
      </div>
      <div className="col-span-3">
        <p className="text-[#94a3b8] text-xs truncate">{getSubmitter()}</p>
      </div>
      <div className="col-span-2">
        <p className="text-[#64748b] text-xs">{formatDate(item.created_at)}</p>
      </div>
      <div className="col-span-2 flex justify-end">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20">
          <FiClock className="w-2.5 h-2.5" />
          Pending
        </span>
      </div>
    </div>
  );
};

const ActionButton = ({ to, icon: Icon, label, color }) => { // eslint-disable-line no-unused-vars
  const colors = {
    emerald: 'border-[#22c55e]/30 hover:border-[#22c55e] hover:bg-[#22c55e]/5 text-[#22c55e]',
    blue: 'border-[#3b82f6]/30 hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 text-[#3b82f6]',
    amber: 'border-[#f59e0b]/30 hover:border-[#f59e0b] hover:bg-[#f59e0b]/5 text-[#f59e0b]',
  };

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded border ${colors[color]} transition-all`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium text-[#e2e8f0]">{label}</span>
      <FiArrowRight className="w-3 h-3 ml-auto opacity-50" />
    </Link>
  );
};

const Meter = ({ label, value, segments }) => {
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#94a3b8] text-xs">{label}</span>
        <span className="text-white text-xs font-mono font-bold">{value}%</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-sm transition-colors ${
              i < filledSegments
                ? value >= 70 ? 'bg-[#22c55e]' : value >= 40 ? 'bg-[#fbbf24]' : 'bg-[#ef4444]'
                : 'bg-[#1c2430]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const StatusIndicator = ({ label, value, status }) => {
  const statusColors = {
    online: 'bg-[#22c55e]',
    warning: 'bg-[#fbbf24]',
    offline: 'bg-[#ef4444]',
    info: 'bg-[#3b82f6]',
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-[#141c28]">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} ${status === 'warning' ? 'animate-pulse' : ''}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">{value}</p>
        <p className="text-[#64748b] text-[10px] truncate">{label}</p>
      </div>
    </div>
  );
};

// Utility functions
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isToday = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export default AdminDashboardPage;
