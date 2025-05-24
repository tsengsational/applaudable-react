import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="nav">
      <ul className="nav__list">
        <li className="nav__item">
          <Link
            to="/"
            className={`nav__link ${isActive('/') ? 'nav__link--active' : ''}`}
          >
            Home
          </Link>
        </li>
        {currentUser ? (
          <>
            <li className="nav__item">
              <Link
                to="/programs"
                className={`nav__link ${isActive('/programs') ? 'nav__link--active' : ''}`}
              >
                Programs
              </Link>
            </li>
            <li className="nav__item">
              <Link
                to="/collaborators"
                className={`nav__link ${isActive('/collaborators') ? 'nav__link--active' : ''}`}
              >
                Collaborators
              </Link>
            </li>
            <li className="nav__item">
              <Link
                to="/profile"
                className={`nav__link ${isActive('/profile') ? 'nav__link--active' : ''}`}
              >
                Profile
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav__item">
              <Link
                to="/login"
                className={`nav__link ${isActive('/login') ? 'nav__link--active' : ''}`}
              >
                Login
              </Link>
            </li>
            <li className="nav__item">
              <Link
                to="/signup"
                className={`nav__link ${isActive('/signup') ? 'nav__link--active' : ''}`}
              >
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation; 