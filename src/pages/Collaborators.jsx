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
      // Fetch the complete updated list of collaborators
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
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <h1>Collaborators</h1>

        {error && (
          <div className="card mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Collaborator Form */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCollaborator ? 'Edit Collaborator' : 'Add New Collaborator'}
              </h2>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
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
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Your Collaborators</h2>
            {collaborators.length === 0 ? (
              <p>No collaborators yet. Add your first collaborator using the form.</p>
            ) : (
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">
                          {collaborator.creditedName || `${collaborator.firstName} ${collaborator.lastName}`}
                        </h3>
                        <p className="text-sm text-gray-600">{collaborator.bio}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(collaborator)}
                          className="btn btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(collaborator.id)}
                          className="btn btn-secondary"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
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