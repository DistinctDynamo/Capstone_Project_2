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
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';
import { GiSoccerField } from 'react-icons/gi';
import { Card, Badge, Button, Avatar, Loading, Modal } from '../components/common';
import useAuthStore from '../store/authStore';
import { fieldsAPI } from '../api';

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

        // Helper to format operating hours
        const formatHours = (hours) => {
          if (!hours) return null;
          // If already formatted as string, return as is
          if (typeof hours.monday === 'string') return hours;
          // Convert {open: '06:00', close: '23:00'} to '6:00 AM - 11:00 PM'
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

        // Transform API data to match component expectations
        const transformedField = {
          id: fieldData._id || fieldData.id,
          name: fieldData.name,
          type: fieldData.field_type || fieldData.type || 'outdoor',
          surface: fieldData.surface || 'natural',
          size: fieldData.dimensions || fieldData.size || 'Standard',
          // Handle address as object {street, city} or string
          address: typeof fieldData.address === 'object'
            ? `${fieldData.address.street || ''}, ${fieldData.address.city || ''}`.replace(/^, |, $/g, '')
            : fieldData.location?.address || fieldData.address || 'Unknown',
          coordinates: {
            lat: fieldData.address?.coordinates?.lat || fieldData.location?.coordinates?.lat || 0,
            lng: fieldData.address?.coordinates?.lng || fieldData.location?.coordinates?.lng || 0,
          },
          // Handle rating as object {average, count} or number
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

    // Convert 12-hour format to 24-hour format for backend
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading field details..." />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Field not found</h1>
        <Link to="/fields" className="btn-primary">
          Back to Fields
        </Link>
      </div>
    );
  }

  const timeSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/fields" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft />
        Back to Fields
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="h-80 bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
              {field.images.length > 0 ? (
                <img src={field.images[0]} alt={field.name} className="w-full h-full object-cover" />
              ) : (
                <GiSoccerField className="w-32 h-32 text-primary-400 opacity-50" />
              )}
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={field.type === 'indoor' ? 'accent' : 'primary'} size="lg">
                {field.type}
              </Badge>
              <Badge variant="gray" size="lg">
                {field.surface}
              </Badge>
            </div>
          </div>

          {/* Field Info */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  {field.name}
                </h1>
                <div className="flex items-center gap-4 text-dark-400">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {field.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="w-5 h-5 text-accent-400 fill-accent-400" />
                <span className="text-lg font-bold text-white">{field.rating}</span>
                <span className="text-dark-400">({field.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6 p-4 bg-dark-800/50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-dark-400">Size</p>
                <p className="font-semibold text-white">{field.size}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-dark-400">Surface</p>
                <p className="font-semibold text-white capitalize">{field.surface}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-dark-400">Price</p>
                <p className="font-semibold text-primary-400">
                  {field.pricePerHour === 0 ? 'Free' : `$${field.pricePerHour}/hr`}
                </p>
              </div>
            </div>

            <div className="border-t border-dark-700 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">About this field</h2>
              <div className="prose prose-invert max-w-none">
                {field.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-dark-300 mb-4 whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Card>

          {/* Amenities */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Amenities</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {field.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    amenity.available ? 'bg-primary-500/10' : 'bg-dark-800/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    amenity.available ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-500'
                  }`}>
                    <FiCheck className="w-4 h-4" />
                  </div>
                  <span className={amenity.available ? 'text-white' : 'text-dark-500 line-through'}>
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Reviews</h2>
              <Button variant="secondary" size="sm">Write Review</Button>
            </div>
            <div className="space-y-4">
              {field.reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-dark-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={review.user.avatar} name={review.user.name} size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{review.user.name}</p>
                      <p className="text-sm text-dark-400">
                        {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-accent-400 fill-accent-400' : 'text-dark-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-dark-300">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-white mb-1">
                {field.pricePerHour === 0 ? 'Free' : `$${field.pricePerHour}`}
              </p>
              {field.pricePerHour > 0 && <p className="text-dark-400">per hour</p>}
            </div>

            <Button
              variant="primary"
              className="w-full mb-4"
              onClick={() => setShowBookingModal(true)}
            >
              {field.pricePerHour === 0 ? 'Check Availability' : 'Book Now'}
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">
                <FiShare2 />
                Share
              </Button>
              <Button variant="secondary" className="flex-1">
                <FiHeart />
                Save
              </Button>
            </div>
          </Card>

          {/* Hours */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiClock className="text-primary-400" />
              Hours
            </h3>
            <div className="space-y-2 text-sm">
              {Object.entries(field.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-dark-400 capitalize">{day}</span>
                  <span className="text-white">{hours}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href={`tel:${field.contact.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
              >
                <FiPhone className="w-5 h-5 text-primary-400" />
                <span className="text-white">{field.contact.phone}</span>
              </a>
              <a
                href={field.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
              >
                <FiGlobe className="w-5 h-5 text-primary-400" />
                <span className="text-white">Visit Website</span>
              </a>
            </div>
          </Card>

          {/* Upcoming Events */}
          {field.upcomingEvents.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {field.upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
                  >
                    <p className="font-medium text-white mb-1">{event.title}</p>
                    <p className="text-sm text-dark-400">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title="Book Field" size="lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Select Date
            </label>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Start Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedStartTime(time)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    selectedStartTime === time
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              End Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedEndTime(time)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    selectedEndTime === time
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          <Modal.Actions>
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBooking} isLoading={isBooking}>
              {field.pricePerHour === 0 ? 'Reserve Spot' : 'Proceed to Payment'}
            </Button>
          </Modal.Actions>
        </div>
      </Modal>
    </div>
  );
};

export default FieldDetailPage;
