import React from 'react';
import { ImageMedia } from './media/ImageMedia';
import { GalleryMedia } from './media/GalleryMedia';
import { VideoMedia } from './media/VideoMedia';

const MEDIA_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  GALLERY: 'gallery'
};

export const MediaSection = ({ section, onUpdate, userId }) => {
  return (
    <div className="section">
      <div className="form-group">
        <label className="form-label">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, { title: e.target.value })}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Section Subtitle</label>
        <input
          type="text"
          value={section.subtitle}
          onChange={(e) => onUpdate(section.id, { subtitle: e.target.value })}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Media Type</label>
        <select
          value={section.mediaType}
          onChange={(e) => onUpdate(section.id, { 
            mediaType: e.target.value,
            mediaSource: '',
            galleryImages: []
          })}
          className="form-input"
          required
        >
          {Object.values(MEDIA_TYPES).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {section.mediaType === MEDIA_TYPES.IMAGE && (
        <ImageMedia section={section} onUpdate={onUpdate} userId={userId} />
      )}

      {section.mediaType === MEDIA_TYPES.GALLERY && (
        <GalleryMedia section={section} onUpdate={onUpdate} userId={userId} />
      )}

      {section.mediaType === MEDIA_TYPES.VIDEO && (
        <VideoMedia section={section} onUpdate={onUpdate} />
      )}
    </div>
  );
}; 