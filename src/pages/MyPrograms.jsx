import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPrograms, deleteProgram } from '../services/firestore';
import QRCode from 'qrcode.react';

export default function MyPrograms() {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingProgramId, setDeletingProgramId] = useState(null);

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

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      return;
    }

    setDeletingProgramId(programId);
    try {
      await deleteProgram(programId);
      setPrograms(programs.filter(p => p.id !== programId));
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Failed to delete program');
    } finally {
      setDeletingProgramId(null);
    }
  };

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
                <div className="flex flex-col items-center mb-4">
                  <div className="w-full text-center mb-4">
                    <h2 className="text-xl font-bold mb-2">{program.title}</h2>
                    {program.subtitle && (
                      <p className="text-gray-600">{program.subtitle}</p>
                    )}
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <QRCode 
                      value={`${window.location.origin}/view/${program.id}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Link
                      to={`/view/${program.id}`}
                      className="btn btn-secondary"
                    >
                      View
                    </Link>
                    <Link
                      to={`/editor/${program.id}`}
                      className="btn btn-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProgram(program.id)}
                      disabled={deletingProgramId === program.id}
                      className="btn btn-secondary"
                      style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                    >
                      {deletingProgramId === program.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {program.createdAt?.toDate().toLocaleDateString() || 'No date'}
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