import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';

export default function ViewPlaybill() {
  const { id } = useParams();
  const [playbill, setPlaybill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaybill = async () => {
      try {
        const docRef = doc(firestore, 'playbills', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPlaybill(docSnap.data());
        } else {
          setError('Playbill not found');
        }
      } catch (err) {
        setError('Error loading playbill');
        console.error('Error fetching playbill:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybill();
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
              {playbill.title}
            </h1>
          </div>

          {/* Bylines */}
          <div className="mb-4">
            <div className="space-y-4">
              {playbill.bylines.map((byline, index) => (
                <p key={index} className="text-center">
                  {byline}
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