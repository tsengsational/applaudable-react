import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const TextSection = ({ section, onUpdate }) => {
  return (
    <div className="text-section">
      <div className="text-section__form-group">
        <label className="text-section__label">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, { title: e.target.value })}
          className="text-section__input"
          required
        />
      </div>

      <div className="text-section__form-group">
        <label className="text-section__label">Section Subtitle</label>
        <input
          type="text"
          value={section.subtitle}
          onChange={(e) => onUpdate(section.id, { subtitle: e.target.value })}
          className="text-section__input"
        />
      </div>

      <div className="text-section__form-group">
        <label className="text-section__label">Content</label>
        <ReactQuill
          value={section.content}
          onChange={(content) => onUpdate(section.id, { content })}
          className="text-section__editor"
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          }}
        />
      </div>
    </div>
  );
}; 