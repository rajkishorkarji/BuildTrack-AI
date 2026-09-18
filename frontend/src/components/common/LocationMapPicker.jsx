import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Crosshair, ShieldCheck } from 'lucide-react';
import { getCurrentGpsCoordinates } from '../../utils/geo';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function LocationMapPicker({
  initialLat,
  initialLng,
  initialRadius = 100,
  initialLocationText = '',
  onChange,
  height = '280px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState(initialLocationText || '');
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(initialRadius);
  const [resolvedAddress, setResolvedAddress] = useState(initialLocationText || '');
  const [selectedCoords, setSelectedCoords] = useState(
    initialLat != null && initialLng != null
      ? { lat: Number(initialLat), lng: Number(initialLng) }
      : null
  );

  const defaultCenter = [20.2961, 85.8245];
  const activeCenter = selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : defaultCenter;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: activeCenter,
      zoom: selectedCoords ? 15 : 12,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (selectedCoords) {
      placeMarkerAndCircle(map, selectedCoords.lat, selectedCoords.lng, currentRadius);
    }

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      handleNewLocation(lat, lng, currentRadius);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const placeMarkerAndCircle = (map, lat, lng, radius) => {
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        handleNewLocation(pos.lat, pos.lng, currentRadius);
      });
      markerRef.current = marker;
    }

    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radius);
    } else {
      const circle = L.circle([lat, lng], {
        radius: radius,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);
      circleRef.current = circle;
    }
  };

  const handleNewLocation = (lat, lng, radius, customAddress = null) => {
    const latFixed = Number(lat.toFixed(6));
    const lngFixed = Number(lng.toFixed(6));
    setSelectedCoords({ lat: latFixed, lng: lngFixed });

    if (mapInstanceRef.current) {
      placeMarkerAndCircle(mapInstanceRef.current, latFixed, lngFixed, radius);
    }

    if (onChange) {
      onChange({
        latitude: latFixed,
        longitude: lngFixed,
        geofenceRadiusMeters: radius,
        address: customAddress || resolvedAddress,
      });
    }

    if (!customAddress) {
      reverseGeocode(latFixed, lngFixed);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      if (data?.display_name) {
        setResolvedAddress(data.display_name);
        if (onChange) {
          onChange({
            latitude: lat,
            longitude: lng,
            geofenceRadiusMeters: currentRadius,
            address: data.display_name,
          });
        }
      }
    } catch {}
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const query = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const name = item.display_name || searchQuery;

        setResolvedAddress(name);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        handleNewLocation(lat, lng, currentRadius, name);
      } else {
        alert(`Location "${searchQuery}" not found. Try adding city/state name (e.g. "${searchQuery}, Odisha").`);
      }
    } catch {
      alert('Unable to search address. Please try again or tap the map directly.');
    } finally {
      setSearching(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    const r = Number(newRadius);
    setCurrentRadius(r);
    if (circleRef.current) {
      circleRef.current.setRadius(r);
    }
    if (selectedCoords && onChange) {
      onChange({
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        geofenceRadiusMeters: r,
        address: resolvedAddress,
      });
    }
  };

  const handleDetectDeviceGps = async () => {
    setDetectingGps(true);
    const loc = await getCurrentGpsCoordinates();
    setDetectingGps(false);
    if (loc.success) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([loc.latitude, loc.longitude], 16);
      }
      handleNewLocation(loc.latitude, loc.longitude, currentRadius);
    } else {
      alert(loc.error || 'Failed to detect device location');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search site city, town, or address (e.g. Berhampur, Odisha)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--panel-soft)',
              color: 'var(--text)',
              fontSize: 13,
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: 10, color: 'var(--muted)', pointerEvents: 'none' }} />
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ padding: '8px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? 'Locating…' : '🔍 Find on Map'}
        </button>
        <button
          type="button"
          className="secondary-button"
          style={{ padding: '8px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
          onClick={handleDetectDeviceGps}
          disabled={detectingGps}
          title="Detect GPS from your current device (use if you are standing on the physical site)"
        >
          <Crosshair size={13} style={{ color: 'var(--green)' }} />
          {detectingGps ? 'Detecting…' : '📍 My Location'}
        </button>
      </div>

      {/* Map Display */}
      <div
        style={{
          position: 'relative',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div ref={mapContainerRef} style={{ height: height, width: '100%', zIndex: 1 }} />

        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            zIndex: 500,
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 11,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <MapPin size={12} style={{ color: '#38BDF8' }} />
          <span>Tap anywhere on the map or drag the pin to set the exact site plot</span>
        </div>
      </div>

      {/* Radius Slider & Quick Presets */}
      <div style={{ background: 'var(--panel-soft)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: 'var(--blue)' }} />
            Site Geofence Radius: <strong style={{ color: 'var(--blue)' }}>{currentRadius} meters</strong>
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[50, 100, 150, 250, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                className="secondary-button"
                style={{
                  padding: '2px 8px',
                  fontSize: 11,
                  background: currentRadius === preset ? 'var(--blue)' : undefined,
                  color: currentRadius === preset ? '#fff' : undefined,
                  border: currentRadius === preset ? 'none' : undefined,
                }}
                onClick={() => handleRadiusChange(preset)}
              >
                {preset}m
              </button>
            ))}
          </div>
        </div>

        <input
          type="range"
          min="20"
          max="1000"
          step="10"
          value={currentRadius}
          onChange={(e) => handleRadiusChange(e.target.value)}
          style={{ width: '100%', accentColor: 'var(--blue)', cursor: 'pointer' }}
        />
      </div>

      {/* Active Selection Summary */}
      {selectedCoords ? (
        <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,197,94,0.06)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={13} style={{ color: 'var(--green)' }} />
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>
              {resolvedAddress ? (resolvedAddress.length > 55 ? resolvedAddress.substring(0, 55) + '…' : resolvedAddress) : 'Custom Pin Location'}
            </span>
          </div>
          <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 11 }}>
            ✓ Geofence Configured ({currentRadius}m radius)
          </span>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
          Type a city/address above or click anywhere on the map to set the project geofence boundary.
        </p>
      )}
    </div>
  );
}
