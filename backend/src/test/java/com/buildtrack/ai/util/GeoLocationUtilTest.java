package com.buildtrack.ai.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GeoLocationUtilTest {

    private static final double BBSR_LAT = 20.2961;
    private static final double BBSR_LON = 85.8245;

    private static final double BERHAMPUR_LAT = 19.3149;
    private static final double BERHAMPUR_LON = 84.7941;

    @Test
    void testBhubaneswarToBerhampurDistance() {
        double distanceMeters = GeoLocationUtil.calculateDistanceMeters(BBSR_LAT, BBSR_LON, BERHAMPUR_LAT, BERHAMPUR_LON);
        double distanceKm = distanceMeters / 1000.0;
        assertTrue(distanceKm > 140.0 && distanceKm < 180.0, "Expected approx 160-170km, got: " + distanceKm);
    }

    @Test
    void testNearbyPointsWithinGeofence() {
        double siteLat = 19.314900;
        double siteLon = 84.794100;

        double workerLat = 19.315200;
        double workerLon = 84.794250;

        double distance = GeoLocationUtil.calculateDistanceMeters(siteLat, siteLon, workerLat, workerLon);
        assertTrue(distance < 50.0, "Worker should be within 50m, was: " + distance);

        boolean inside100m = GeoLocationUtil.isWithinGeofence(siteLat, siteLon, workerLat, workerLon, 100.0);
        assertTrue(inside100m, "Worker should be inside 100m geofence");
    }

    @Test
    void testRemotePointRejectedByGeofence() {
        boolean inside100m = GeoLocationUtil.isWithinGeofence(BERHAMPUR_LAT, BERHAMPUR_LON, BBSR_LAT, BBSR_LON, 100.0);
        assertFalse(inside100m, "Worker in Bhubaneswar MUST be rejected from Berhampur 100m geofence");
    }

    @Test
    void testNullSiteCoordinatesAllowedForBackwardCompatibility() {
        boolean inside = GeoLocationUtil.isWithinGeofence(null, null, BBSR_LAT, BBSR_LON, 100.0);
        assertTrue(inside, "Unconfigured site should pass by default for backward compatibility");
    }

    @Test
    void testFormatDistance() {
        assertEquals("45 m", GeoLocationUtil.formatDistance(45.2));
        assertEquals("165.2 km", GeoLocationUtil.formatDistance(165240.0));
    }
}