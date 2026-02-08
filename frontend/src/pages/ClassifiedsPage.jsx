import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiPlus,
  FiMapPin,
  FiClock,
  FiTag,
  FiGrid,
  FiList,
  FiX,
  FiDollarSign,
} from 'react-icons/fi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { classifiedsAPI } from '../api';

// Filter Tab Component
const FilterTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? 'bg-[#1a5f2a] text-[#4ade80] border border-[#22c55e]/30'
        : 'text-[#64748b] hover:text-white hover:bg-[#1c2430]'
    }`}
  >
    {children}
  </button>
);

// Listing Row Component
const ListingRow = ({ listing }) => {
  const categoryColors = {
    'players-wanted': { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', label: 'Players Wanted' },
    'team-wanted': { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]', label: 'Team Wanted' },
    'equipment': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', label: 'Equipment' },
    'equipment-wanted': { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]', label: 'Equipment Wanted' },
    'coaching': { bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]', label: 'Coaching' },
    'other': { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]', label: 'Other' },
  };

  const conditionColors = {
    'new': { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    'like-new': { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    'good': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    'fair': { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  };

  const category = categoryColors[listing.category] || categoryColors.other;
  const condition = conditionColors[listing.condition?.toLowerCase()] || conditionColors.good;
  const dateStr = new Date(listing.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={`/classifieds/${listing.id}`}
      className="group flex items-center gap-4 p-4 bg-[#0d1219] border border-[#1c2430] rounded-xl hover:border-[#2a3a4d] transition-all"
    >
      {/* Image Placeholder */}
      <div className="w-16 h-16 bg-[#141c28] border border-[#2a3a4d] rounded-xl flex items-center justify-center flex-shrink-0">
        <FiTag className="w-7 h-7 text-[#f59e0b]" />
      </div>

      {/* Listing Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors truncate mb-1">
          {listing.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <FiMapPin className="w-3 h-3" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {dateStr}
          </span>
        </div>
      </div>

      {/* Category Badge */}
      <div className={`hidden sm:block px-3 py-1 rounded-lg ${category.bg}`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${category.text}`}>
          {category.label}
        </span>
      </div>

      {/* Condition Badge */}
      <div className={`hidden md:block px-3 py-1 rounded-lg ${condition.bg}`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${condition.text}`}>
          {listing.condition}
        </span>
      </div>

      {/* Price */}
      <div className="text-right">
        <span className={`font-bold text-lg ${listing.price === 0 ? 'text-[#4ade80]' : 'text-white'}`}>
          {listing.price === 0 ? 'Free' : `$${listing.price}`}
        </span>
      </div>
    </Link>
  );
};

// Listing Card Component (Grid View)
const ListingCard = ({ listing }) => {
  const categoryColors = {
    'players-wanted': { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', label: 'Players Wanted' },
    'team-wanted': { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]', label: 'Team Wanted' },
    'equipment': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', label: 'Equipment' },
    'equipment-wanted': { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]', label: 'Equipment Wanted' },
    'coaching': { bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]', label: 'Coaching' },
    'other': { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]', label: 'Other' },
  };

  const category = categoryColors[listing.category] || categoryColors.other;
  const dateStr = new Date(listing.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={`/classifieds/${listing.id}`}
      className="group bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden hover:border-[#2a3a4d] transition-all"
    >
      {/* Header */}
      <div className="relative h-36 bg-gradient-to-br from-[#f59e0b]/10 to-[#141c28] flex items-center justify-center">
        <FiTag className="w-12 h-12 text-[#f59e0b]/30" />
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg ${category.bg}`}>
          <span className={`text-xs font-medium uppercase tracking-wider ${category.text}`}>
            {category.label}
          </span>
        </div>
        {listing.condition && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-[#141c28]/80">
            <span className="text-xs text-[#64748b] uppercase">{listing.condition}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors mb-2 truncate">
          {listing.title}
        </h3>

        <p className="text-2xl font-bold mb-3">
          <span className={listing.price === 0 ? 'text-[#4ade80]' : 'text-white'}>
            {listing.price === 0 ? 'Free' : `$${listing.price}`}
          </span>
        </p>

        <p className="text-sm text-[#64748b] line-clamp-2 mb-4">
          {listing.description}
        </p>

        <div className="flex items-center justify-between text-xs text-[#64748b] pt-3 border-t border-[#1c2430]">
          <span className="flex items-center gap-1">
            <FiMapPin className="w-3 h-3" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {dateStr}
          </span>
        </div>
      </div>
    </Link>
  );
};

const ClassifiedsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
  });

  const classifiedTypeMap = {
    looking_for_players: 'players-wanted',
    looking_for_team: 'team-wanted',
    equipment_sale: 'equipment',
    equipment_wanted: 'equipment-wanted',
    coaching: 'coaching',
    other: 'other',
  };

  const reverseClassifiedTypeMap = {
    'players-wanted': 'looking_for_players',
    'team-wanted': 'looking_for_team',
    'equipment': 'equipment_sale',
    'equipment-wanted': 'equipment_wanted',
    'coaching': 'coaching',
    'other': 'other',
  };

  useEffect(() => {
    const fetchClassifieds = async () => {
      try {
        setIsLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category !== 'all') params.classified_type = reverseClassifiedTypeMap[filters.category] || filters.category;

        const response = await classifiedsAPI.getAll(params);
        const classifiedsData = response.data?.classifieds || response.classifieds || [];

        const transformedListings = classifiedsData.map(item => {
          const creator = item.creator;
          return {
            id: item._id || item.id,
            title: item.title,
            category: classifiedTypeMap[item.classified_type] || item.classified_type || 'other',
            price: item.price || 0,
            condition: item.condition || 'good',
            location: item.location || 'Unknown',
            image: item.images?.[0] || null,
            description: item.description || '',
            seller: {
              id: creator?._id || creator?.id,
              name: creator?.first_name
                ? `${creator.first_name} ${(creator.last_name || '').charAt(0)}.`
                : creator?.username || 'Unknown',
            },
            createdAt: item.created_at || new Date().toISOString(),
          };
        });

        setListings(transformedListings);
      } catch (error) {
        console.error('Error fetching classifieds:', error);
        toast.error('Failed to load classifieds');
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassifieds();
  }, []);

  const filteredListings = listings.filter((listing) => {
    if (filters.search && !listing.title?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category !== 'all' && listing.category?.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading classifieds..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center">
                <FiTag className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  <span className="text-[#4ade80]">Marketplace</span>
                </h1>
                <p className="text-sm text-[#64748b]">
                  {listings.length} listings • Buy, sell, and trade within the community
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <Link
                to="/classifieds/create"
                className="px-5 py-3 bg-[#1a5f2a] text-[#4ade80] font-semibold rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] hover:border-[#4ade80]/50 transition-all flex items-center gap-2 self-start lg:self-center"
              >
                <FiPlus className="w-5 h-5" />
                Post Listing
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search listings..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <FilterTab
                active={filters.category === 'all'}
                onClick={() => setFilters({ ...filters, category: 'all' })}
              >
                All
              </FilterTab>
              <FilterTab
                active={filters.category === 'equipment'}
                onClick={() => setFilters({ ...filters, category: 'equipment' })}
              >
                Equipment
              </FilterTab>
              <FilterTab
                active={filters.category === 'players-wanted'}
                onClick={() => setFilters({ ...filters, category: 'players-wanted' })}
              >
                Players
              </FilterTab>
              <FilterTab
                active={filters.category === 'coaching'}
                onClick={() => setFilters({ ...filters, category: 'coaching' })}
              >
                Coaching
              </FilterTab>
            </div>

            {/* View Toggle */}
            <div className="flex border border-[#2a3a4d] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-[#1a5f2a] text-[#4ade80]' : 'bg-[#141c28] text-[#64748b] hover:text-white'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-[#1a5f2a] text-[#4ade80]' : 'bg-[#141c28] text-[#64748b] hover:text-white'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredListings.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-16 text-center">
            <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
              <FiTag className="w-10 h-10 text-[#64748b]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No listings found</h3>
            <p className="text-[#64748b] mb-6">Try adjusting your filters or check back later</p>
            <button
              onClick={() => setFilters({ search: '', category: 'all' })}
              className="px-4 py-2 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg hover:bg-[#1c2430] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-[#141c28] border-b border-[#1c2430] text-xs text-[#64748b] uppercase tracking-wider">
              <div className="w-16" />
              <div className="flex-1">Listing</div>
              <div className="w-32 text-center">Category</div>
              <div className="w-24 text-center">Condition</div>
              <div className="w-20 text-right">Price</div>
            </div>

            {/* Listings */}
            <div className="p-4 space-y-3">
              {filteredListings.map((listing) => (
                <ListingRow key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-[#141c28] border-t border-[#1c2430] text-xs text-[#64748b]">
              Showing {filteredListings.length} of {listings.length} listings
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassifiedsPage;
