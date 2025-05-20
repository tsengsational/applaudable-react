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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading program...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
            {program.subtitle && (
              <p className="mt-1 text-xl text-gray-500">{program.subtitle}</p>
            )}
          </div>

          {program.primaryImageUrl && (
            <div className="px-4 py-5 sm:px-6">
              <img
                src={program.primaryImageUrl}
                alt={program.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="border-t border-gray-200">
            {program.sections.map(section => renderSection(section))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProgram; 