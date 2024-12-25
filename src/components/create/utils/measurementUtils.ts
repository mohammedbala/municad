// Utility functions for calculating distances and formatting measurements
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatMeasurement(distanceInMeters: number, units: 'imperial' | 'metric' = 'imperial'): string {
  if (units === 'imperial') {
    const feetPerMeter = 3.28084;
    const feet = distanceInMeters * feetPerMeter;
    
    if (feet < 1) {
      return `${Math.round(feet * 12)} in`;
    } else if (feet >= 5280) {
      const miles = feet / 5280;
      return `${miles.toFixed(2)} mi`;
    } else {
      return `${Math.round(feet)} ft`;
    }
  } else {
    if (distanceInMeters < 1) {
      return `${Math.round(distanceInMeters * 100)} cm`;
    } else if (distanceInMeters >= 1000) {
      return `${(distanceInMeters / 1000).toFixed(2)} km`;
    } else {
      return `${Math.round(distanceInMeters)} m`;
    }
  }
}