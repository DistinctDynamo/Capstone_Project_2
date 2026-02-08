import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiStar,
  FiChevronDown,
  FiClock,
  FiCheck,
  FiDollarSign,
} from 'react-icons/fi';
import { GiSoccerField } from 'react-icons/gi';
import { Card, Badge, Button, Input, Loading, EmptyState } from '../components/common';
import { fieldsAPI } from '../api';

const FieldsPage = () => {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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
        // Build API params from filters
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.type !== 'all') params.field_type = filters.type;
        if (filters.surface !== 'all') params.surface = filters.surface;

        const response = await fieldsAPI.getAll(params);
        const fieldsData = response.data?.fields || response.fields || [];

        // Transform API data to match component expectations
        const transformedFields = fieldsData.map(field => ({
          id: field._id || field.id,
          name: field.name,
          type: field.field_type || field.type || 'outdoor',
          surface: field.surface || 'natural',
          // Handle address as object {street, city} or string
          address: typeof field.address === 'object'
            ? `${field.address.street || ''}, ${field.address.city || ''}`.replace(/^, |, $/g, '')
            : field.location?.address || field.address || 'Unknown',
          // Handle rating as object {average, count} or number
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

  // Client-side filtering
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading fields..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          <span className="gradient-text">Fields</span>
        </h1>
        <p className="text-dark-400">
          Discover and book soccer fields across the GTA.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search fields..."
              leftIcon={<FiSearch size={18} />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'ring-2 ring-primary-500' : ''}
          >
            <FiFilter />
            Filters
            <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <Card className="animate-slide-up">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Type</label>
                <select
                  className="input"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="all">All Types</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Surface</label>
                <select
                  className="input"
                  value={filters.surface}
                  onChange={(e) => setFilters({ ...filters, surface: e.target.value })}
                >
                  <option value="all">All Surfaces</option>
                  <option value="natural">Natural Grass</option>
                  <option value="artificial">Artificial Turf</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Availability</label>
                <select
                  className="input"
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="available">Available Now</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      {filteredFields.length === 0 ? (
        <EmptyState
          icon={GiSoccerField}
          title="No fields found"
          description="Try adjusting your filters to find available fields."
          action={() => setFilters({ search: '', type: 'all', surface: 'all', availability: 'all' })}
          actionLabel="Clear Filters"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <Link
              key={field.id}
              to={`/fields/${field.id}`}
              className="card-hover group"
            >
              {/* Image */}
              <div className="relative mb-4">
                <div className="h-40 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
                  {field.image ? (
                    <img src={field.image} alt={field.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <GiSoccerField className="w-16 h-16 text-primary-400 opacity-50" />
                  )}
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={field.type === 'indoor' ? 'accent' : 'primary'}>
                    {field.type}
                  </Badge>
                </div>
                {field.available ? (
                  <Badge variant="success" className="absolute top-3 right-3">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="gray" className="absolute top-3 right-3">
                    Booked
                  </Badge>
                )}
              </div>

              {/* Info */}
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors mb-2">
                {field.name}
              </h3>

              <div className="flex items-center gap-2 text-sm text-dark-400 mb-3">
                <FiMapPin className="w-4 h-4" />
                {field.address}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-accent-400 fill-accent-400" />
                  <span className="text-sm font-medium text-white">{field.rating}</span>
                  <span className="text-sm text-dark-400">({field.reviews})</span>
                </div>
                <span className="text-dark-600">|</span>
                <span className="text-sm text-dark-400 capitalize">{field.surface}</span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {field.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-dark-800 text-dark-300 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Price & Availability */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <div className="flex items-center gap-1">
                  <FiDollarSign className="w-4 h-4 text-primary-400" />
                  <span className="font-semibold text-white">
                    {field.pricePerHour === 0 ? 'Free' : `$${field.pricePerHour}/hr`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-dark-400">
                  <FiClock className="w-4 h-4" />
                  {field.nextAvailable}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldsPage;
