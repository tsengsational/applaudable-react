import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createProgram } from '../services/firestore';

export default function Editor() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState({
    title: '',
    bylines: [''],
    performers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleTitleChange = (e) => {
    setProgram({ ...program, title: e.target.value });
  };

  const handleBylineChange = (index, value) => {
    const newBylines = [...program.bylines];
    newBylines[index] = value;
    setProgram({ ...program, bylines: newBylines });
  };

  const addByline = () => {
    setProgram({ ...program, bylines: [...program.bylines, ''] });
  };

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

  if (!currentUser) {
    return null; // Don't render anything while redirecting
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
                value={program.title}
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
              {program.bylines.map((byline, index) => (
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
                {loading ? 'Creating...' : 'Create Program'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 