import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="container py-12">
        <div className="text-center">
          <h1>Welcome to Applaudable</h1>
          <p className="mb-4">
            Create beautiful digital playbills for your performances
          </p>
          
          <div className="space-x-4">
            {currentUser ? (
              <Link
                to="/editor"
                className="btn btn-primary"
              >
                Create Playbill
              </Link>
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