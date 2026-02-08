import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiStar,
  FiClock,
  FiArrowLeft,
  FiShare2,
  FiHeart,
  FiPhone,
  FiGlobe,
  FiCheck,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';
import { GiSoccerField } from 'react-icons/gi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { fieldsAPI } from '../api';

// Info Card Component
const InfoCard = ({ label, value, valueClass = 'text-white' }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4 text-center">
    <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">{label}</p>
    <p className={`font-semibold ${valueClass}`}>{value}</p>
  </div>
);

// Amenity Item Component
const AmenityItem = ({ name, available }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg ${available ? 'bg-[#22c55e]/10 border border-[#22c55e]/20' : 'bg-[#141c28] border border-[#2a3a4d]'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${available ? 'bg-[#22c55e]/20 text-[#4ade80]' : 'bg-[#2a3a4d] text-[#64748b]'}`}>
      <FiCheck className="w-4 h-4" />
    </div>
    <span className={available ? 'text-white' : 'text-[#64748b] line-through'}>
      {name}
    </span>
  </div>
);

// Review Card Component
const ReviewCard = ({ review }) => (
  <div className="bg-[#141c28] border border-[#2a3a4d] rounded-lg p-4">
    <div className="flex items-center gap-3 mb-3">
      {review.user.avatar ? (
        <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#1a5f2a] flex items-center justify-center">
          <span className="text-sm font-bold text-[#4ade80]">
            {review.user.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium text-white">{review.user.name}</p>
        <p className="text-xs text-[#64748b]">
          {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-4 h-4 ${i < review.rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#2a3a4d]'}`}
          />
        ))}
      </div>
    </div>
    <p className="text-[#94a3b8]">{review.comment}</p>
  </div>
);

// Hours Row Component
const HoursRow = ({ day, hours }) => (
  <div className="flex justify-between py-2 border-b border-[#1c2430] last:border-0">
    <span className="text-[#64748b] capitalize">{day}</span>
    <span className="text-white font-mono text-sm">{hours}</span>
  </div>
);

const FieldDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [field, setField] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchField = async () => {
      try {
        setIsLoading(true);
        const response = await fieldsAPI.getById(id);
        const fieldData = response.data?.field || response.field || response;

        const formatHours = (hours) => {
          if (!hours) return null;
          if (typeof hours.monday === 'string') return hours;
          const formatTime = (time) => {
            if (!time) return '';
            const [h, m] = time.split(':').map(Number);
            const suffix = h >= 12 ? 'PM' : 'AM';
            const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
          };
          const result = {};
          for (const day of Object.keys(hours)) {
            const dayHours = hours[day];
            if (typeof dayHours === 'object' && dayHours.open) {
              result[day] = `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
            } else {
              result[day] = dayHours;
            }
          }
          return result;
        };

        const transformedField = {
          id: fieldData._id || fieldData.id,
          name: fieldData.name,
          type: fieldData.field_type || fieldData.type || 'outdoor',
          surface: fieldData.surface || 'natural',
          size: fieldData.dimensions || fieldData.size || 'Standard',
          address: typeof fieldData.address === 'object'
            ? `${fieldData.address.street || ''}, ${fieldData.address.city || ''}`.replace(/^, |, $/g, '')
            : fieldData.location?.address || fieldData.address || 'Unknown',
          coordinates: {
            lat: fieldData.address?.coordinates?.lat || fieldData.location?.coordinates?.lat || 0,
            lng: fieldData.address?.coordinates?.lng || fieldData.location?.coordinates?.lng || 0,
          },
          rating: typeof fieldData.rating === 'object' ? fieldData.rating.average : (fieldData.rating || 0),
          reviewCount: typeof fieldData.rating === 'object' ? fieldData.rating.count : (fieldData.reviews?.length || fieldData.reviews_count || 0),
          pricePerHour: fieldData.hourly_rate || fieldData.price_per_hour || fieldData.pricePerHour || 0,
          description: fieldData.description || 'No description available.',
          amenities: (fieldData.amenities || []).map(a => ({
            name: typeof a === 'string' ? a : (a.name || a),
            available: a.available ?? true,
          })),
          hours: formatHours(fieldData.operating_hours) || fieldData.hours || {
            monday: '6:00 AM - 10:00 PM',
            tuesday: '6:00 AM - 10:00 PM',
            wednesday: '6:00 AM - 10:00 PM',
            thursday: '6:00 AM - 10:00 PM',
            friday: '6:00 AM - 10:00 PM',
            saturday: '7:00 AM - 9:00 PM',
            sunday: '7:00 AM - 9:00 PM',
          },
          contact: {
            phone: fieldData.contact?.phone || fieldData.phone || 'N/A',
            website: fieldData.contact?.website || fieldData.website || '',
          },
          images: fieldData.images || [],
          reviews: (fieldData.reviews || []).map(r => ({
            id: r._id || r.id,
            user: {
              name: r.user?.first_name
                ? `${r.user.first_name} ${r.user.last_name || ''}`.trim()
                : r.user?.name || 'Anonymous',
              avatar: r.user?.profile_image || null,
            },
            rating: r.rating || 0,
            comment: r.comment || r.content || '',
            date: r.createdAt || new Date().toISOString(),
          })),
          upcomingEvents: (fieldData.upcoming_events || []).map(e => ({
            id: e._id || e.id,
            title: e.title,
            date: e.date || e.start_date,
            time: e.start_time || e.time || 'TBD',
            players: e.attendees?.length || e.players || 0,
          })),
        };

        setField(transformedField);
      } catch (error) {
        console.error('Error fetching field:', error);
        toast.error('Failed to load field details');
        setField(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchField();
  }, [id]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a field');
      return;
    }
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      toast.error('Please select a date, start time, and end time');
      return;
    }

    const convertTo24Hour = (time12h) => {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
    };

    setIsBooking(true);
    try {
      const { bookingsAPI } = await import('../api/fields');
      await bookingsAPI.create({
        field: id,
        date: selectedDate,
        start_time: convertTo24Hour(selectedStartTime),
        end_time: convertTo24Hour(selectedEndTime),
      });
      setShowBookingModal(false);
      toast.success('Booking request sent! You will receive a confirmation email.');
      setSelectedDate('');
      setSelectedStartTime('');
      setSelectedEndTime('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading field details..." />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
            <GiSoccerField className="w-10 h-10 text-[#64748b]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Field not found</h1>
          <p className="text-[#64748b] mb-6">This field may have been removed or doesn't exist</p>
          <Link
            to="/fields"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Fields
          </Link>
        </div>
      </div>
    );
  }

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

  const timeSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/fields"
          className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Fields</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-[#1a5f2a]/30 to-[#141c28] flex items-center justify-center relative">
                {field.images.length > 0 ? (
                  <img src={field.images[0]} alt={field.name} className="w-full h-full object-cover" />
                ) : (
                  <GiSoccerField className="w-32 h-32 text-[#4ade80]/30" />
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-lg ${type.bg}`}>
                    <span className={`text-xs font-medium uppercase tracking-wider ${type.text}`}>
                      {field.type}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${surface.bg}`}>
                    <span className={`text-xs font-medium uppercase tracking-wider ${surface.text}`}>
                      {surface.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">{field.name}</h1>
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <FiMapPin className="w-4 h-4" />
                      <span>{field.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#f59e0b]/10 rounded-lg">
                    <FiStar className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]" />
                    <span className="text-lg font-bold font-mono text-white">{field.rating.toFixed(1)}</span>
                    <span className="text-sm text-[#64748b]">({field.reviewCount})</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <InfoCard label="Size" value={field.size} />
                  <InfoCard label="Surface" value={field.surface} valueClass="text-white capitalize" />
                  <InfoCard
                    label="Price"
                    value={field.pricePerHour === 0 ? 'Free' : `$${field.pricePerHour}/hr`}
                    valueClass="text-[#4ade80]"
                  />
                </div>

                <div className="border-t border-[#1c2430] pt-6">
                  <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                    About This Field
                  </h2>
                  <div className="text-[#94a3b8] whitespace-pre-wrap">
                    {field.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                Amenities
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {field.amenities.map((amenity, index) => (
                  <AmenityItem key={index} name={amenity.name} available={amenity.available} />
                ))}
              </div>
              {field.amenities.length === 0 && (
                <p className="text-center text-[#64748b] py-8">No amenities listed</p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
                  Reviews ({field.reviews.length})
                </h2>
                <button className="px-3 py-1.5 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all text-sm">
                  Write Review
                </button>
              </div>
              <div className="space-y-3">
                {field.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {field.reviews.length === 0 && (
                  <p className="text-center text-[#64748b] py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold font-mono text-white mb-1">
                  {field.pricePerHour === 0 ? 'Free' : `$${field.pricePerHour}`}
                </p>
                {field.pricePerHour > 0 && (
                  <p className="text-xs text-[#64748b] uppercase tracking-wider">per hour</p>
                )}
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all font-medium"
              >
                {field.pricePerHour === 0 ? 'Check Availability' : 'Book Now'}
              </button>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2">
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex-1 py-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2">
                  <FiHeart className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-[#4ade80]" />
                Hours
              </h3>
              <div>
                {Object.entries(field.hours).map(([day, hours]) => (
                  <HoursRow key={day} day={day} hours={hours} />
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                Contact
              </h3>
              <div className="space-y-3">
                <a
                  href={`tel:${field.contact.phone}`}
                  className="flex items-center gap-3 p-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg hover:border-[#3d4f63] transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                    <FiPhone className="w-5 h-5 text-[#4ade80]" />
                  </div>
                  <span className="text-white">{field.contact.phone}</span>
                </a>
                {field.contact.website && (
                  <a
                    href={field.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg hover:border-[#3d4f63] transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
                      <FiGlobe className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <span className="text-white">Visit Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            {field.upcomingEvents.length > 0 && (
              <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
                <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {field.upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block p-4 bg-[#141c28] border border-[#2a3a4d] rounded-lg hover:border-[#3d4f63] transition-all"
                    >
                      <p className="font-medium text-white mb-2">{event.title}</p>
                      <div className="flex items-center gap-4 text-sm text-[#64748b]">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {event.time}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowBookingModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Book Field</h2>
            <p className="text-sm text-[#64748b] mb-6">Select your preferred date and time</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white focus:outline-none focus:border-[#4ade80]/50"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Start Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={`start-${time}`}
                      type="button"
                      onClick={() => setSelectedStartTime(time)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selectedStartTime === time
                          ? 'bg-[#1a5f2a] text-[#4ade80] border border-[#22c55e]/30'
                          : 'bg-[#141c28] text-[#94a3b8] border border-[#2a3a4d] hover:border-[#3d4f63]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  End Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={`end-${time}`}
                      type="button"
                      onClick={() => setSelectedEndTime(time)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selectedEndTime === time
                          ? 'bg-[#1a5f2a] text-[#4ade80] border border-[#22c55e]/30'
                          : 'bg-[#141c28] text-[#94a3b8] border border-[#2a3a4d] hover:border-[#3d4f63]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={isBooking}
                className="flex-1 py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all font-medium disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : field.pricePerHour === 0 ? 'Reserve Spot' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDetailPage;
