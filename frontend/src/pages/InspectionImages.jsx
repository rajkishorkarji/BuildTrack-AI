import { useState } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Eye,
  Calendar,
} from 'lucide-react';
import constructionSiteImage from '../assets/images/construction-site.jpg';

const initialImages = [
  {
    id: 1,
    title: 'Floor 14 Shaft Core Pouring Progress',
    zone: 'Metro Tower Complex • Zone A',
    coords: '20.2961° N, 85.8245° E (Geo-Tagged)',
    uploadedBy: 'Divya Krishnan (Site Engineer)',
    date: '2026-08-03 09:15 AM',
    aiScanResult: 'Safety Harness Compliant • Rebar Grade M40 Verified',
    status: 'PASSED',
    src: constructionSiteImage,
  },
  {
    id: 2,
    title: 'Column C4 Concrete Slump Test Verification',
    zone: 'Metro Tower Complex • Zone B',
    coords: '20.2964° N, 85.8248° E (Geo-Tagged)',
    uploadedBy: 'Divya Krishnan (Site Engineer)',
    date: '2026-08-02 02:45 PM',
    aiScanResult: 'Slump Value 110mm Approved',
    status: 'PASSED',
    src: constructionSiteImage,
  },
];

export default function InspectionImages() {
  const [images, setImages] = useState(initialImages);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleUploadPhoto = () => {
    setPhotoUploaded(true);
    const now = new Date();
    const newImg = {
      id: Date.now(),
      title: 'Floor 14 Riser Shuttering Inspection',
      zone: 'Metro Tower Complex • Zone A',
      coords: '20.2962° N, 85.8246° E (Geo-Tagged)',
      uploadedBy: 'Divya Krishnan (Site Engineer)',
      date: now.toLocaleString(),
      aiScanResult: 'AI Safety Detector: Hardhats & PPE Verified (98.4% Acc)',
      status: 'PASSED',
      src: constructionSiteImage,
    };
    setImages([newImg, ...images]);
    notify('Uploaded site inspection photo with GPS geo-tagging & AI Safety Vision scan!');
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>FIELD QUALITY & VISION INSPECTION</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Site Inspection & Geo-Tagged Images</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Site Engineer visual log: upload field photos, capture GPS coordinates, and run automated AI safety detector scans.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleUploadPhoto}
        >
          <Camera size={16} /> Capture / Upload Geo-Tagged Photo
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Upload Banner */}
      <div className="panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--panel), var(--panel-soft))' }}>
        <Upload size={48} style={{ color: 'var(--blue)', marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Snap or Drag Field Progress Photos</h3>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
          Automatically extracts EXIF data, GPS coordinates, and runs AI vision safety detector.
        </p>
        <button type="button" className="primary-button" onClick={handleUploadPhoto}>
          Select Site Photo File
        </button>
      </div>

      {/* Photo Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {images.map((img) => (
          <div key={img.id} className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
              <img src={img.src} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(36, 196, 107, 0.9)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                ✓ {img.status}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>{img.title}</h4>
              <span style={{ color: 'var(--muted)', fontSize: '12px', display: 'block' }}>{img.zone}</span>
              <span style={{ color: 'var(--blue)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <MapPin size={12} /> {img.coords}
              </span>
            </div>

            <div style={{ background: 'var(--panel-soft)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}>
              <strong style={{ color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={14} /> AI Detector Analysis:
              </strong>
              <div style={{ color: 'var(--text)', marginTop: '4px' }}>{img.aiScanResult}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <span>Uploaded {img.date}</span>
              <span>{img.uploadedBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
