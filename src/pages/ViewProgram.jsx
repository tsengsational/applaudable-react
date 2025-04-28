import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProgram } from '../services/firestore';
import QRCode from 'qrcode.react';

export default function ViewProgram() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-center">
              {program.title}
            </h1>
          </div>

          {/* Bylines */}
          <div className="mb-4">
            <div className="space-y-4">
              {program.bylines.map((byline, index) => (
                <p key={index} className="text-center">
                  {byline.role}: {byline.collaborator?.creditedName || `${byline.collaborator?.firstName} ${byline.collaborator?.lastName}`}
                </p>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <QRCode
              value={window.location.href}
              size={128}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 