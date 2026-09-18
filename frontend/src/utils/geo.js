/**
 * Native Browser / Device GPS helper utility.
 * Captures physical hardware coordinates without external paid APIs.
 */
export async function getCurrentGpsCoordinates(options = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ success: false, error: 'Geolocation is not supported by your browser/device' });
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location';
        if (error.code === 1) msg = 'Location permission was denied. Please allow GPS location in your browser.';
        else if (error.code === 2) msg = 'Location unavailable. Please ensure device GPS is turned on.';
        else if (error.code === 3) msg = 'Location request timed out. Retrying with GPS.';
        resolve({ success: false, error: msg, code: error.code });
      },
      defaultOptions
    );
  });
}

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371000; // Earth radius in meters
  const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180.0);
  const dLon = (Number(lon2) - Number(lon1)) * (Math.PI / 180.0);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * (Math.PI / 180.0)) * Math.cos(Number(lat2) * (Math.PI / 180.0)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
}

export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return 'N/A';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}