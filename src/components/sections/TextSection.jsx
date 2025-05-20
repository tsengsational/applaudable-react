import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const TextSection = ({ section, onUpdate }) => {
  return (
    <div className="section">
      <div className="form-group">
        <label className="form-label">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, { title: e.target.value })}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Section Subtitle</label>
        <input
          type="text"
          value={section.subtitle}
          onChange={(e) => onUpdate(section.id, { subtitle: e.target.value })}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content</label>
        <div className="editor">
          <ReactQuill
            value={section.content}
            onChange={(content) => onUpdate(section.id, { content })}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
              ]
            }}
            theme="snow"
            className="quill-container"
          />
        </div>
      </div>
    </div>
  );
}; 