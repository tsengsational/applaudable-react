import React from 'react';

export const CreditsSection = ({ section, collaborators }) => {
  return (
    <div className="credits-section">
      <h2 className="credits-section__title">{section.title}</h2>
      {section.subtitle && <h3 className="credits-section__subtitle">{section.subtitle}</h3>}
      
      <div className="credits-section__content">
        {section.bylines && section.bylines.length > 0 && (
          <div className="credits-section__list">
            {section.bylines.map((byline, index) => {
              const collaborator = collaborators[byline.id];
              return (
                <div key={index} className="credits-section__item">
                  <span className="credits-section__role">{byline.role}: </span>
                  {Array.isArray(byline.collaborators) && byline.collaborators.length > 1 ? (
                    <ul className="credits-section__collaborators-list">
                      {byline.collaborators.map((collabId, collabIndex) => {
                        const collab = collaborators[collabId];
                        return (
                          <li key={collabIndex} className="credits-section__collaborator">
                            {collab ? (
                              collab.creditedName || 
                              `${collab.firstName} ${collab.lastName}`
                            ) : (
                              <span className="credits-section__name--error">Collaborator not found</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="credits-section__name">
                      {collaborator ? (
                        collaborator.creditedName || 
                        `${collaborator.firstName} ${collaborator.lastName}`
                      ) : (
                        <span className="credits-section__name--error">Collaborator not found</span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 