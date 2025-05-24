import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          Applaudable
        </Link>

        <nav className="header__nav">
          {currentUser ? (
            <>
              <Link to="/editor" className="header__link">Create Program</Link>
              <Link to="/my-programs" className="header__link">My Programs</Link>
              <button 
                onClick={logout} 
                className="header__button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="header__link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 