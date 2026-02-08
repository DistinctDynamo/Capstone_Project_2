import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  FiDollarSign,
  FiMapPin,
  FiArrowLeft,
  FiUpload,
  FiX,
  FiTag,
} from 'react-icons/fi';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  classified_type: z.enum(['looking_for_players', 'looking_for_team', 'equipment_sale', 'equipment_wanted', 'coaching', 'other']),
  condition: z.enum(['new', 'like-new', 'good', 'fair']).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  location: z.string().min(3, 'Location is required'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
});

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-wider text-[#64748b]">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
      )}
      <input
        className={`w-full bg-[#141c28] border ${error ? 'border-[#ef4444]' : 'border-[#2a3a4d]'} rounded-lg ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-[#ef4444]">{error}</p>}
  </div>
);

const CreateClassifiedPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  const categories = [
    { value: 'looking_for_players', label: 'Looking for Players' },
    { value: 'looking_for_team', label: 'Looking for Team' },
    { value: 'equipment_sale', label: 'Equipment for Sale' },
    { value: 'equipment_wanted', label: 'Equipment Wanted' },
    { value: 'coaching', label: 'Coaching' },
    { value: 'other', label: 'Other' },
  ];

  const conditions = [
    { value: 'new', label: 'New', description: 'Never used, with tags' },
    { value: 'like-new', label: 'Like New', description: 'Barely used' },
    { value: 'good', label: 'Good', description: 'Well maintained' },
    { value: 'fair', label: 'Fair', description: 'Shows wear' },
  ];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      classified_type: 'equipment_sale',
      condition: 'good',
      price: 0,
      location: '',
      description: '',
    },
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { classifiedsAPI } = await import('../api/classifieds');
      await classifiedsAPI.create(data);
      toast.success('Listing created successfully!');
      navigate('/classifieds');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#64748b] hover:text-white mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CREATE LISTING</h1>
          </div>
          <p className="text-[#64748b] text-sm">Sell your soccer gear to the community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photos */}
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Photos</span>
              <span className="text-xs text-[#64748b]">{images.length}/6</span>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#64748b] mb-4">Add up to 6 photos. First image will be the cover.</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-[#2a3a4d]">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#ef4444] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-[#22c55e] text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                {images.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-[#2a3a4d] flex flex-col items-center justify-center cursor-pointer hover:border-[#f59e0b]/50 transition-colors">
                    <FiUpload className="w-5 h-5 text-[#64748b] mb-1" />
                    <span className="text-[10px] text-[#64748b]">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Listing Details */}
          <div className="bg-[#0d1219] border border-[#1c2430] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430]">
              <span className="text-xs uppercase tracking-wider text-[#64748b]">Listing Details</span>
            </div>
            <div className="p-6 space-y-6">
              <InputField
                label="Title"
                placeholder="e.g., Nike Mercurial Vapor 14 Elite - Size 10"
                error={errors.title?.message}
                {...register('title')}
              />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#64748b]">Category</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                    <select
                      className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#22c55e]"
                      {...register('classified_type')}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <InputField
                  label="Price (CAD)"
                  type="number"
                  icon={FiDollarSign}
                  error={errors.price?.message}
                  {...register('price', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#64748b] mb-4">Condition</label>
                <div className="grid sm:grid-cols-4 gap-3">
                  {conditions.map((cond) => (
                    <label
                      key={cond.value}
                      className={`relative flex flex-col p-3 rounded-lg border cursor-pointer text-center transition-all ${
                        watch('condition') === cond.value
                          ? 'bg-[#f59e0b]/10 border-[#f59e0b]/50'
                          : 'bg-[#141c28] border-[#2a3a4d] hover:border-[#3a4a5d]'
                      }`}
                    >
                      <input
                        type="radio"
                        value={cond.value}
                        className="sr-only"
                        {...register('condition')}
                      />
                      {watch('condition') === cond.value && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f59e0b]" />
                      )}
                      <p className={`font-medium text-sm ${watch('condition') === cond.value ? 'text-[#fbbf24]' : 'text-white'}`}>
                        {cond.label}
                      </p>
                      <p className="text-[10px] text-[#64748b]">{cond.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              <InputField
                label="Location"
                placeholder="e.g., North York, ON"
                icon={FiMapPin}
                error={errors.location?.message}
                {...register('location')}
              />

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#64748b]">Description</label>
                <textarea
                  className="w-full bg-[#141c28] border border-[#2a3a4d] rounded-lg px-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#22c55e] transition-colors min-h-[150px] resize-none"
                  placeholder="Describe your item in detail. Include size, brand, any defects, and why you're selling."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-[#ef4444]">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-[#141c28] border border-[#2a3a4d] text-white rounded-lg font-medium hover:bg-[#1c2430] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#f59e0b]/25"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiTag className="w-5 h-5" />
                  Post Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassifiedPage;
