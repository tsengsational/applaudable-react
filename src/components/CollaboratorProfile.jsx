import React from 'react';
import PropTypes from 'prop-types';

const CollaboratorProfile = ({ collaborator }) => {
  const hasAdditionalInfo = collaborator.bio || 
    collaborator.email || 
    collaborator.phone || 
    collaborator.website || 
    Object.values(collaborator.socialLinks || {}).some(link => link);

  if (!hasAdditionalInfo) {
    return (
      <div className="collaborator-profile">
        <p className="collaborator-profile__no-info">
          No additional information available for this collaborator.
        </p>
      </div>
    );
  }

  return (
    <div className="collaborator-profile">
      {collaborator.primaryImageUrl && (
        <div className="collaborator-profile__image">
          <img
            src={collaborator.primaryImageUrl}
            alt={collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
            className="collaborator-profile__thumbnail"
          />
        </div>
      )}

      <div className="collaborator-profile__info">
        <h3 className="collaborator-profile__name">
          {collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
        </h3>

        {collaborator.bio && (
          <div className="collaborator-profile__section">
            <h4 className="collaborator-profile__section-title">Bio</h4>
            <p className="collaborator-profile__bio">{collaborator.bio}</p>
          </div>
        )}

        {(collaborator.email || collaborator.phone || collaborator.website) && (
          <div className="collaborator-profile__section">
            <h4 className="collaborator-profile__section-title">Contact</h4>
            <ul className="collaborator-profile__contact-list">
              {collaborator.email && (
                <li className="collaborator-profile__contact-item">
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${collaborator.email}`} className="collaborator-profile__link">
                    {collaborator.email}
                  </a>
                </li>
              )}
              {collaborator.phone && (
                <li className="collaborator-profile__contact-item">
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${collaborator.phone}`} className="collaborator-profile__link">
                    {collaborator.phone}
                  </a>
                </li>
              )}
              {collaborator.website && (
                <li className="collaborator-profile__contact-item">
                  <strong>Website:</strong>{' '}
                  <a 
                    href={collaborator.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="collaborator-profile__link"
                  >
                    {collaborator.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {collaborator.socialLinks && Object.values(collaborator.socialLinks).some(link => link) && (
          <div className="collaborator-profile__section">
            <h4 className="collaborator-profile__section-title">Social Media</h4>
            <ul className="collaborator-profile__social-list">
              {collaborator.socialLinks.instagram && (
                <li className="collaborator-profile__social-item">
                  <a 
                    href={collaborator.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="collaborator-profile__link"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {collaborator.socialLinks.twitter && (
                <li className="collaborator-profile__social-item">
                  <a 
                    href={collaborator.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="collaborator-profile__link"
                  >
                    Twitter
                  </a>
                </li>
              )}
              {collaborator.socialLinks.linkedin && (
                <li className="collaborator-profile__social-item">
                  <a 
                    href={collaborator.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="collaborator-profile__link"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              {collaborator.socialLinks.facebook && (
                <li className="collaborator-profile__social-item">
                  <a 
                    href={collaborator.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="collaborator-profile__link"
                  >
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

CollaboratorProfile.propTypes = {
  collaborator: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
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
  }).isRequired
};

export default CollaboratorProfile; 