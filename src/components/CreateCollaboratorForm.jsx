import React, { useState, useEffect } from 'react';
import { createCollaborator, updateCollaborator } from '../services/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ImageUploader } from './ImageUploader';
import { deleteImage } from '../services/imageService';

const CreateCollaboratorForm = ({ onSuccess, onCancel, initialData }) => {
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
    <form className="collaborator-form" onSubmit={handleSubmit}>
      <div className="collaborator-form__group">
        <label className="collaborator-form__label">First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="collaborator-form__input"
          required
        />
      </div>

      <div className="collaborator-form__group">
        <label className="collaborator-form__label">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="collaborator-form__input"
          required
        />
      </div>

      <div className="collaborator-form__group">
        <label className="collaborator-form__label">Credited Name (optional)</label>
        <input
          type="text"
          name="creditedName"
          value={formData.creditedName}
          onChange={handleChange}
          className="collaborator-form__input"
          placeholder="Name as it should appear in credits"
        />
      </div>

      <div className="collaborator-form__group">
        <label className="collaborator-form__label">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="collaborator-form__textarea"
          rows="4"
        />
      </div>

      <div className="collaborator-form__group">
        <label className="collaborator-form__label">Profile Image</label>
        <ImageUploader
          userId={currentUser.uid}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          existingImageUrl={formData.primaryImageUrl}
        />
      </div>

      {error && (
        <div className="collaborator-form__error">
          {error}
        </div>
      )}

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
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'} Collaborator
        </button>
      </div>
    </form>
  );
};

export default CreateCollaboratorForm; 