import React from 'react';

export const CreditsSection = ({ section, collaborators }) => {
  return (
    <div className="section">
      <h2 className="section-title">{section.title}</h2>
      {section.subtitle && <h3 className="section-subtitle">{section.subtitle}</h3>}
      
      <div className="section-content">
        {section.bylines && section.bylines.length > 0 && (
          <div className="credits-list">
            {section.bylines.map((byline, index) => {
              const collaborator = collaborators[byline.id];
              return (
                <div key={index} className="credit-item">
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
    </div>
  );
}; 