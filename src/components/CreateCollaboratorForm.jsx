import React, { useState } from 'react';
import { createCollaborator, generateUniqueId } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function CreateCollaboratorForm({ onSuccess, onCancel }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    id: generateUniqueId(),
    firstName: '',
    lastName: '',
    creditedName: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
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

    if (!currentUser) {
      setError('You must be logged in to create a collaborator');
      setLoading(false);
      return;
    }

    try {
      const collaboratorData = {
        ...formData,
        userId: currentUser.uid
      };
      const collaborator = await createCollaborator(collaboratorData);
      onSuccess(collaborator);
    } catch (err) {
      console.error('Error creating collaborator:', err);
      setError('Failed to create collaborator. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="card mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
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
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="creditedName" className="form-label">Credited Name (optional)</label>
        <input
          type="text"
          id="creditedName"
          name="creditedName"
          value={formData.creditedName}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g., J.R.R. Tolkien"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bio" className="form-label">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="form-input"
          rows="4"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="website" className="form-label">Website</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-bold">Social Links</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="social.instagram" className="form-label">Instagram</label>
            <input
              type="url"
              id="social.instagram"
              name="social.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="social.twitter" className="form-label">Twitter</label>
            <input
              type="url"
              id="social.twitter"
              name="social.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="social.linkedin" className="form-label">LinkedIn</label>
            <input
              type="url"
              id="social.linkedin"
              name="social.linkedin"
              value={formData.socialLinks.linkedin}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="social.facebook" className="form-label">Facebook</label>
            <input
              type="url"
              id="social.facebook"
              name="social.facebook"
              value={formData.socialLinks.facebook}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Creating...' : 'Create Collaborator'}
        </button>
      </div>
    </form>
  );
} 