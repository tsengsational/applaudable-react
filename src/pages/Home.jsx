import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Applaudable</h1>
          <p className="text-xl text-gray-600 mb-8">
            Create beautiful digital programs for your performances
          </p>
          
          <div className="space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/editor"
                  className="btn btn-primary"
                >
                  Create Program
                </Link>
                <Link
                  to="/my-programs"
                  className="btn btn-secondary"
                >
                  My Programs
                </Link>
                <Link
                  to="/collaborators"
                  className="btn btn-secondary"
                >
                  Manage Collaborators
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
} 