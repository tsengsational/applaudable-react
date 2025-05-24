import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../components/Modal';

export const GalleryMedia = ({ section, collaborators }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Get images from either images or galleryImages property
  const images = section.images || section.galleryImages || [];

  if (!images.length) {
    return null;
  }

  return (
    <div className="gallery-media">
      <h2 className="gallery-media__title">{section.title}</h2>
      {section.subtitle && (
        <h3 className="gallery-media__subtitle">{section.subtitle}</h3>
      )}
      <div className="gallery-media__content">
        <div className="gallery-media__grid">
          {images.map((image, index) => {
            // Handle both string URLs and object formats
            const imageUrl = typeof image === 'string' ? image : image.url;
            const imageAlt = typeof image === 'string' ? `Gallery image ${index + 1}` : (image.alt || `Gallery image ${index + 1}`);
            const imageCaption = typeof image === 'string' ? null : image.caption;

            return (
              <div
                key={index}
                className="gallery-media__item"
                onClick={() => handleImageClick({ url: imageUrl, alt: imageAlt, caption: imageCaption })}
              >
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="gallery-media__image"
                />
              </div>
            );
          })}
        </div>
      </div>

      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title={selectedImage.alt || 'Gallery Image'}
          className="gallery-media__modal"
        >
          <div className="gallery-media__modal-content">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt || 'Gallery image'}
              className="gallery-media__modal-image"
            />
            {selectedImage.caption && (
              <p className="gallery-media__modal-caption">{selectedImage.caption}</p>
            )}
          </div>
        </Modal>
      )}

      {section.bylines && section.bylines.length > 0 && (
        <div className="gallery-media__bylines">
          {section.bylines.map((byline, index) => {
            const collaborator = collaborators[byline.id];
            return (
              <div key={index} className="gallery-media__byline">
                <span className="gallery-media__role">{byline.role}: </span>
                {Array.isArray(byline.collaborators) && byline.collaborators.length > 1 ? (
                  <ul className="gallery-media__collaborators-list">
                    {byline.collaborators.map((collabId, collabIndex) => {
                      const collab = collaborators[collabId];
                      return (
                        <li key={collabIndex} className="gallery-media__collaborator">
                          {collab ? (
                            collab.creditedName || 
                            `${collab.firstName} ${collab.lastName}`
                          ) : (
                            <span className="gallery-media__name--error">Collaborator not found</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="gallery-media__name">
                    {collaborator ? (
                      collaborator.creditedName || 
                      `${collaborator.firstName} ${collaborator.lastName}`
                    ) : (
                      <span className="gallery-media__name--error">Collaborator not found</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

GalleryMedia.propTypes = {
  section: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          url: PropTypes.string.isRequired,
          alt: PropTypes.string,
          caption: PropTypes.string
        })
      ])
    ),
    galleryImages: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          url: PropTypes.string.isRequired,
          alt: PropTypes.string,
          caption: PropTypes.string
        })
      ])
    ),
    bylines: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        collaborators: PropTypes.arrayOf(PropTypes.string)
      })
    )
  }).isRequired,
  collaborators: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      creditedName: PropTypes.string
    })
  ).isRequired
}; 