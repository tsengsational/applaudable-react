import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation({ isMobile = false, onNavigate }) {
  const { currentUser } = useAuth();

  const navItems = currentUser ? [
    { to: '/editor', label: 'Create Program' },
    { to: '/my-programs', label: 'My Programs' },
    { to: '/collaborators', label: 'Collaborators' },
    { to: '/account', label: 'Account' }
  ] : [
    { to: '/login', label: 'Get Started' }
  ];

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleClick}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <nav className="flex space-x-4">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 