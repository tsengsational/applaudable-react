import React, { useState, useEffect } from 'react';

const AddBylineForm = ({ 
  onAdd, 
  onCancel, 
  existingRoles = [], 
  collaborator 
}) => {
  const [role, setRole] = useState('');
  const [suggestedRoles, setSuggestedRoles] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (role.trim()) {
      const filtered = existingRoles.filter(r => 
        r.toLowerCase().includes(role.toLowerCase())
      );
      setSuggestedRoles(filtered);
    } else {
      setSuggestedRoles([]);
    }
  }, [role, existingRoles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role.trim()) {
      onAdd(role.trim());
    }
  };

  const handleSuggestionClick = (suggestedRole) => {
    setRole(suggestedRole);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="add-byline-form">
      <div className="form-group">
        <label className="form-label">Role</label>
        <div className="autocomplete-container">
          <input
            type="text"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="form-input"
            placeholder="Enter role (e.g., Director, Writer)"
            required
          />
          {showSuggestions && suggestedRoles.length > 0 && (
            <ul className="autocomplete-suggestions">
              {suggestedRoles.map((suggestedRole, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestedRole)}
                  className="autocomplete-suggestion"
                >
                  {suggestedRole}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Collaborator</label>
        <div className="selected-collaborator">
          {collaborator.creditedName || 
            `${collaborator.firstName} ${collaborator.lastName}`}
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={onCancel} className="button">
          Cancel
        </button>
        <button type="submit" className="button button-primary">
          Add Byline
        </button>
      </div>
    </form>
  );
};

export default AddBylineForm; 