/**
 * Check In Screen
 * Advanced check-in with photo, location, and geofencing
 * Phase 2 Enhancement: GPS-based attendance with geofence validation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Camera, CameraType } from 'expo-camera';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { attendanceService } from '@/services/attendance.service';
import { locationService, GeofenceStatus, LocationResult } from '@/services';
import { AttendanceStackParamList, GeoLocation } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<AttendanceStackParamList, 'CheckIn'>;
};

export function CheckInScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Fetch work locations for geofencing
  const { data: workLocations } = useQuery({
    queryKey: ['workLocations'],
    queryFn: () => attendanceService.getWorkLocations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up geofence regions when work locations are loaded
  useEffect(() => {
    if (workLocations?.locations) {
      locationService.setGeofenceRegions(
        workLocations.locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: loc.radius,
        }))
      );
    }
  }, [workLocations]);

  // Request permissions and get location
  const fetchLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');

      const result: LocationResult = await locationService.getCurrentLocation();

      if (result.success && result.coordinates) {
        setLocation({
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude,
          accuracy: result.coordinates.accuracy,
        });

        // Check geofence
        if (workLocations?.locations) {
          const geoStatus = locationService.checkGeofence(result.coordinates);
          setGeofenceStatus(geoStatus);
        }

        // Get address
        const address = await locationService.getAddress(result.coordinates);
        setLocationAddress(address);
      } else {
        Alert.alert(t('attendance.error'), result.error || t('attendance.locationError'));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [workLocations, t]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const checkInMutation = useMutation({
    mutationFn: () =>
      attendanceService.checkIn({
        location: location || undefined,
        photo: photo || undefined,
        method: 'app',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      Alert.alert(t('attendance.success'), t('attendance.checkedIn'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      Alert.alert(t('attendance.error'), error.message);
    },
  });

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    setIsCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      setPhoto(result.uri);
    } catch (error) {
      Alert.alert(t('attendance.error'), t('attendance.photoError'));
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const handleCheckIn = () => {
    if (!photo) {
      Alert.alert(t('attendance.error'), t('attendance.photoRequired'));
      return;
    }
    checkInMutation.mutate();
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.permissionText, { color: theme.colors.text }]}>
            {t('attendance.cameraPermissionRequired')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      {/* Camera/Photo View */}
      <View style={styles.cameraContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <Camera ref={cameraRef} style={styles.camera} type={CameraType.front}>
            <View style={styles.cameraOverlay}>
              <View style={styles.faceGuide} />
            </View>
          </Camera>
        )}
      </View>

      {/* Info Section */}
      <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.currentTime, { color: theme.colors.text }]}>
          {format(new Date(), 'HH:mm:ss')}
        </Text>
        <Text style={[styles.currentDate, { color: theme.colors.textSecondary }]}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Text>

        {/* Location Status Section */}
        <View style={styles.locationSection}>
          {isLoadingLocation ? (
            <View style={styles.locationInfo}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                {t('attendance.gettingLocation')}
              </Text>
            </View>
          ) : location ? (
            <>
              {/* Geofence Status */}
              {geofenceStatus && (
                <View style={[
                  styles.geofenceStatus,
                  {
                    backgroundColor: geofenceStatus.isWithin
                      ? `${theme.colors.success}20`
                      : `${theme.colors.warning}20`,
                  }
                ]}>
                  <Ionicons
                    name={geofenceStatus.isWithin ? 'checkmark-circle' : 'warning'}
                    size={20}
                    color={geofenceStatus.isWithin ? theme.colors.success : theme.colors.warning}
                  />
                  <View style={styles.geofenceTextContainer}>
                    <Text style={[
                      styles.geofenceTitle,
                      { color: geofenceStatus.isWithin ? theme.colors.success : theme.colors.warning }
                    ]}>
                      {geofenceStatus.isWithin
                        ? t('attendance.withinOffice')
                        : t('attendance.outsideOffice')}
                    </Text>
                    {geofenceStatus.region && (
                      <Text style={[styles.geofenceSubtitle, { color: theme.colors.textSecondary }]}>
                        {geofenceStatus.isWithin
                          ? geofenceStatus.region.name
                          : `${locationService.formatDistance(geofenceStatus.distance)} from ${geofenceStatus.region.name}`}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Address */}
              {locationAddress && (
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={16} color={theme.colors.primary} />
                  <Text
                    style={[styles.locationText, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {locationAddress}
                  </Text>
                </View>
              )}

              {/* Refresh Location Button */}
              <TouchableOpacity
                style={styles.refreshLocationButton}
                onPress={fetchLocation}
                disabled={isLoadingLocation}
              >
                <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                <Text style={[styles.refreshLocationText, { color: theme.colors.primary }]}>
                  {t('attendance.refreshLocation')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={16} color={theme.colors.error} />
              <Text style={[styles.locationText, { color: theme.colors.error }]}>
                {t('attendance.locationUnavailable')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {photo ? (
            <>
              <TouchableOpacity
                style={[styles.retakeButton, { borderColor: theme.colors.border }]}
                onPress={retakePhoto}
              >
                <Ionicons name="refresh" size={20} color={theme.colors.text} />
                <Text style={[styles.retakeText, { color: theme.colors.text }]}>
                  {t('attendance.retake')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkInButton, { backgroundColor: theme.colors.success }]}
                onPress={handleCheckIn}
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.checkInText}>{t('attendance.checkIn')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: theme.colors.primary }]}
              onPress={takePhoto}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.captureText}>{t('attendance.takePhoto')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  photoPreview: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  faceGuide: {
    width: 200,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 100,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  infoSection: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentDate: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  geofenceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  geofenceTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  geofenceTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  geofenceSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  refreshLocationText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
  },
  captureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
  },
  retakeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  checkInButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
  },
  checkInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
