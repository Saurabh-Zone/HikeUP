function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortNearbyWorkers(workers, latitude, longitude, radiusKm = 15) {
  return workers
    .map(w => {
      const distance = calculateDistance(latitude, longitude, w.latitude, w.longitude);
      return { worker: w, distanceInKm: Number(distance.toFixed(2)) };
    })
    .filter(x => Number.isFinite(x.distanceInKm) && x.distanceInKm <= radiusKm)
    .sort((a, b) => a.distanceInKm - b.distanceInKm);
}

function estimateArrivalMinutes(distanceKm) {
  return Math.max(1, Math.ceil((distanceKm / 30) * 60));
}

module.exports = { calculateDistance, sortNearbyWorkers, estimateArrivalMinutes };
