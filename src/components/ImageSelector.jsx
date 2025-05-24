import React, { useState, useEffect } from 'react';
import { getImages } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

/**
 * Component for selecting from existing images
 * @param {Object} props
 * @param {string} props.userId - User ID
 * @param {Function} props.onSelect - Callback when an image is selected
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {boolean} props.isOpen - Whether the modal is open
 */
export const ImageSelector = ({ userId, onSelect, onClose, isOpen }) => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userImages = await getImages(userId);
        setImages(userImages);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [userId, isOpen]);

  const filteredImages = images.filter(image => {
    const searchLower = searchTerm.toLowerCase();
    const filename = Object.values(image.urlsByWidth)[0]?.split('/').pop() || '';
    return filename.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return <div className="image-selector__loading">Loading images...</div>;
  }

  if (error) {
    return <div className="image-selector__error">{error}</div>;
  }

  if (images.length === 0) {
    return <div className="image-selector__empty">No images found</div>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Image"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Image Grid */}
        <div className="image-selector__grid">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="image-selector__item"
              onClick={() => onSelect(image.urlsByWidth)}
            >
              <img
                src={image.urlsByWidth['640'] || Object.values(image.urlsByWidth)[0]}
                alt={image.name}
                className="image-selector__image"
              />
              <div className="image-selector__overlay">
                <span className="image-selector__name">{image.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? 'No images found matching your search' : 'No images found'}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageSelector; 