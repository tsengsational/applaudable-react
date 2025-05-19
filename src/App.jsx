import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';

// Placeholder components - we'll create these next
import Home from './pages/Home';
import Login from './pages/Login';
import Editor from './pages/Editor';
import ViewProgram from './pages/ViewProgram';
import MyPrograms from './pages/MyPrograms';
import Collaborators from './pages/Collaborators';
import Account from './pages/Account';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
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
                path="/editor/:id"
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
              <Route
                path="/account"
                element={
                  <PrivateRoute>
                    <Account />
                  </PrivateRoute>
                }
              />
              <Route path="/view/:id" element={<ViewProgram />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 