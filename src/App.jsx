import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Placeholder components - we'll create these next
import Home from './pages/Home';
import Login from './pages/Login';
import Editor from './pages/Editor';
import ViewPlaybill from './pages/ViewPlaybill';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/editor"
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            }
          />
          <Route path="/view/:id" element={<ViewPlaybill />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 