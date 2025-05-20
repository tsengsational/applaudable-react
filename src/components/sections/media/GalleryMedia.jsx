import React from 'react';
import { ImageUploader } from '../../ImageUploader';

export const GalleryMedia = ({ section, onUpdate, userId }) => {
  return (
    <div className="form-group">
      <label className="form-label">Gallery Images</label>
      <div className="space-y-4">
        {section.galleryImages?.map((image, index) => (
          <div key={index} className="flex items-center space-x-2">
            <img 
              src={image} 
              alt={`Gallery image ${index + 1}`} 
              className="w-20 h-20 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => {
                const newImages = [...section.galleryImages];
                newImages.splice(index, 1);
                onUpdate(section.id, { galleryImages: newImages });
              }}
              className="btn btn-secondary"
              style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
            >
              Remove
            </button>
          </div>
        ))}
        <ImageUploader
          userId={userId}
          onUpload={(urlsByWidth) => {
            const newImage = urlsByWidth['1280'];
            if (newImage) {
              onUpdate(section.id, {
                galleryImages: [...(section.galleryImages || []), newImage]
              });
            }
          }}
          onDelete={() => {}} // No-op for gallery images
          existingImageUrl={null}
        />
      </div>
    </div>
  );
}; 