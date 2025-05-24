import React from 'react';

export const VideoMedia = ({ section, collaborators }) => {
  const getEmbedUrl = (url) => {
    try {
      const videoUrl = new URL(url);
      
      // YouTube
      if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
        const videoId = videoUrl.searchParams.get('v') || videoUrl.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Vimeo
      if (videoUrl.hostname.includes('vimeo.com')) {
        const videoId = videoUrl.pathname.slice(1);
        return `https://player.vimeo.com/video/${videoId}`;
      }
      
      return url;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return url;
    }
  };

  return (
    <div className="video-media">
      <h2 className="video-media__title">{section.title}</h2>
      {section.subtitle && <h3 className="video-media__subtitle">{section.subtitle}</h3>}
      
      <div className="video-media__content">
        {section.mediaSource && (
          <div className="video-media__container">
            <iframe
              src={getEmbedUrl(section.mediaSource)}
              title={section.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-media__iframe"
            />
          </div>
        )}
      </div>

      {section.bylines && section.bylines.length > 0 && (
        <div className="video-media__bylines">
          {section.bylines.map((byline, index) => {
            const collaborator = collaborators[byline.id];
            return (
              <div key={index} className="video-media__byline">
                <span className="video-media__role">{byline.role}: </span>
                <span className="video-media__name">
                  {collaborator ? (
                    collaborator.creditedName || 
                    `${collaborator.firstName} ${collaborator.lastName}`
                  ) : (
                    <span className="video-media__name--error">Collaborator not found</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 