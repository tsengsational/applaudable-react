import React from 'react';
import { ImageUploader } from '../../ImageUploader';

export const ImageMedia = ({ section, onUpdate, userId }) => {
  return (
    <div className="form-group">
      <label className="form-label">Image</label>
      <ImageUploader
        userId={userId}
        onUpload={(urlsByWidth) => onUpdate(section.id, { mediaSource: urlsByWidth['1280'] })}
        onDelete={() => onUpdate(section.id, { mediaSource: '' })}
        existingImageUrl={section.mediaSource}
      />
    </div>
  );
}; 