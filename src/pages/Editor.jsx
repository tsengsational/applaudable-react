import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProgram, getUserCollaborators, generateUniqueId, getProgram, updateProgram } from '../services/firestore';
import Modal from '../components/Modal';
import CreateCollaboratorForm from '../components/CreateCollaboratorForm';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/pages/Editor.scss';
import '../styles/components/QuillEditor.scss';

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
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        const [userCollaborators, existingProgram] = await Promise.all([
          getUserCollaborators(currentUser.uid),
          id ? getProgram(id) : null
        ]);
        
        setCollaborators(userCollaborators);
        
        if (existingProgram) {
          setProgram(existingProgram);
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
      bylines: type === SECTION_TYPES.CREDITS ? [] : [],
      mediaType: type === SECTION_TYPES.MEDIA ? MEDIA_TYPES.IMAGE : '',
      mediaSource: type === SECTION_TYPES.MEDIA ? '' : ''
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

  const handleCreateCollaboratorSuccess = (newCollaborator) => {
    setCollaborators(prev => [...prev, newCollaborator]);
    setShowCreateCollaboratorModal(false);
  };

  if (!currentUser) {
    return null;
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
              <label htmlFor="primaryImage" className="form-label">Primary Image URL</label>
              <input
                type="url"
                id="primaryImage"
                value={program.primaryImageUrl}
                onChange={handlePrimaryImageChange}
                className="form-input"
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

                  {section.type === SECTION_TYPES.TEXT && (
                    <div className="form-group">
                      <label className="form-label">Content</label>
                      <div className="editor">
                        <ReactQuill
                          value={section.content}
                          onChange={(content) => updateSection(section.id, { content })}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              [{ 'align': [] }],
                              ['link'],
                              ['clean']
                            ]
                          }}
                          theme="snow"
                          className="quill-container"
                        />
                      </div>
                    </div>
                  )}

                  {section.type === SECTION_TYPES.MEDIA && (
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
                  )}

                  {section.type === SECTION_TYPES.MEDIA && (
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
                  )}

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
                        const collaborator = collaborators.find(c => c.id === byline.collaboratorId);
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