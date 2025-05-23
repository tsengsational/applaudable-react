import React from 'react';

export const ImageMedia = ({ section, collaborators }) => {
  return (
    <div className="image-media">
      <h2 className="image-media__title">{section.title}</h2>
      {section.subtitle && <h3 className="image-media__subtitle">{section.subtitle}</h3>}
      
      <div className="image-media__content">
        {section.mediaSource && (
          <div className="image-media__container">
            <img 
              src={section.mediaSource} 
              alt={section.title}
              className="image-media__image"
            />
          </div>
        )}
      </div>

      {section.bylines && section.bylines.length > 0 && (
        <div className="image-media__bylines">
          {section.bylines.map((byline, index) => {
            const collaborator = collaborators[byline.id];
            return (
              <div key={index} className="image-media__byline">
                <span className="image-media__role">{byline.role}: </span>
                {Array.isArray(byline.collaborators) && byline.collaborators.length > 1 ? (
                  <ul className="image-media__collaborators-list">
                    {byline.collaborators.map((collabId, collabIndex) => {
                      const collab = collaborators[collabId];
                      return (
                        <li key={collabIndex} className="image-media__collaborator">
                          {collab ? (
                            collab.creditedName || 
                            `${collab.firstName} ${collab.lastName}`
                          ) : (
                            <span className="image-media__name--error">Collaborator not found</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="image-media__name">
                    {collaborator ? (
                      collaborator.creditedName || 
                      `${collaborator.firstName} ${collaborator.lastName}`
                    ) : (
                      <span className="image-media__name--error">Collaborator not found</span>
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