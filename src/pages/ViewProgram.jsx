import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgram, getCollaborator } from '../services/firestore';
import { TextSection } from '../components/sections/view/TextSection';
import { ImageMedia } from '../components/sections/view/ImageMedia';
import { GalleryMedia } from '../components/sections/view/GalleryMedia';
import { VideoMedia } from '../components/sections/view/VideoMedia';
import { CreditsSection } from '../components/sections/view/CreditsSection';
import '../styles/pages/ViewProgram.scss';

export const ViewProgram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [collaborators, setCollaborators] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const programData = await getProgram(id);
        if (!programData) {
          setError('Program not found');
          setLoading(false);
          return;
        }

        setProgram(programData);

        // Fetch all collaborators mentioned in bylines
        const collaboratorPromises = [];
        const collaboratorIds = new Set();

        // Collect all unique collaborator IDs from all sections
        programData.sections.forEach(section => {
          if (section.bylines) {
            section.bylines.forEach(byline => {
              collaboratorIds.add(byline.id);
            });
          }
        });

        // Fetch each collaborator
        collaboratorIds.forEach(id => {
          collaboratorPromises.push(getCollaborator(id));
        });

        const collaboratorResults = await Promise.all(collaboratorPromises);
        const collaboratorMap = {};
        collaboratorResults.forEach(collaborator => {
          if (collaborator) {
            collaboratorMap[collaborator.id] = collaborator;
          }
        });

        setCollaborators(collaboratorMap);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Failed to load program');
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const renderSection = (section) => {
    switch (section.type) {
      case 'text':
        return <TextSection key={section.id} section={section} collaborators={collaborators} />;
      case 'media':
        switch (section.mediaType) {
          case 'image':
            return <ImageMedia key={section.id} section={section} collaborators={collaborators} />;
          case 'gallery':
            return <GalleryMedia key={section.id} section={section} collaborators={collaborators} />;
          case 'video':
            return <VideoMedia key={section.id} section={section} collaborators={collaborators} />;
          default:
            return null;
        }
      case 'credits':
        return <CreditsSection key={section.id} section={section} collaborators={collaborators} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="view-program view-program--loading">
        <div className="view-program__container">
          <div className="view-program__loading">
            <div className="view-program__spinner"></div>
            <p className="view-program__loading-text">Loading program...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-program view-program--error">
        <div className="view-program__container">
          <div className="view-program__error">
            <h2 className="view-program__error-title">Error</h2>
            <p className="view-program__error-message">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="view-program__error-button"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return null;
  }

  return (
    <div className="view-program">
      <div className="view-program__container">
        <div className="view-program__content">
          <div className="view-program__header">
            <h1 className="view-program__title">{program.title}</h1>
            {program.subtitle && (
              <p className="view-program__subtitle">{program.subtitle}</p>
            )}
          </div>

          {program.primaryImageUrl && (
            <div className="view-program__primary-image">
              <img
                src={program.primaryImageUrl}
                alt={program.title}
                className="view-program__image"
              />
            </div>
          )}

          <div className="view-program__sections">
            {program.sections.map(section => renderSection(section))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProgram; 