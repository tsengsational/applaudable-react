import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCollaborators, createCollaborator, updateCollaborator, deleteCollaborator } from '../services/firestore';

export default function Collaborators() {
  const { currentUser } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    creditedName: '',
    bio: '',
    socialLinks: {
      instagram: '',
      website: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    },
    primaryImageUrl: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const collaboratorData = {
        ...formData,
        userId: currentUser.uid
      };

      if (editingCollaborator) {
        await updateCollaborator(editingCollaborator.id, collaboratorData);
        setCollaborators(prev => 
          prev.map(c => c.id === editingCollaborator.id ? { ...c, ...collaboratorData } : c)
        );
      } else {
        const newCollaboratorId = await createCollaborator(collaboratorData);
        setCollaborators(prev => [...prev, { id: newCollaboratorId, ...collaboratorData }]);
      }

      setFormData({
        firstName: '',
        lastName: '',
        creditedName: '',
        bio: '',
        socialLinks: {
          instagram: '',
          website: '',
          facebook: '',
          twitter: '',
          linkedin: ''
        },
        primaryImageUrl: ''
      });
      setEditingCollaborator(null);
    } catch (err) {
      console.error('Error saving collaborator:', err);
      setError('Failed to save collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (collaborator) => {
    setEditingCollaborator(collaborator);
    setFormData({
      firstName: collaborator.firstName,
      lastName: collaborator.lastName,
      creditedName: collaborator.creditedName || '',
      bio: collaborator.bio,
      socialLinks: collaborator.socialLinks || {
        instagram: '',
        website: '',
        facebook: '',
        twitter: '',
        linkedin: ''
      },
      primaryImageUrl: collaborator.primaryImageUrl
    });
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
            <h2 className="text-xl font-bold mb-4">
              {editingCollaborator ? 'Edit Collaborator' : 'Add New Collaborator'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="creditedName" className="form-label">Credited Name (Optional)</label>
                <input
                  type="text"
                  id="creditedName"
                  name="creditedName"
                  value={formData.creditedName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="primaryImageUrl" className="form-label">Primary Image URL</label>
                <input
                  type="url"
                  id="primaryImageUrl"
                  name="primaryImageUrl"
                  value={formData.primaryImageUrl}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Social Links</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    name="social.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Instagram URL"
                  />
                  <input
                    type="url"
                    name="social.website"
                    value={formData.socialLinks.website}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Website URL"
                  />
                  <input
                    type="url"
                    name="social.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Facebook URL"
                  />
                  <input
                    type="url"
                    name="social.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    name="social.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {editingCollaborator && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCollaborator(null);
                      setFormData({
                        firstName: '',
                        lastName: '',
                        creditedName: '',
                        bio: '',
                        socialLinks: {
                          instagram: '',
                          website: '',
                          facebook: '',
                          twitter: '',
                          linkedin: ''
                        },
                        primaryImageUrl: ''
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : editingCollaborator ? 'Update' : 'Add'} Collaborator
                </button>
              </div>
            </form>
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