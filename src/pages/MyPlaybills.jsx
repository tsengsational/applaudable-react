import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPlaybills } from '../services/firestore';

export default function MyPlaybills() {
  const { currentUser } = useAuth();
  const [playbills, setPlaybills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaybills = async () => {
      if (!currentUser) return;

      try {
        const userPlaybills = await getUserPlaybills(currentUser.uid);
        setPlaybills(userPlaybills);
      } catch (err) {
        console.error('Error fetching playbills:', err);
        setError('Failed to load playbills');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybills();
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
          <h1>My Playbills</h1>
          <Link to="/editor" className="btn btn-primary">
            Create New Playbill
          </Link>
        </div>

        {playbills.length === 0 ? (
          <div className="card text-center">
            <p className="mb-4">You haven't created any playbills yet.</p>
            <Link to="/editor" className="btn btn-primary">
              Create Your First Playbill
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playbills.map((playbill) => (
              <div key={playbill.id} className="card">
                <h2 className="text-xl font-bold mb-2">{playbill.title}</h2>
                <div className="space-y-2 mb-4">
                  {playbill.bylines.map((byline, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {byline}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/view/${playbill.id}`}
                    className="btn btn-secondary"
                  >
                    View
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(playbill.createdAt?.toDate()).toLocaleDateString()}
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