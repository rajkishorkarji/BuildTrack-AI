import { useState } from 'react';
import { Camera, Plus, MapPin, CheckCircle2 } from 'lucide-react';
import constructionSiteImage from '../../assets/images/construction-site.jpg';

export default function SEInspectionImages() {
  const [images, setImages] = useState([
    { id: 1, title: 'Column C4 Concrete Pouring QC Inspection', date: '06 Aug 2026', location: 'Sector 5, Metro Zone (20.2961° N, 85.8245° E)', url: constructionSiteImage },
    { id: 2, title: 'Foundation Rebar Spacing Audit', date: '05 Aug 2026', location: 'Sector 5, Metro Zone (20.2961° N, 85.8245° E)', url: constructionSiteImage },
  ]);

  const [notice, setNotice] = useState('');

  const handleAddImage = (e) => {
    e.preventDefault();
    const newImg = {
      id: Date.now(),
      title: 'Site Progress Evidence Shot',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      location: 'Sector 5, Metro Zone (20.2961° N, 85.8245° E)',
      url: constructionSiteImage,
    };
    setImages([newImg, ...images]);
    setNotice('✓ Inspection Photo uploaded & Geo-tagged!');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Site Engineering Visual Verification</p>
          <h1>Site Photo Inspection Stream ({images.length})</h1>
        </div>
        <button type="button" className="primary-button" onClick={handleAddImage}>
          <Camera size={16} /> Upload Inspection Photo
        </button>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {images.map(img => (
          <div key={img.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={img.url} alt={img.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text)' }}>{img.title}</h4>
              <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: 'var(--blue)' }} /> {img.location}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>Uploaded: {img.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
