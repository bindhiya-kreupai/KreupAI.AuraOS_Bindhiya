/**
 * Location Service
 * GPS-based location tracking for attendance and geofencing
 *
 * Features:
 * - Get current location with high accuracy
 * - Geofencing for office locations
 * - Background location tracking
 * - Distance calculation
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface GeofenceRegion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  notifyOnEnter?: boolean;
  notifyOnExit?: boolean;
}

export interface LocationResult {
  success: boolean;
  coordinates?: Coordinates;
  timestamp?: Date;
  error?: string;
  isWithinGeofence?: boolean;
  geofenceName?: string;
  distanceToGeofence?: number;
}

export interface GeofenceStatus {
  isWithin: boolean;
  region?: GeofenceRegion;
  distance: number; // meters
  entryTime?: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOCATION_TASK_NAME = 'background-location-task';
const DEFAULT_GEOFENCE_RADIUS = 100; // 100 meters

// ============================================================================
// LOCATION SERVICE
// ============================================================================

class LocationService {
  private geofenceRegions: GeofenceRegion[] = [];
  private isTrackingBackground = false;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      // Request background permission for geofencing
      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission denied - geofencing may be limited');
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation(timeout = 15000): Promise<LocationResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Location permission not granted',
        };
      }

      const isEnabled = await this.isLocationEnabled();
      if (!isEnabled) {
        return {
          success: false,
          error: 'Location services are disabled',
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: timeout,
      });

      const coordinates: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };

      // Check geofence if regions are defined
      let geofenceStatus: GeofenceStatus | undefined;
      if (this.geofenceRegions.length > 0) {
        geofenceStatus = this.checkGeofence(coordinates);
      }

      return {
        success: true,
        coordinates,
        timestamp: new Date(location.timestamp),
        isWithinGeofence: geofenceStatus?.isWithin,
        geofenceName: geofenceStatus?.region?.name,
        distanceToGeofence: geofenceStatus?.distance,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
      };
    }
  }

  /**
   * Add geofence region (office location)
   */
  addGeofenceRegion(region: GeofenceRegion): void {
    const existingIndex = this.geofenceRegions.findIndex(r => r.id === region.id);
    if (existingIndex >= 0) {
      this.geofenceRegions[existingIndex] = region;
    } else {
      this.geofenceRegions.push(region);
    }
  }

  /**
   * Remove geofence region
   */
  removeGeofenceRegion(id: string): void {
    this.geofenceRegions = this.geofenceRegions.filter(r => r.id !== id);
  }

  /**
   * Set all geofence regions (office locations)
   */
  setGeofenceRegions(regions: GeofenceRegion[]): void {
    this.geofenceRegions = regions;
  }

  /**
   * Check if coordinates are within any geofence
   */
  checkGeofence(coordinates: Coordinates): GeofenceStatus {
    let closestRegion: GeofenceRegion | undefined;
    let minDistance = Infinity;

    for (const region of this.geofenceRegions) {
      const distance = this.calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        region.latitude,
        region.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }

      if (distance <= region.radius) {
        return {
          isWithin: true,
          region,
          distance,
        };
      }
    }

    return {
      isWithin: false,
      region: closestRegion,
      distance: minDistance,
    };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Returns distance in meters
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Start background location tracking
   */
  async startBackgroundTracking(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 1 minute
        distanceInterval: 50, // 50 meters
        deferredUpdatesInterval: 60000,
        foregroundService: {
          notificationTitle: 'AuraOS',
          notificationBody: 'Tracking attendance location',
          notificationColor: '#0066FF',
        },
      });

      this.isTrackingBackground = true;
      return true;
    } catch (error) {
      console.error('Error starting background tracking:', error);
      return false;
    }
  }

  /**
   * Stop background location tracking
   */
  async stopBackgroundTracking(): Promise<void> {
    try {
      const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRunning) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      this.isTrackingBackground = false;
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  }

  /**
   * Check if background tracking is active
   */
  isBackgroundTrackingActive(): boolean {
    return this.isTrackingBackground;
  }

  /**
   * Get registered geofence regions
   */
  getGeofenceRegions(): GeofenceRegion[] {
    return [...this.geofenceRegions];
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async getAddress(coordinates: Coordinates): Promise<string | null> {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (address) {
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);
        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }
}

// Background task handler
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // Process location updates (e.g., send to server, check geofence)
    console.log('Background location update:', locations);
  }
});

export const locationService = new LocationService();
