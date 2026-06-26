/**
 * Formats milliseconds to "MM:SS" or "HH:MM:SS"
 */
export function formatDuration(ms: number, showMs = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  let result = "";
  if (hours > 0) {
    result += `${hours.toString().padStart(2, '0')}:`;
  }
  
  result += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  if (showMs) {
    const centiseconds = Math.floor((ms % 1000) / 10);
    result += `.${centiseconds.toString().padStart(2, '0')}`;
  }
  
  return result;
}

/**
 * Formats distance from meters to km string (e.g. "3.42 km")
 */
export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Calculates and formats pace in min/km from time in ms and distance in meters
 */
export function calculatePace(ms: number, meters: number): string {
  if (meters <= 0) return "--:--";
  
  const minutes = ms / 1000 / 60;
  const km = meters / 1000;
  const paceDec = minutes / km;
  
  const paceMin = Math.floor(paceDec);
  const paceSec = Math.floor((paceDec - paceMin) * 60);
  
  return `${paceMin.toString().padStart(2, '0')}:${paceSec.toString().padStart(2, '0')} /km`;
}

/**
 * Converts a pace string like "04:15 /km" back to speed or seconds for calculations
 */
export function paceToSeconds(paceStr: string): number {
  const clean = paceStr.split(' ')[0];
  const parts = clean.split(':');
  if (parts.length !== 2) return 0;
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  return mins * 60 + secs;
}

/**
 * Generates an estimated calorie burn based on distance, pace, and body weight (assumed 70kg)
 */
export function estimateCalories(meters: number): number {
  // Rough estimate: ~65 calories per kilometer for a 70kg person
  return Math.round((meters / 1000) * 68);
}
