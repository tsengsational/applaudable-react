import React, { useState, useEffect } from 'react';
import { createCollaborator, updateCollaborator } from '../services/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ImageUploader } from './ImageUploader';
import { deleteImage } from '../services/imageService';

export default function CreateCollaboratorForm({ onSuccess, onCancel, initialData }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
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
    },
    primaryImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        creditedName: initialData.creditedName || '',
        bio: initialData.bio || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
        socialLinks: initialData.socialLinks || {
          instagram: '',
          twitter: '',
          linkedin: '',
          facebook: ''
        },
        primaryImageUrl: initialData.primaryImageUrl || ''
      });
    }
  }, [initialData]);

  if (!currentUser) {
    return (
      <div className="error-message">
        You must be logged in to create a collaborator
      </div>
    );
  }

  const handleImageUpload = async (urlsByWidth) => {
    try {
      // If there's an existing image, delete it first
      if (formData.primaryImageUrl) {
        await handleImageDelete();
      }

      // Use the largest width (1280px) as the primary image
      const primaryImageUrl = urlsByWidth['1280'];
      if (!primaryImageUrl) {
        throw new Error('Failed to get primary image URL');
      }

      setFormData(prev => ({
        ...prev,
        primaryImageUrl
      }));
    } catch (err) {
      console.error('Error updating primary image:', err);
      setError('Failed to update primary image. Please try again.');
    }
  };

  const handleImageDelete = async () => {
    if (!formData.primaryImageUrl) return;

    try {
      // Extract image ID from URL
      const urlParts = formData.primaryImageUrl.split('/');
      const imageId = urlParts[urlParts.length - 1].split('_')[0];
      
      // Delete image from Storage and Firestore
      await deleteImage(currentUser.uid, imageId);
      
      // Update form data
      setFormData(prev => ({ ...prev, primaryImageUrl: '' }));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

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
        firstName: formData.firstName,
        lastName: formData.lastName,
        creditedName: formData.creditedName,
        bio: formData.bio,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        socialLinks: formData.socialLinks,
        primaryImageUrl: formData.primaryImageUrl,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };

      if (initialData) {
        await updateCollaborator(initialData.id, collaboratorData);
        onSuccess({ id: initialData.id, ...collaboratorData });
      } else {
        const newCollaboratorId = await createCollaborator(collaboratorData);
        onSuccess({ id: newCollaboratorId, ...collaboratorData });
      }
    } catch (err) {
      console.error('Error saving collaborator:', err);
      setError('Failed to save collaborator');
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

      <div className="form-group">
        <label className="form-label">Profile Image</label>
        <ImageUploader 
          userId={currentUser?.uid}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          existingImageUrl={formData.primaryImageUrl}
          className="mb-4"
        />
      </div>

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
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'} Collaborator
        </button>
      </div>
    </form>
  );
} 