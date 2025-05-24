import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../components/Modal';
import CollaboratorProfile from '../../../components/CollaboratorProfile';

export const CreditsSection = ({ section, collaborators }) => {
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);

  const handleCollaboratorClick = (collaborator) => {
    const hasAdditionalInfo = collaborator.bio || 
      collaborator.email || 
      collaborator.phone || 
      collaborator.website || 
      collaborator.primaryImageUrl ||
      Object.values(collaborator.socialLinks || {}).some(link => link);

    if (hasAdditionalInfo) {
      setSelectedCollaborator(collaborator);
    }
  };

  if (!section.bylines || section.bylines.length === 0) {
    return null;
  }

  return (
    <div className="credits-section">
      <h2 className="credits-section__title">{section.title}</h2>
      {section.subtitle && (
        <h3 className="credits-section__subtitle">{section.subtitle}</h3>
      )}
      <div className="credits-section__content">
        {section.bylines.map((byline, index) => {
          if (!byline.collaborators || byline.collaborators.length === 0) {
            return null;
          }

          return (
            <div key={index} className="credits-section__byline">
              <h4 className="credits-section__role">{byline.role}</h4>
              <ul className="credits-section__collaborators">
                {byline.collaborators.map((collaboratorId) => {
                  const collaborator = collaborators[collaboratorId];
                  if (!collaborator) return null;

                  return (
                    <li key={collaboratorId} className="credits-section__collaborator">
                      <button
                        onClick={() => handleCollaboratorClick(collaborator)}
                        className="credits-section__collaborator-button"
                      >
                        {collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {selectedCollaborator && (
        <Modal
          isOpen={!!selectedCollaborator}
          onClose={() => setSelectedCollaborator(null)}
          title="Collaborator Profile"
        >
          <CollaboratorProfile collaborator={selectedCollaborator} />
        </Modal>
      )}
    </div>
  );
};

CreditsSection.propTypes = {
  section: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    bylines: PropTypes.arrayOf(
      PropTypes.shape({
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
      creditedName: PropTypes.string,
      bio: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      website: PropTypes.string,
      primaryImageUrl: PropTypes.string,
      socialLinks: PropTypes.shape({
        instagram: PropTypes.string,
        twitter: PropTypes.string,
        linkedin: PropTypes.string,
        facebook: PropTypes.string
      })
    })
  ).isRequired
}; 