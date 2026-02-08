import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiGrid,
  FiList,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiChevronDown,
  FiTag,
} from 'react-icons/fi';
import { Card, Badge, Button, Input, Loading, EmptyState } from '../components/common';
import useAuthStore from '../store/authStore';
import { classifiedsAPI } from '../api';

const ClassifiedsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceRange: 'all',
    condition: 'all',
  });

  // Classified type mapping from backend to frontend display
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
    'boots': 'equipment_sale',
    'jerseys': 'equipment_sale',
    'balls': 'equipment_sale',
  };

  useEffect(() => {
    const fetchClassifieds = async () => {
      try {
        setIsLoading(true);
        // Build API params from filters
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category !== 'all') params.classified_type = reverseClassifiedTypeMap[filters.category] || filters.category;

        const response = await classifiedsAPI.getAll(params);
        const classifiedsData = response.data?.classifieds || response.classifieds || [];

        // Transform API data to match component expectations
        // Backend uses 'classified_type' and 'creator', not 'ad_type' and 'poster'
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
              avatar: creator?.avatar || null,
              rating: creator?.rating || 0,
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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'players-wanted', label: 'Looking for Players' },
    { value: 'team-wanted', label: 'Looking for Team' },
    { value: 'equipment', label: 'Equipment for Sale' },
    { value: 'equipment-wanted', label: 'Equipment Wanted' },
    { value: 'coaching', label: 'Coaching' },
    { value: 'other', label: 'Other' },
  ];

  const conditions = [
    { value: 'all', label: 'Any Condition' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ];

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new':
        return 'success';
      case 'like-new':
        return 'primary';
      case 'good':
        return 'accent';
      case 'fair':
        return 'warning';
      default:
        return 'gray';
    }
  };

  // Client-side filtering
  const filteredListings = listings.filter((listing) => {
    if (filters.search && !listing.title?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category !== 'all' && listing.category?.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.condition !== 'all' && listing.condition?.toLowerCase() !== filters.condition.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading classifieds..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            <span className="gradient-text">Classifieds</span>
          </h1>
          <p className="text-dark-400">
            Buy, sell, and trade soccer gear within the community.
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/classifieds/create" className="btn-primary">
            <FiPlus /> Post Listing
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search listings..."
              leftIcon={<FiSearch size={18} />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'ring-2 ring-primary-500' : ''}
            >
              <FiFilter />
              Filters
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <div className="flex border border-dark-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <Card className="animate-slide-up">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Category</label>
                <select
                  className="input"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Condition</label>
                <select
                  className="input"
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Price Range</label>
                <select
                  className="input"
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                >
                  <option value="all">Any Price</option>
                  <option value="0-50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200+">$200+</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={FiTag}
          title="No listings found"
          description="Try adjusting your filters or check back later for new items."
          action={() => setFilters({ search: '', category: 'all', priceRange: 'all', condition: 'all' })}
          actionLabel="Clear Filters"
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredListings.map((listing) => (
            <Link
              key={listing.id}
              to={`/classifieds/${listing.id}`}
              className={`card-hover group ${viewMode === 'list' ? 'flex gap-6' : ''}`}
            >
              {/* Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'mb-4'}`}>
                <div className={`bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl flex items-center justify-center ${viewMode === 'list' ? 'h-full' : 'h-48'}`}>
                  <FiTag className="w-12 h-12 text-dark-500" />
                </div>
                <Badge variant={getConditionColor(listing.condition)} className="absolute top-3 left-3">
                  {listing.condition}
                </Badge>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                    {listing.title}
                  </h3>
                </div>

                <p className="text-2xl font-bold text-primary-400 mb-3">
                  ${listing.price}
                </p>

                <p className="text-sm text-dark-400 line-clamp-2 mb-4">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between text-sm text-dark-400">
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {listing.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {new Date(listing.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassifiedsPage;
