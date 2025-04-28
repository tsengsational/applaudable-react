import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/editor');
    } catch (error) {
      console.error('Failed to sign in:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">
          Sign in to Applaudable
        </h2>
        
        <button
          onClick={handleGoogleSignIn}
          className="btn btn-secondary flex items-center justify-center"
          style={{ width: '100%' }}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            style={{ width: '20px', height: '20px', marginRight: '8px' }}
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
} 