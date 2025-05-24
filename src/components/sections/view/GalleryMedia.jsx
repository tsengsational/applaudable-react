import React, { useState } from 'react';

export const GalleryMedia = ({ section, collaborators }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="gallery-media">
      <h2 className="gallery-media__title">{section.title}</h2>
      {section.subtitle && <h3 className="gallery-media__subtitle">{section.subtitle}</h3>}
      
      <div className="gallery-media__content">
        {section.galleryImages && section.galleryImages.length > 0 && (
          <div className="gallery-media__gallery">
            <div className="gallery-media__grid">
              {section.galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  className="gallery-media__item"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`Gallery image ${index + 1}`}
                    className="gallery-media__image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedImage && (
          <div 
            className="gallery-media__modal-overlay"
            onClick={() => setSelectedImage(null)}
          >
            <div className="gallery-media__modal-content">
              <img 
                src={selectedImage} 
                alt="Selected gallery image"
                className="gallery-media__modal-image"
              />
              <button 
                className="gallery-media__modal-close"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

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