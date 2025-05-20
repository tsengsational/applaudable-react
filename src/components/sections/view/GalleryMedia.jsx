import React, { useState } from 'react';

export const GalleryMedia = ({ section, collaborators }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="section">
      <h2 className="section-title">{section.title}</h2>
      {section.subtitle && <h3 className="section-subtitle">{section.subtitle}</h3>}
      
      <div className="section-content">
        {section.galleryImages && section.galleryImages.length > 0 && (
          <div className="gallery">
            <div className="gallery-grid">
              {section.galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  className="gallery-item"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`Gallery image ${index + 1}`}
                    className="gallery-image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedImage && (
          <div 
            className="modal-overlay"
            onClick={() => setSelectedImage(null)}
          >
            <div className="modal-content">
              <img 
                src={selectedImage} 
                alt="Selected gallery image"
                className="modal-image"
              />
              <button 
                className="modal-close"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {section.bylines && section.bylines.length > 0 && (
        <div className="bylines">
          {section.bylines.map((byline, index) => {
            const collaborator = collaborators[byline.id];
            return (
              <div key={index} className="byline">
                <span className="role">{byline.role}: </span>
                <span className="name">
                  {collaborator ? (
                    collaborator.creditedName || 
                    `${collaborator.firstName} ${collaborator.lastName}`
                  ) : (
                    <span className="text-red-500">Collaborator not found</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 