import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPrograms } from '../services/firestore';

export default function MyPrograms() {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!currentUser) return;

      try {
        const userPrograms = await getUserPrograms(currentUser.uid);
        setPrograms(userPrograms);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: '#dc2626' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h1>My Programs</h1>
          <Link to="/editor" className="btn btn-primary">
            Create New Program
          </Link>
        </div>

        {programs.length === 0 ? (
          <div className="card text-center">
            <p className="mb-4">You haven't created any programs yet.</p>
            <Link to="/editor" className="btn btn-primary">
              Create Your First Program
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="card">
                <h2 className="text-xl font-bold mb-2">{program.title}</h2>
                <div className="space-y-2 mb-4">
                  {program.bylines.map((byline, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {byline.role}: {byline.collaborator?.creditedName || `${byline.collaborator?.firstName} ${byline.collaborator?.lastName}`}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/view/${program.id}`}
                    className="btn btn-secondary"
                  >
                    View
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(program.createdAt?.toDate()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 