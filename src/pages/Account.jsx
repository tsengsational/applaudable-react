import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {currentUser.email}</p>
                <p><span className="font-medium">Name:</span> {currentUser.displayName || 'Not set'}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleSignOut}
                className="btn btn-danger"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 