import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const TextSection = ({ section, collaborators }) => {
  return (
    <div className="text-section">
      <h2 className="text-section__title">{section.title}</h2>
      {section.subtitle && <h3 className="text-section__subtitle">{section.subtitle}</h3>}
      
      <div className="text-section__content">
        <div 
          className="text-section__text"
          dangerouslySetInnerHTML={{ __html: section.content }}
        />
      </div>

      {section.bylines && section.bylines.length > 0 && (
        <div className="text-section__bylines">
          {section.bylines.map((byline, index) => {
            const collaborator = collaborators[byline.id];
            return (
              <div key={index} className="text-section__byline">
                <span className="text-section__role">{byline.role}: </span>
                {Array.isArray(byline.collaborators) && byline.collaborators.length > 1 ? (
                  <ul className="text-section__collaborators-list">
                    {byline.collaborators.map((collabId, collabIndex) => {
                      const collab = collaborators[collabId];
                      return (
                        <li key={collabIndex} className="text-section__collaborator">
                          {collab ? (
                            collab.creditedName || 
                            `${collab.firstName} ${collab.lastName}`
                          ) : (
                            <span className="text-section__name--error">Collaborator not found</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="text-section__name">
                    {collaborator ? (
                      collaborator.creditedName || 
                      `${collaborator.firstName} ${collaborator.lastName}`
                    ) : (
                      <span className="text-section__name--error">Collaborator not found</span>
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