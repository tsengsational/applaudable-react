import React from 'react';

export const VideoMedia = ({ section, onUpdate }) => {
  return (
    <div className="form-group">
      <label className="form-label">Video URL</label>
      <input
        type="url"
        value={section.mediaSource}
        onChange={(e) => onUpdate(section.id, { mediaSource: e.target.value })}
        className="form-input"
        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
        required
      />
    </div>
  );
}; 