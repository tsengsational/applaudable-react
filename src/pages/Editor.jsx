import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProgram, getUserCollaborators, generateUniqueId } from '../services/firestore';
import Modal from '../components/Modal';
import CreateCollaboratorForm from '../components/CreateCollaboratorForm';

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
  const [program, setProgram] = useState({
    title: '',
    subtitle: '',
    primaryImageUrl: '',
    sections: [
      {
        id: generateUniqueId(),
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
    const fetchCollaborators = async () => {
      if (!currentUser) return;

      try {
        const userCollaborators = await getUserCollaborators(currentUser.uid);
        setCollaborators(userCollaborators);
      } catch (err) {
        console.error('Error fetching collaborators:', err);
        setError('Failed to load collaborators');
      }
    };

    fetchCollaborators();
  }, [currentUser]);

  const handleTitleChange = (e) => {
    setProgram({ ...program, title: e.target.value });
  };

  const handleSubtitleChange = (e) => {
    setProgram({ ...program, subtitle: e.target.value });
  };

  const handlePrimaryImageChange = (e) => {
    setProgram({ ...program, primaryImageUrl: e.target.value });
  };

  const addSection = (type) => {
    const newSection = {
      id: generateUniqueId(),
      type,
      title: '',
      subtitle: '',
      content: '',
      order: program.sections.length,
      bylines: type === SECTION_TYPES.CREDITS ? [] : undefined,
      mediaType: type === SECTION_TYPES.MEDIA ? MEDIA_TYPES.IMAGE : undefined,
      mediaSource: type === SECTION_TYPES.MEDIA ? '' : undefined
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
      bylines: [...program.sections.find(s => s.id === sectionId).bylines, { role, collaboratorId }]
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

      const programId = await createProgram(programData);
      navigate(`/view/${programId}`);
    } catch (error) {
      console.error('Error creating program:', error);
      setError('Failed to create program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollaboratorSuccess = (newCollaborator) => {
    setCollaborators(prev => [...prev, newCollaborator]);
    setShowCreateCollaboratorModal(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <h1>Create Program</h1>
        
        {error && (
          <div className="card mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Program Details */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Program Details</h2>
            <div className="space-y-4">
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
                <label htmlFor="primaryImage" className="form-label">Primary Image URL</label>
                <input
                  type="url"
                  id="primaryImage"
                  value={program.primaryImageUrl}
                  onChange={handlePrimaryImageChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sections</h2>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => addSection(SECTION_TYPES.TEXT)}
                  className="btn btn-secondary"
                >
                  Add Text Section
                </button>
                <button
                  type="button"
                  onClick={() => addSection(SECTION_TYPES.MEDIA)}
                  className="btn btn-secondary"
                >
                  Add Media Section
                </button>
                <button
                  type="button"
                  onClick={() => addSection(SECTION_TYPES.CREDITS)}
                  className="btn btn-secondary"
                >
                  Add Credits Section
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {program.sections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">
                      {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                    </h3>
                    <div className="space-x-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => reorderSection(section.id, index - 1)}
                          className="btn btn-secondary"
                        >
                          ↑
                        </button>
                      )}
                      {index < program.sections.length - 1 && (
                        <button
                          type="button"
                          onClick={() => reorderSection(section.id, index + 1)}
                          className="btn btn-secondary"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="btn btn-secondary"
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
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

                    {section.type === SECTION_TYPES.TEXT && (
                      <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSection(section.id, { content: e.target.value })}
                          className="form-input"
                          rows="6"
                          required
                        />
                      </div>
                    )}

                    {section.type === SECTION_TYPES.MEDIA && (
                      <div className="space-y-4">
                        <div className="form-group">
                          <label className="form-label">Media Type</label>
                          <select
                            value={section.mediaType}
                            onChange={(e) => updateSection(section.id, { mediaType: e.target.value })}
                            className="form-input"
                            required
                          >
                            {Object.values(MEDIA_TYPES).map(type => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Media Source URL</label>
                          <input
                            type="url"
                            value={section.mediaSource}
                            onChange={(e) => updateSection(section.id, { mediaSource: e.target.value })}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {section.type === SECTION_TYPES.CREDITS && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold">Bylines</h4>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSection(section.id);
                              setShowCollaboratorMenu(true);
                            }}
                            className="btn btn-secondary"
                          >
                            Add Byline
                          </button>
                        </div>

                        {section.bylines.map((byline, bylineIndex) => {
                          const collaborator = collaborators.find(c => c.id === byline.collaboratorId);
                          return (
                            <div key={bylineIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{byline.role}: </span>
                                <span>
                                  {collaborator?.creditedName || 
                                    `${collaborator?.firstName} ${collaborator?.lastName}`}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeByline(section.id, bylineIndex)}
                                className="text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>

        {/* Collaborator Selection Menu */}
        {showCollaboratorMenu && (
          <Modal
            isOpen={showCollaboratorMenu}
            onClose={() => setShowCollaboratorMenu(false)}
            title="Select Collaborator"
          >
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search collaborators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              {paginatedCollaborators.map(collaborator => (
                <div
                  key={collaborator.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
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
                    <div className="text-sm text-gray-600">{collaborator.bio}</div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCollaborators.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * ITEMS_PER_PAGE >= filteredCollaborators.length}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateCollaboratorModal(true);
                  setShowCollaboratorMenu(false);
                }}
                className="btn btn-primary w-full"
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