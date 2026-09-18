package com.buildtrack.ai.util;

public final class GeoLocationUtil {

    private static final double EARTH_RADIUS_METERS = 6371000.0;
    public static final double DEFAULT_GEOFENCE_RADIUS_METERS = 150.0;

    private GeoLocationUtil() {}

    public static double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(rLat1) * Math.cos(rLat2) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

        return EARTH_RADIUS_METERS * c;
    }

    public static boolean isWithinGeofence(Double siteLat, Double siteLon, Double userLat, Double userLon, Double radiusMeters) {
        if (siteLat == null || siteLon == null) {
            return true;
        }
        if (userLat == null || userLon == null) {
            return false;
        }
        double allowedRadius = (radiusMeters != null && radiusMeters > 0) ? radiusMeters : DEFAULT_GEOFENCE_RADIUS_METERS;
        double distance = calculateDistanceMeters(siteLat, siteLon, userLat, userLon);
        return distance <= allowedRadius;
    }

    public static String formatDistance(double meters) {
        if (meters < 1000.0) {
            return String.format("%.0f m", meters);
        } else {
            return String.format("%.1f km", meters / 1000.0);
        }
    }
}