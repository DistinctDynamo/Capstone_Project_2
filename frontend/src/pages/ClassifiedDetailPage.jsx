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
  FiEye,
  FiAlertCircle,
} from 'react-icons/fi';
import { Loading } from '../components/common';
import useAuthStore from '../store/authStore';
import { classifiedsAPI, messagesAPI } from '../api';

// Info Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-[#1c2430] last:border-0">
    <div className="w-8 h-8 rounded-lg bg-[#141c28] flex items-center justify-center">
      <Icon className="w-4 h-4 text-[#64748b]" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-[#64748b] uppercase tracking-wider">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  </div>
);

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

  const classifiedTypeMap = {
    looking_for_players: 'players-wanted',
    looking_for_team: 'team-wanted',
    equipment_sale: 'equipment',
    equipment_wanted: 'equipment-wanted',
    coaching: 'coaching',
    other: 'other',
  };

  const categoryColors = {
    'players-wanted': { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    'team-wanted': { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]' },
    'equipment': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    'equipment-wanted': { bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
    'coaching': { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
    'other': { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]' },
  };

  const conditionColors = {
    new: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    'like-new': { bg: 'bg-[#4ade80]/10', text: 'text-[#4ade80]' },
    good: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
    fair: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await classifiedsAPI.getById(id);
        const listingData = response.data?.classified || response.classified || response;

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

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setIsSendingMessage(true);
    try {
      const convResponse = await messagesAPI.createConversation({
        participantId: listing.seller.id,
        type: 'direct'
      });

      const conversationId = convResponse.data?.conversation?._id || convResponse.data?.conversation?.id;

      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      const messageContent = `[Re: ${listing.title}]\n\n${contactMessage}`;
      await messagesAPI.sendMessage(conversationId, messageContent);

      await classifiedsAPI.respond(id, contactMessage).catch(() => {});

      setShowContactModal(false);
      setContactMessage('');
      toast.success('Message sent!');
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const isOwnListing = listing?.seller?.id === user?._id;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e14]">
        <Loading size="lg" text="Loading listing..." />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-[#141c28] border border-[#2a3a4d] flex items-center justify-center mx-auto mb-4">
            <FiTag className="w-10 h-10 text-[#64748b]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Listing not found</h1>
          <p className="text-[#64748b] mb-6">This listing may have been removed or doesn't exist</p>
          <Link
            to="/classifieds"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Classifieds
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryColors[listing.category] || categoryColors.other;
  const condition = conditionColors[listing.condition] || conditionColors.good;

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/classifieds"
          className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Classifieds</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-[#1a5f2a]/20 to-[#141c28] flex items-center justify-center relative">
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiTag className="w-24 h-24 text-[#4ade80]/30" />
                )}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5" />
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
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`px-3 py-1 rounded-lg ${condition.bg}`}>
                        <span className={`text-xs font-medium uppercase tracking-wider ${condition.text}`}>
                          {listing.condition}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg ${category.bg}`}>
                        <span className={`text-xs font-medium uppercase tracking-wider ${category.text}`}>
                          {listing.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                  </div>
                  <p className="text-4xl font-bold font-mono text-[#4ade80]">
                    ${listing.price}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-[#64748b] mb-6 pb-6 border-b border-[#1c2430]">
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
                    <FiEye className="w-4 h-4" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHeart className="w-4 h-4" />
                    {listing.saved} saved
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">Description</h2>
                  <div className="text-[#94a3b8] whitespace-pre-wrap">
                    {listing.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6 sticky top-24">
              {isOwnListing ? (
                <Link
                  to={`/classifieds/${id}/edit`}
                  className="block w-full py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all text-center font-medium mb-4"
                >
                  Edit Listing
                </Link>
              ) : (
                <button
                  onClick={handleContact}
                  className="w-full py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all flex items-center justify-center gap-2 font-medium mb-4"
                >
                  <FiMessageSquare className="w-5 h-5" />
                  Contact Seller
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    isSaved
                      ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
                      : 'bg-[#141c28] text-[#64748b] border-[#2a3a4d] hover:text-white hover:border-[#3d4f63]'
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${isSaved ? 'fill-[#ef4444]' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button className="flex-1 py-2 bg-[#141c28] text-[#64748b] rounded-lg border border-[#2a3a4d] hover:text-white hover:border-[#3d4f63] transition-all flex items-center justify-center gap-2">
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
              <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-4">
                Seller Information
              </h3>
              <div className="flex items-center gap-4 mb-4">
                {listing.seller.avatar ? (
                  <img src={listing.seller.avatar} alt={listing.seller.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1a5f2a] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#4ade80]">
                      {listing.seller.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{listing.seller.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <FiStar className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                    <span className="font-mono text-white">{listing.seller.rating}</span>
                    <span className="text-[#64748b]">({listing.seller.reviewCount})</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1c2430]">
                <InfoRow
                  icon={FiUser}
                  label="Member Since"
                  value={new Date(listing.seller.memberSince).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                />
                <InfoRow
                  icon={FiTag}
                  label="Active Listings"
                  value={listing.seller.listingsCount}
                />
                <InfoRow
                  icon={FiClock}
                  label="Response Time"
                  value={listing.seller.responseTime}
                />
              </div>
              <Link
                to={`/players/${listing.seller.id}`}
                className="block w-full py-2 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all text-center text-sm font-medium mt-4"
              >
                View Profile
              </Link>
            </div>

            {/* Safety Tips */}
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <FiAlertCircle className="w-5 h-5 text-[#f59e0b]" />
                <h3 className="text-sm font-medium text-[#f59e0b] uppercase tracking-wider">
                  Safety Tips
                </h3>
              </div>
              <ul className="text-sm text-[#94a3b8] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b]">•</span>
                  Meet in a public place
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b]">•</span>
                  Inspect items before paying
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b]">•</span>
                  Use secure payment methods
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b]">•</span>
                  Trust your instincts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowContactModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d1219] border border-[#1c2430] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Contact Seller</h2>
            <p className="text-sm text-[#64748b] mb-6">
              Send a message to {listing.seller.name} about this listing.
            </p>
            <textarea
              className="w-full px-4 py-3 bg-[#141c28] border border-[#2a3a4d] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[#4ade80]/50 min-h-[120px] resize-none"
              placeholder="Hi, I'm interested in this item. Is it still available?"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-3 bg-[#141c28] text-white rounded-lg border border-[#2a3a4d] hover:bg-[#1c2430] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isSendingMessage}
                className="flex-1 py-3 bg-[#1a5f2a] text-[#4ade80] rounded-lg border border-[#22c55e]/30 hover:bg-[#22723a] transition-all font-medium disabled:opacity-50"
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassifiedDetailPage;
