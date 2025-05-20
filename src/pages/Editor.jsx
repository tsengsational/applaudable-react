import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProgram, getUserCollaborators, getProgram, updateProgram } from '../services/firestore';
import Modal from '../components/Modal';
import CreateCollaboratorForm from '../components/CreateCollaboratorForm';
import { ImageUploader } from '../components/ImageUploader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/pages/Editor.scss';
import '../styles/components/QuillEditor.scss';
import { deleteImage } from '../services/imageService';
import { TextSection } from '../components/sections/TextSection';
import { MediaSection } from '../components/sections/MediaSection';

const SECTION_TYPES = {
  TEXT: 'text',
  MEDIA: 'media',
  CREDITS: 'credits'
};

const MEDIA_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  GALLERY: 'gallery'
};

export default function Editor() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [program, setProgram] = useState({
    title: '',
    subtitle: '',
    primaryImageUrl: '',
    sections: [
      {
        id: Date.now().toString(),
        type: SECTION_TYPES.TEXT,
        title: 'Welcome',
        subtitle: '',
        content: '',
        order: 0
      }
    ]
  });
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showCollaboratorMenu, setShowCollaboratorMenu] = useState(false);
  const [showCreateCollaboratorModal, setShowCreateCollaboratorModal] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        console.log('Fetching data for user:', currentUser.uid);
        const [userCollaborators, existingProgram] = await Promise.all([
          getUserCollaborators(currentUser.uid),
          id ? getProgram(id) : null
        ]);
        
        console.log('Fetched collaborators:', userCollaborators);
        console.log('Fetched program:', existingProgram);
        
        if (userCollaborators) {
          setCollaborators(userCollaborators);
        } else {
          console.warn('No collaborators found for user');
          setCollaborators([]);
        }
        
        if (existingProgram) {
          console.log('Setting program data:', existingProgram);
          setProgram(existingProgram);
        } else if (id) {
          console.warn('No program found with ID:', id);
          setError('Program not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [currentUser, id]);

  const handleTitleChange = (e) => {
    setProgram({ ...program, title: e.target.value });
  };

  const handleSubtitleChange = (e) => {
    setProgram({ ...program, subtitle: e.target.value });
  };

  const handlePrimaryImageUpload = async (urlsByWidth) => {
    try {
      // If there's an existing image, delete it first
      if (program.primaryImageUrl) {
        await handlePrimaryImageDelete();
      }

      // Use the largest width (1280px) as the primary image
      const primaryImageUrl = urlsByWidth['1280'];
      if (!primaryImageUrl) {
        throw new Error('Failed to get primary image URL');
      }

      // Update program state with new image URL
      const updatedProgram = { ...program, primaryImageUrl };
      setProgram(updatedProgram);

      // If we have a program ID, update it in Firestore
      if (id) {
        setLoading(true);
        try {
          await updateProgram(id, updatedProgram);
          console.log('Program updated with new primary image');
        } catch (err) {
          console.error('Error updating program:', err);
          setError('Failed to save program with new image');
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error updating primary image:', err);
      setError('Failed to update primary image. Please try again.');
    }
  };

  const handlePrimaryImageDelete = async () => {
    if (!program.primaryImageUrl) return;

    try {
      // Extract image ID from URL
      const urlParts = program.primaryImageUrl.split('/');
      const imageId = urlParts[urlParts.length - 1].split('_')[0];
      
      // Delete image from Storage and Firestore
      await deleteImage(currentUser.uid, imageId);
      
      // Update program state
      setProgram({ ...program, primaryImageUrl: '' });
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      title: '',
      subtitle: '',
      content: '',
      order: program.sections.length,
      bylines: type === SECTION_TYPES.CREDITS ? [] : [],
      mediaType: type === SECTION_TYPES.MEDIA ? MEDIA_TYPES.IMAGE : '',
      mediaSource: type === SECTION_TYPES.MEDIA ? '' : '',
      galleryImages: type === SECTION_TYPES.MEDIA ? [] : []
    };

    setProgram({
      ...program,
      sections: [...program.sections, newSection]
    });
  };

  const updateSection = (sectionId, updates) => {
    setProgram({
      ...program,
      sections: program.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  };

  const removeSection = (sectionId) => {
    setProgram({
      ...program,
      sections: program.sections.filter(section => section.id !== sectionId)
    });
  };

  const reorderSection = (sectionId, newOrder) => {
    const sections = [...program.sections];
    const oldIndex = sections.findIndex(s => s.id === sectionId);
    const section = sections[oldIndex];
    sections.splice(oldIndex, 1);
    sections.splice(newOrder, 0, section);
    
    setProgram({
      ...program,
      sections: sections.map((s, index) => ({ ...s, order: index }))
    });
  };

  const addByline = (sectionId, collaboratorId, role) => {
    updateSection(sectionId, {
      bylines: [...program.sections.find(s => s.id === sectionId).bylines, { 
        id: collaboratorId,
        role 
      }]
    });
  };

  const removeByline = (sectionId, bylineIndex) => {
    const section = program.sections.find(s => s.id === sectionId);
    const newBylines = [...section.bylines];
    newBylines.splice(bylineIndex, 1);
    updateSection(sectionId, { bylines: newBylines });
  };

  const filteredCollaborators = collaborators.filter(collaborator => {
    const searchLower = searchTerm.toLowerCase();
    return (
      collaborator.firstName.toLowerCase().includes(searchLower) ||
      collaborator.lastName.toLowerCase().includes(searchLower) ||
      (collaborator.creditedName && collaborator.creditedName.toLowerCase().includes(searchLower))
    );
  });

  const paginatedCollaborators = filteredCollaborators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!currentUser) {
      setError('You must be logged in to create a program');
      setLoading(false);
      return;
    }

    try {
      const programData = {
        ...program,
        userId: currentUser.uid
      };

      if (id) {
        await updateProgram(id, programData);
      } else {
        const programId = await createProgram(programData);
        navigate(`/view/${programId}`);
      }
      
      if (id) {
        navigate(`/view/${id}`);
      }
    } catch (error) {
      console.error('Error saving program:', error);
      setError('Failed to save program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollaboratorSuccess = async (newCollaborator) => {
    try {
      if (!newCollaborator || !newCollaborator.id) {
        throw new Error('Invalid collaborator data');
      }
      
      // Fetch the complete updated list of collaborators
      const updatedCollaborators = await getUserCollaborators(currentUser.uid);
      setCollaborators(updatedCollaborators);
      
      // If we have a selected section, automatically add the new collaborator
      if (selectedSection) {
        const role = prompt('Enter role for this collaborator:');
        if (role) {
          addByline(selectedSection, newCollaborator.id, role);
        }
      }
      
      setShowCreateCollaboratorModal(false);
      setShowCollaboratorMenu(true); // Reopen the collaborator selection menu
    } catch (err) {
      console.error('Error handling new collaborator:', err);
      setError('Failed to add new collaborator. Please try again.');
    }
  };

  const renderSection = (section) => {
    switch (section.type) {
      case 'text':
        return (
          <TextSection
            key={section.id}
            section={section}
            onUpdate={updateSection}
          />
        );
      case 'media':
        return (
          <MediaSection
            key={section.id}
            section={section}
            onUpdate={updateSection}
            userId={currentUser.uid}
          />
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-message">
            <h2>Authentication Required</h2>
            <p>Please log in to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">{id ? 'Edit Program' : 'Create Program'}</h1>
        
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form">
          {/* Program Details */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Program Details</h2>
            </div>
            <div className="form-group">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                id="title"
                value={program.title}
                onChange={handleTitleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subtitle" className="form-label">Subtitle</label>
              <input
                type="text"
                id="subtitle"
                value={program.subtitle}
                onChange={handleSubtitleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Image</label>
              <ImageUploader 
                userId={currentUser.uid}
                onUpload={handlePrimaryImageUpload}
                onDelete={handlePrimaryImageDelete}
                existingImageUrl={program.primaryImageUrl}
                className="mb-4"
              />
            </div>
          </div>

          {/* Sections */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Sections</h2>
              <div className="button-group">
                <button
                  type="button"
                  onClick={() => addSection(SECTION_TYPES.TEXT)}
                  className="button"
                >
                  Add Text Section
                </button>
                <button
                  type="button"
                  onClick={() => addSection(SECTION_TYPES.MEDIA)}
                  className="button"
                >
                  Add Media Section
                </button>
                <button
                  type="button"
                  onClick={() => addSection(SECTION_TYPES.CREDITS)}
                  className="button"
                >
                  Add Credits Section
                </button>
              </div>
            </div>

            <div className="sections">
              {program.sections.map((section, index) => (
                <div key={section.id} className="section">
                  <div className="section-header">
                    <h3 className="section-title">
                      {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                    </h3>
                    <div className="button-group">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => reorderSection(section.id, index - 1)}
                          className="button"
                        >
                          ↑
                        </button>
                      )}
                      {index < program.sections.length - 1 && (
                        <button
                          type="button"
                          onClick={() => reorderSection(section.id, index + 1)}
                          className="button"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="button danger-button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Section Subtitle</label>
                    <input
                      type="text"
                      value={section.subtitle}
                      onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {renderSection(section)}

                  {section.type === SECTION_TYPES.CREDITS && (
                    <div className="form-group">
                      <div className="flex-group">
                        <h4 className="sub-title">Bylines</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSection(section.id);
                            setShowCollaboratorMenu(true);
                          }}
                          className="button"
                        >
                          Add Byline
                        </button>
                      </div>

                      {section.bylines.map((byline, bylineIndex) => {
                        const collaborator = collaborators.find(c => c.id === byline.id);
                        return (
                          <div key={bylineIndex} className="flex-group">
                            <div>
                              <span className="bold">{byline.role}: </span>
                              <span>
                                {collaborator?.creditedName || 
                                  `${collaborator?.firstName} ${collaborator?.lastName}`}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeByline(section.id, bylineIndex)}
                              className="text-button"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Saving...' : (id ? 'Update Program' : 'Create Program')}
          </button>
        </form>

        {/* Collaborator Selection Menu */}
        {showCollaboratorMenu && (
          <Modal
            isOpen={showCollaboratorMenu}
            onClose={() => setShowCollaboratorMenu(false)}
            title="Select Collaborator"
          >
            <div className="form-group">
              <input
                type="text"
                placeholder="Search collaborators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="space-group">
              {paginatedCollaborators.map(collaborator => (
                <div
                  key={collaborator.id}
                  className="flex-group"
                  onClick={() => {
                    const role = prompt('Enter role for this collaborator:');
                    if (role) {
                      addByline(selectedSection, collaborator.id, role);
                      setShowCollaboratorMenu(false);
                    }
                  }}
                >
                  <div>
                    <div className="font-medium">
                      {collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
                    </div>
                    <div className="text-gray">{collaborator.bio}</div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCollaborators.length > ITEMS_PER_PAGE && (
              <div className="flex-group">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="button"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * ITEMS_PER_PAGE >= filteredCollaborators.length}
                  className="button"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-group">
              <button
                type="button"
                onClick={() => {
                  setShowCreateCollaboratorModal(true);
                  setShowCollaboratorMenu(false);
                }}
                className="button"
              >
                Create New Collaborator
              </button>
            </div>
          </Modal>
        )}

        {/* Create Collaborator Modal */}
        <Modal
          isOpen={showCreateCollaboratorModal}
          onClose={() => setShowCreateCollaboratorModal(false)}
          title="Create New Collaborator"
        >
          <CreateCollaboratorForm
            onSuccess={handleCreateCollaboratorSuccess}
            onCancel={() => setShowCreateCollaboratorModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
} 