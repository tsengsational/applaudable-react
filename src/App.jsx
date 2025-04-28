import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Placeholder components - we'll create these next
import Home from './pages/Home';
import Login from './pages/Login';
import Editor from './pages/Editor';
import ViewProgram from './pages/ViewProgram';
import MyPrograms from './pages/MyPrograms';
import Collaborators from './pages/Collaborators';

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
          <Route
            path="/my-programs"
            element={
              <PrivateRoute>
                <MyPrograms />
              </PrivateRoute>
            }
          />
          <Route
            path="/collaborators"
            element={
              <PrivateRoute>
                <Collaborators />
              </PrivateRoute>
            }
          />
          <Route path="/view/:id" element={<ViewProgram />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 