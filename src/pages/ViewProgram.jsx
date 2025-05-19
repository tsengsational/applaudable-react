import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProgram } from '../services/firestore';
import DOMPurify from 'dompurify';
import { ImageUploader } from '../components/ImageUploader';

export default function ViewProgram() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({});

  // Configure DOMPurify to allow specific HTML elements and attributes
  const sanitizeConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  };

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const data = await getProgram(id);
        if (data) {
          setProgram(data);
        } else {
          setError('Program not found');
        }
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Error loading program');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleImageUpload = (urlsByWidth) => {
    console.log('Uploaded images:', urlsByWidth);
    setUploadedImages(urlsByWidth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: '#dc2626' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="card">
          {/* Test Upload Section */}
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Test Image Upload</h2>
            <ImageUploader 
              userId="test-user" 
              onUpload={handleImageUpload}
              className="mb-4"
            />
            
            {/* Display uploaded images */}
            {Object.entries(uploadedImages).length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Uploaded Images:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(uploadedImages).map(([width, url]) => (
                    <div key={width} className="border rounded p-2">
                      <p className="text-sm text-gray-600 mb-2">{width}px width</p>
                      <img 
                        src={url} 
                        alt={`${width}px width`}
                        className="w-full h-auto rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-center">
              {program.title}
            </h1>
            {program.subtitle && (
              <h2 className="text-center text-gray-600">
                {program.subtitle}
              </h2>
            )}
          </div>

          {/* Primary Image */}
          {program.primaryImageUrl && (
            <div className="mb-8">
              <img 
                src={program.primaryImageUrl} 
                alt={program.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Sections */}
          <div className="space-y-8">
            {program.sections?.map((section, index) => (
              <div key={section.id || index} className="border-t pt-4">
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                {section.subtitle && (
                  <h4 className="text-lg text-gray-600 mb-4">{section.subtitle}</h4>
                )}

                {/* Section Content */}
                {section.type === 'text' && section.content && (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(section.content, {
                        ALLOWED_TAGS: [
                          'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
                          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code'
                        ],
                        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                      })
                    }}
                  />
                )}

                {/* Media Section */}
                {section.type === 'media' && section.mediaSource && (
                  <div className="mt-4">
                    {section.mediaType === 'image' && (
                      <img 
                        src={section.mediaSource} 
                        alt={section.title}
                        className="w-full h-auto rounded-lg"
                      />
                    )}
                    {section.mediaType === 'video' && (
                      <video 
                        src={section.mediaSource} 
                        controls
                        className="w-full rounded-lg"
                      />
                    )}
                    {section.mediaType === 'gallery' && (
                      <div className="grid grid-cols-2 gap-4">
                        {section.mediaSource.split(',').map((url, i) => (
                          <img 
                            key={i}
                            src={url.trim()} 
                            alt={`${section.title} - Image ${i + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Credits Section */}
                {section.type === 'credits' && section.bylines?.length > 0 && (
                  <div className="space-y-4">
                    {section.bylines.map((byline, bylineIndex) => (
                      <div key={bylineIndex} className="flex justify-between items-center">
                        <span className="font-medium">{byline.role}: </span>
                        <span>
                          {byline.collaborator?.creditedName || 
                            `${byline.collaborator?.firstName || ''} ${byline.collaborator?.lastName || ''}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 