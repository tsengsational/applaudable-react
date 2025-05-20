import React from 'react';
import { ImageMedia } from './ImageMedia';
import { GalleryMedia } from './GalleryMedia';
import { VideoMedia } from './VideoMedia';

const MEDIA_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  GALLERY: 'gallery'
};

export const MediaSection = ({ section, collaborators }) => {
  return (
    <div className="section">
      {section.mediaType === MEDIA_TYPES.IMAGE && (
        <ImageMedia section={section} collaborators={collaborators} />
      )}

      {section.mediaType === MEDIA_TYPES.GALLERY && (
        <GalleryMedia section={section} collaborators={collaborators} />
      )}

      {section.mediaType === MEDIA_TYPES.VIDEO && (
        <VideoMedia section={section} collaborators={collaborators} />
      )}
    </div>
  );
}; 