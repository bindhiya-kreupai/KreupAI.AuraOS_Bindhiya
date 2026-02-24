/**
 * Clock In/Out Screen
 * GPS-enabled clock with geofencing support
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { locationService, LocationResult } from '@/services';
import { attendanceService } from '@/services/attendance.service';

interface ClockEntry {
  time: string;
  location?: string;
  type: 'in' | 'out';
}

export function ClockInOut() {
  const { theme } = useThemeStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [todayEntries, setTodayEntries] = useState<ClockEntry[]>([]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch GPS location
  const fetchLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    try {
      const result: LocationResult = await locationService.getCurrentLocation();
      if (result.success && result.coordinates) {
        setGpsAccuracy(result.coordinates.accuracy || null);
        const address = await locationService.getAddress(result.coordinates);
        setLocationAddress(address);
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleClockAction = async () => {
    setIsLoading(true);
    try {
      if (isCheckedIn) {
        await attendanceService.checkOut({ method: 'app' });
        setTodayEntries([...todayEntries, { time: format(new Date(), 'HH:mm'), location: locationAddress || undefined, type: 'out' }]);
      } else {
        await attendanceService.checkIn({ method: 'app' });
        setTodayEntries([...todayEntries, { time: format(new Date(), 'HH:mm'), location: locationAddress || undefined, type: 'in' }]);
      }
      setIsCheckedIn(!isCheckedIn);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record attendance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Time Display */}
      <View style={styles.timeSection}>
        <Text style={[styles.time, { color: theme.colors.text }]}>
          {format(currentTime, 'HH:mm:ss')}
        </Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </Text>
      </View>

      {/* GPS Status */}
      <View style={[styles.gpsCard, { backgroundColor: theme.colors.surface }]}>
        {isLoadingLocation ? (
          <View style={styles.gpsRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.gpsText, { color: theme.colors.textSecondary }]}>
              Getting GPS location...
            </Text>
          </View>
        ) : locationAddress ? (
          <>
            <View style={styles.gpsRow}>
              <Ionicons name="location" size={18} color={theme.colors.success} />
              <Text style={[styles.gpsText, { color: theme.colors.text }]} numberOfLines={2}>
                {locationAddress}
              </Text>
            </View>
            {gpsAccuracy && (
              <Text style={[styles.gpsAccuracy, { color: theme.colors.textSecondary }]}>
                GPS Accuracy: {gpsAccuracy.toFixed(0)}m
              </Text>
            )}
          </>
        ) : (
          <View style={styles.gpsRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.error} />
            <Text style={[styles.gpsText, { color: theme.colors.error }]}>
              Location unavailable
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={fetchLocation} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={16} color={theme.colors.primary} />
          <Text style={[styles.refreshText, { color: theme.colors.primary }]}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Clock Button */}
      <View style={styles.clockSection}>
        <TouchableOpacity
          style={[
            styles.clockButton,
            { backgroundColor: isCheckedIn ? theme.colors.error : theme.colors.success },
          ]}
          onPress={handleClockAction}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Ionicons name={isCheckedIn ? 'log-out' : 'log-in'} size={36} color="#fff" />
              <Text style={styles.clockButtonText}>
                {isCheckedIn ? 'Clock Out' : 'Clock In'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
          Status: {isCheckedIn ? 'Clocked In' : 'Not Clocked In'}
        </Text>
      </View>

      {/* Today's Entries */}
      {todayEntries.length > 0 && (
        <View style={[styles.entriesCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.entriesTitle, { color: theme.colors.text }]}>Today&apos;s Entries</Text>
          {todayEntries.map((entry, idx) => (
            <View key={idx} style={styles.entryRow}>
              <Ionicons
                name={entry.type === 'in' ? 'log-in-outline' : 'log-out-outline'}
                size={16}
                color={entry.type === 'in' ? theme.colors.success : theme.colors.error}
              />
              <Text style={[styles.entryTime, { color: theme.colors.text }]}>{entry.time}</Text>
              {entry.location && (
                <Text style={[styles.entryLocation, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {entry.location}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  timeSection: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  time: { fontSize: 48, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  date: { fontSize: 16, marginTop: 4 },
  gpsCard: { borderRadius: 12, padding: 16, marginBottom: 24 },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gpsText: { fontSize: 14, flex: 1 },
  gpsAccuracy: { fontSize: 12, marginTop: 4, marginLeft: 26 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  refreshText: { fontSize: 13, fontWeight: '500' },
  clockSection: { alignItems: 'center', marginBottom: 32 },
  clockButton: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  clockButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 8 },
  statusText: { fontSize: 14, marginTop: 12 },
  entriesCard: { borderRadius: 12, padding: 16 },
  entriesTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  entryTime: { fontSize: 14, fontWeight: '500', width: 50 },
  entryLocation: { fontSize: 12, flex: 1 },
});
