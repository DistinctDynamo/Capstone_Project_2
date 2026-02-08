import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiClock,
  FiUser,
  FiStar,
  FiShare2,
  FiHeart,
  FiMessageSquare,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
} from 'react-icons/fi';
import { Card, Badge, Button, Avatar, Loading, Modal } from '../components/common';
import useAuthStore from '../store/authStore';
import { classifiedsAPI, messagesAPI } from '../api';

const ClassifiedDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Classified type mapping from backend to frontend display
  const classifiedTypeMap = {
    looking_for_players: 'players-wanted',
    looking_for_team: 'team-wanted',
    equipment_sale: 'equipment',
    equipment_wanted: 'equipment-wanted',
    coaching: 'coaching',
    other: 'other',
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await classifiedsAPI.getById(id);
        const listingData = response.data?.classified || response.classified || response;

        // Transform API data to match component expectations
        // Backend uses 'creator' and 'classified_type', frontend was expecting 'poster' and 'ad_type'
        const creator = listingData.creator;

        const transformedListing = {
          id: listingData._id || listingData.id,
          title: listingData.title,
          category: classifiedTypeMap[listingData.classified_type] || listingData.classified_type || 'other',
          price: listingData.price || 0,
          condition: listingData.condition || 'good',
          location: listingData.location || 'Unknown',
          images: listingData.images || [],
          description: listingData.description || 'No description available.',
          seller: {
            id: creator?._id || creator?.id,
            name: creator?.first_name
              ? `${creator.first_name} ${creator.last_name || ''}`.trim()
              : creator?.username || 'Unknown',
            avatar: creator?.avatar || null,
            email: creator?.email || null,
            rating: creator?.rating || 0,
            reviewCount: creator?.reviews_count || 0,
            memberSince: creator?.created_at || new Date().toISOString(),
            listingsCount: creator?.listings_count || 0,
            responseTime: 'Usually responds within a few hours',
          },
          contactEmail: listingData.contact_email,
          contactPhone: listingData.contact_phone,
          positionNeeded: listingData.position_needed,
          skillLevel: listingData.skill_level,
          status: listingData.status,
          createdAt: listingData.created_at || new Date().toISOString(),
          views: listingData.views || 0,
          saved: listingData.saves || 0,
        };

        setListing(transformedListing);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error('Failed to load listing details');
        setListing(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

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

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save listings');
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Added to saved listings');
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact seller');
      return;
    }
    if (listing?.seller?.id === user?._id) {
      toast.error('You cannot message yourself');
      return;
    }
    setShowContactModal(true);
  };

  const isOwnListing = listing?.seller?.id === user?._id;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="lg" text="Loading listing..." />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Listing not found</h1>
        <Link to="/classifieds" className="btn-primary">
          Back to Classifieds
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/classifieds" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft />
        Back to Classifieds
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiTag className="w-24 h-24 text-dark-500" />
              )}
            </div>
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/80 flex items-center justify-center text-white hover:bg-dark-800 transition-colors"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/80 flex items-center justify-center text-white hover:bg-dark-800 transition-colors"
                >
                  <FiChevronRight />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {listing.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Listing Info */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={getConditionColor(listing.condition)} size="lg">
                    {listing.condition}
                  </Badge>
                  <Badge variant="gray">
                    {listing.category}
                  </Badge>
                </div>
                <h1 className="text-3xl font-display font-bold text-white">
                  {listing.title}
                </h1>
              </div>
              <p className="text-4xl font-bold text-primary-400">
                ${listing.price}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-dark-400 mb-6 pb-6 border-b border-dark-700">
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                {listing.location}
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                Listed {new Date(listing.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <FiHeart className="w-4 h-4" />
                {listing.saved} saved
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <div className="prose prose-invert max-w-none">
                {listing.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-dark-300 mb-4 whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="sticky top-24">
            {isOwnListing ? (
              <Link to={`/classifieds/${id}/edit`} className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
                Edit Listing
              </Link>
            ) : (
              <Button variant="primary" className="w-full mb-4" onClick={handleContact}>
                <FiMessageSquare />
                Contact Seller
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleSave}
              >
                <FiHeart className={isSaved ? 'fill-red-500 text-red-500' : ''} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="secondary" className="flex-1">
                <FiShare2 />
                Share
              </Button>
            </div>
          </Card>

          {/* Seller Card */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={listing.seller.avatar} name={listing.seller.name} size="lg" />
              <div>
                <p className="font-medium text-white">{listing.seller.name}</p>
                <div className="flex items-center gap-1 text-sm">
                  <FiStar className="w-4 h-4 text-accent-400 fill-accent-400" />
                  <span className="text-white">{listing.seller.rating}</span>
                  <span className="text-dark-400">({listing.seller.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-dark-400 pt-4 border-t border-dark-700">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                Member since {new Date(listing.seller.memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <FiTag className="w-4 h-4" />
                {listing.seller.listingsCount} active listings
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                {listing.seller.responseTime}
              </div>
            </div>
            <Link
              to={`/players/${listing.seller.id}`}
              className="btn-secondary w-full mt-4"
            >
              View Profile
            </Link>
          </Card>

          {/* Safety Tips */}
          <Card className="bg-accent-500/10 border-accent-500/30">
            <h3 className="text-lg font-semibold text-accent-400 mb-3">Safety Tips</h3>
            <ul className="text-sm text-dark-300 space-y-2">
              <li>- Meet in a public place</li>
              <li>- Inspect items before paying</li>
              <li>- Use secure payment methods</li>
              <li>- Trust your instincts</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Contact Seller">
        <div className="space-y-4">
          <p className="text-dark-400">
            Send a message to {listing.seller.name} about this listing.
          </p>
          <textarea
            className="input min-h-[120px] resize-none"
            placeholder="Hi, I'm interested in this item. Is it still available?"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
          />
          <Modal.Actions>
            <Button variant="secondary" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isSendingMessage}
              onClick={async () => {
                if (!contactMessage.trim()) {
                  toast.error('Please enter a message');
                  return;
                }
                setIsSendingMessage(true);
                try {
                  // Create or get existing conversation with the seller
                  const convResponse = await messagesAPI.createConversation({
                    participantId: listing.seller.id,
                    type: 'direct'
                  });

                  const conversationId = convResponse.data?.conversation?._id || convResponse.data?.conversation?.id;

                  if (!conversationId) {
                    throw new Error('Failed to create conversation');
                  }

                  // Send the message about the listing
                  const messageContent = `[Re: ${listing.title}]\n\n${contactMessage}`;
                  await messagesAPI.sendMessage(conversationId, messageContent);

                  // Also record the response in the classified
                  await classifiedsAPI.respond(id, contactMessage).catch(() => {
                    // Silent fail - the main message was sent
                  });

                  setShowContactModal(false);
                  setContactMessage('');
                  toast.success('Message sent!');

                  // Navigate to the conversation
                  navigate(`/messages/${conversationId}`);
                } catch (error) {
                  console.error('Error sending message:', error);
                  toast.error(error.response?.data?.message || 'Failed to send message');
                } finally {
                  setIsSendingMessage(false);
                }
              }}
            >
              Send Message
            </Button>
          </Modal.Actions>
        </div>
      </Modal>
    </div>
  );
};

export default ClassifiedDetailPage;
