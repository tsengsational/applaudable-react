import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCollaborators, createCollaborator, updateCollaborator, deleteCollaborator } from '../services/firestore';
import CreateCollaboratorForm from '../components/CreateCollaboratorForm';

export default function Collaborators() {
  const { currentUser } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!currentUser) return;

      try {
        const userCollaborators = await getUserCollaborators(currentUser.uid);
        setCollaborators(userCollaborators);
      } catch (err) {
        console.error('Error fetching collaborators:', err);
        setError('Failed to load collaborators');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [currentUser]);

  const handleCreateSuccess = async (newCollaborator) => {
    try {
      const updatedCollaborators = await getUserCollaborators(currentUser.uid);
      setCollaborators(updatedCollaborators);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error handling new collaborator:', err);
      setError('Failed to add new collaborator');
    }
  };

  const handleEdit = (collaborator) => {
    setEditingCollaborator(collaborator);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collaborator?')) return;

    try {
      console.log('Deleting collaborator with ID:', id);
      await deleteCollaborator(id);
      setCollaborators(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting collaborator:', err);
      setError('Failed to delete collaborator');
    }
  };

  if (loading) {
    return (
      <div className="collaborators collaborators--loading">
        <div className="collaborators__loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="collaborators">
      <div className="collaborators__container">
        <h1 className="collaborators__title">Collaborators</h1>

        {error && (
          <div className="collaborators__error">
            {error}
          </div>
        )}

        <div className="collaborators__grid">
          {/* Collaborator Form */}
          <div className="collaborators__form-card">
            <div className="collaborators__form-header">
              <h2 className="collaborators__form-title">
                {editingCollaborator ? 'Edit Collaborator' : 'Add New Collaborator'}
              </h2>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="collaborators__add-button"
                >
                  Add New Collaborator
                </button>
              )}
            </div>

            {showCreateForm && (
              <CreateCollaboratorForm
                onSuccess={handleCreateSuccess}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingCollaborator(null);
                }}
                initialData={editingCollaborator}
              />
            )}
          </div>

          {/* Collaborators List */}
          <div className="collaborators__list-card">
            <h2 className="collaborators__list-title">Your Collaborators</h2>
            {collaborators.length === 0 ? (
              <p className="collaborators__empty-message">No collaborators yet. Add your first collaborator using the form.</p>
            ) : (
              <div className="collaborators__list">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="collaborators__item">
                    <div className="collaborators__item-content">
                      <div className="collaborators__item-info">
                        {collaborator.primaryImageUrl && (
                          <div className="collaborators__item-image">
                            <img
                              src={collaborator.primaryImageUrl}
                              alt={collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
                              className="collaborators__item-thumbnail"
                            />
                          </div>
                        )}
                        <div className="collaborators__item-details">
                          <h3 className="collaborators__item-name">
                            {collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
                          </h3>
                          <p className="collaborators__item-bio">{collaborator.bio}</p>
                        </div>
                      </div>
                      <div className="collaborators__item-actions">
                        <button
                          onClick={() => handleEdit(collaborator)}
                          className="collaborators__edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(collaborator.id)}
                          className="collaborators__delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 