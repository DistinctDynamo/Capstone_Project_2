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
  FiImage,
} from 'react-icons/fi';
import { Card, Button, Input } from '../components/common';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  classified_type: z.enum(['looking_for_players', 'looking_for_team', 'equipment_sale', 'equipment_wanted', 'coaching', 'other']),
  condition: z.enum(['new', 'like-new', 'good', 'fair']).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  location: z.string().min(3, 'Location is required'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
});

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
    { value: 'like-new', label: 'Like New', description: 'Barely used, no visible wear' },
    { value: 'good', label: 'Good', description: 'Used but well maintained' },
    { value: 'fair', label: 'Fair', description: 'Shows wear, still functional' },
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
      // Import classifiedsAPI and make the actual API call
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-4 transition-colors"
        >
          <FiArrowLeft />
          Back
        </button>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Create <span className="gradient-text">Listing</span>
        </h1>
        <p className="text-dark-400">
          Sell your soccer gear to the community.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Images */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Photos</h2>
          <p className="text-dark-400 mb-4">Add up to 6 photos. First image will be the cover.</p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-dark-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                <FiUpload className="w-6 h-6 text-dark-400 mb-2" />
                <span className="text-xs text-dark-400">Add Photo</span>
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
        </Card>

        {/* Basic Info */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Listing Details</h2>
          <div className="space-y-6">
            <Input
              label="Title"
              placeholder="e.g., Nike Mercurial Vapor 14 Elite - Size 10"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Category
                </label>
                <select className="input" {...register('classified_type')}>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Price (CAD)"
                type="number"
                leftIcon={<FiDollarSign size={18} />}
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-4">
                Condition
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                {conditions.map((cond) => (
                  <label
                    key={cond.value}
                    className={`
                      relative flex items-start p-4 rounded-xl border cursor-pointer
                      transition-all duration-200
                      ${
                        watch('condition') === cond.value
                          ? 'bg-primary-500/10 border-primary-500'
                          : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      value={cond.value}
                      className="sr-only"
                      {...register('condition')}
                    />
                    <div>
                      <p className="font-medium text-white">{cond.label}</p>
                      <p className="text-sm text-dark-400">{cond.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Input
              label="Location"
              placeholder="e.g., North York, ON"
              leftIcon={<FiMapPin size={18} />}
              error={errors.location?.message}
              {...register('location')}
            />

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Description
              </label>
              <textarea
                className="input min-h-[150px] resize-none"
                placeholder="Describe your item in detail. Include size, brand, any defects, and why you're selling."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Post Listing
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClassifiedPage;
