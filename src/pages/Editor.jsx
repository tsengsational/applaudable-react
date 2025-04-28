import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Editor() {
  const { currentUser } = useAuth();
  const [playbill, setPlaybill] = useState({
    title: '',
    bylines: [''],
    performers: []
  });
  const [loading, setLoading] = useState(false);

  const handleTitleChange = (e) => {
    setPlaybill({ ...playbill, title: e.target.value });
  };

  const handleBylineChange = (index, value) => {
    const newBylines = [...playbill.bylines];
    newBylines[index] = value;
    setPlaybill({ ...playbill, bylines: newBylines });
  };

  const addByline = () => {
    setPlaybill({ ...playbill, bylines: [...playbill.bylines, ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const playbillData = {
        ...playbill,
        userId: currentUser.uid,
        createdAt: new Date(),
        subscriptionStatus: 'free' // Default to free tier
      };

      const docRef = await addDoc(collection(firestore, 'playbills'), playbillData);
      console.log('Playbill created with ID:', docRef.id);
      // You might want to redirect to the view page here
    } catch (error) {
      console.error('Error creating playbill:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <h1>Create Playbill</h1>
        
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-4">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Show Title
              </label>
              <input
                type="text"
                id="title"
                value={playbill.title}
                onChange={handleTitleChange}
                className="form-input"
                required
              />
            </div>

            {/* Bylines */}
            <div className="form-group">
              <label className="form-label">
                Bylines
              </label>
              {playbill.bylines.map((byline, index) => (
                <div key={index} className="mb-4">
                  <input
                    type="text"
                    value={byline}
                    onChange={(e) => handleBylineChange(index, e.target.value)}
                    className="form-input"
                    placeholder="e.g., Director: John Smith"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addByline}
                className="btn btn-secondary"
              >
                + Add another byline
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Creating...' : 'Create Playbill'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 