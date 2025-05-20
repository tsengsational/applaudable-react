import React from 'react';

export const ImageMedia = ({ section, collaborators }) => {
  return (
    <div className="section">
      <h2 className="section-title">{section.title}</h2>
      {section.subtitle && <h3 className="section-subtitle">{section.subtitle}</h3>}
      
      <div className="section-content">
        {section.mediaSource && (
          <div className="image-container">
            <img 
              src={section.mediaSource} 
              alt={section.title}
              className="section-image"
            />
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