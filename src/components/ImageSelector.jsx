import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userImagesRef = collection(db, 'users', userId, 'images');
        const q = query(userImagesRef);
        const querySnapshot = await getDocs(q);
        
        const imageList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setImages(imageList);
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            Loading images...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-600 py-2">
            {error}
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square cursor-pointer group"
              onClick={() => onSelect(image.urlsByWidth)}
            >
              <img
                src={image.urlsByWidth['640']}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
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