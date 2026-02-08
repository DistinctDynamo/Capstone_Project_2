import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiClock,
  FiDollarSign,
  FiX,
} from 'react-icons/fi';
import { GiSoccerField } from 'react-icons/gi';
import { Loading } from '../components/common';
import { fieldsAPI } from '../api';

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

// Field Card Component
const FieldCard = ({ field }) => {
  const typeColors = {
    indoor: { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
    outdoor: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
  };

  const surfaceColors = {
    natural: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', label: 'Natural Grass' },
    artificial: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]', label: 'Artificial Turf' },
  };

  const type = typeColors[field.type?.toLowerCase()] || typeColors.outdoor;
  const surface = surfaceColors[field.surface?.toLowerCase()] || surfaceColors.natural;

  return (
    <Link
      to={`/fields/${field.id}`}
      className="group bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden hover:border-[#2a3a4d] transition-all"
    >
      {/* Header Image */}
      <div className="relative h-40 bg-gradient-to-br from-[#1a5f2a]/20 to-[#141c28] flex items-center justify-center">
        {field.image ? (
          <img src={field.image} alt={field.name} className="w-full h-full object-cover" />
        ) : (
          <GiSoccerField className="w-16 h-16 text-[#4ade80]/30" />
        )}

        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg ${type.bg}`}>
          <span className={`text-xs font-medium uppercase tracking-wider ${type.text}`}>
            {field.type}
          </span>
        </div>

        {/* Availability */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg ${
          field.available ? 'bg-[#22c55e]/10' : 'bg-[#64748b]/10'
        }`}>
          <span className={`text-xs font-medium uppercase tracking-wider ${
            field.available ? 'text-[#22c55e]' : 'text-[#64748b]'
          }`}>
            {field.available ? 'Available' : 'Booked'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-[#4ade80] transition-colors mb-2">
          {field.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-[#64748b] mb-3">
          <FiMapPin className="w-3 h-3" />
          <span className="truncate">{field.address}</span>
        </div>

        {/* Rating & Surface */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm font-mono text-white">{field.rating || '—'}</span>
            <span className="text-xs text-[#64748b]">({field.reviews})</span>
          </div>
          <div className={`px-2 py-0.5 rounded ${surface.bg}`}>
            <span className={`text-xs ${surface.text}`}>{surface.label}</span>
          </div>
        </div>

        {/* Amenities */}
        {field.amenities && field.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {field.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-[#141c28] border border-[#2a3a4d] text-[#94a3b8] rounded"
              >
                {amenity}
              </span>
            ))}
            {field.amenities.length > 3 && (
              <span className="text-xs px-2 py-1 text-[#64748b]">
                +{field.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price & Availability */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1c2430]">
          <div className="flex items-center gap-1">
            <FiDollarSign className="w-4 h-4 text-[#4ade80]" />
            <span className="font-bold text-white">
              {field.pricePerHour === 0 ? 'Free' : `$${field.pricePerHour}/hr`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748b]">
            <FiClock className="w-3 h-3" />
            {field.nextAvailable}
          </div>
        </div>
      </div>
    </Link>
  );
};

const FieldsPage = () => {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    surface: 'all',
    availability: 'all',
  });

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setIsLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.type !== 'all') params.field_type = filters.type;
        if (filters.surface !== 'all') params.surface = filters.surface;

        const response = await fieldsAPI.getAll(params);
        const fieldsData = response.data?.fields || response.fields || [];

        const transformedFields = fieldsData.map(field => ({
          id: field._id || field.id,
          name: field.name,
          type: field.field_type || field.type || 'outdoor',
          surface: field.surface || 'natural',
          address: typeof field.address === 'object'
            ? `${field.address.street || ''}, ${field.address.city || ''}`.replace(/^, |, $/g, '')
            : field.location?.address || field.address || 'Unknown',
          rating: typeof field.rating === 'object' ? field.rating.average : (field.rating || 0),
          reviews: typeof field.rating === 'object' ? field.rating.count : (field.reviews_count || field.reviews || 0),
          pricePerHour: field.hourly_rate || field.price_per_hour || field.pricePerHour || 0,
          amenities: field.amenities?.map(a => typeof a === 'string' ? a : a.name) || [],
          available: field.is_available ?? field.available ?? true,
          image: field.images?.[0] || null,
          nextAvailable: field.next_available || 'Check availability',
        }));

        setFields(transformedFields);
      } catch (error) {
        console.error('Error fetching fields:', error);
        toast.error('Failed to load fields');
        setFields([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, []);

  const filteredFields = fields.filter((field) => {
    if (filters.search && !field.name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && field.type?.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    if (filters.surface !== 'all' && field.surface?.toLowerCase() !== filters.surface.toLowerCase()) {
      return false;
    }
    if (filters.availability === 'available' && !field.available) {
      return false;
    }
    return true;
  });

  const availableCount = fields.filter(f => f.available).length;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading fields..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-xl flex items-center justify-center">
              <GiSoccerField className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                <span className="text-[#4ade80]">Fields</span> Directory
              </h1>
              <p className="text-sm text-[#64748b]">
                {fields.length} fields • {availableCount} available now
              </p>
            </div>
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
                placeholder="Search fields..."
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

            {/* Type Filter */}
            <div className="flex gap-2">
              <FilterTab
                active={filters.type === 'all'}
                onClick={() => setFilters({ ...filters, type: 'all' })}
              >
                All Types
              </FilterTab>
              <FilterTab
                active={filters.type === 'indoor'}
                onClick={() => setFilters({ ...filters, type: 'indoor' })}
              >
                Indoor
              </FilterTab>
              <FilterTab
                active={filters.type === 'outdoor'}
                onClick={() => setFilters({ ...filters, type: 'outdoor' })}
              >
                Outdoor
              </FilterTab>
            </div>

            {/* Surface Filter */}
            <div className="flex gap-2">
              <FilterTab
                active={filters.surface === 'all'}
                onClick={() => setFilters({ ...filters, surface: 'all' })}
              >
                All Surfaces
              </FilterTab>
              <FilterTab
                active={filters.surface === 'natural'}
                onClick={() => setFilters({ ...filters, surface: 'natural' })}
              >
                Natural
              </FilterTab>
              <FilterTab
                active={filters.surface === 'artificial'}
                onClick={() => setFilters({ ...filters, surface: 'artificial' })}
              >
                Artificial
              </FilterTab>
            </div>

            {/* Available Only Toggle */}
            <FilterTab
              active={filters.availability === 'available'}
              onClick={() => setFilters({
                ...filters,
                availability: filters.availability === 'available' ? 'all' : 'available'
              })}
            >
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
              </span>
              Available
            </FilterTab>
          </div>
        </div>

        {/* Results */}
        {filteredFields.length === 0 ? (
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-16 text-center">
            <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
              <GiSoccerField className="w-10 h-10 text-[#64748b]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No fields found</h3>
            <p className="text-[#64748b] mb-6">Try adjusting your filters</p>
            <button
              onClick={() => setFilters({ search: '', type: 'all', surface: 'all', availability: 'all' })}
              className="px-4 py-2 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg hover:bg-[#1c2430] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldsPage;
