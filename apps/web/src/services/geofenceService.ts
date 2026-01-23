import axios from 'axios';

const BASE_PATH = '/api/v1/attendance/geofences';

// Types
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ValidationResult {
  valid: boolean;
  locationName?: string;
  distance?: number;
  message?: string;
}

export interface GeofenceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
  createdAt: string;
}

export interface GeofenceCreate {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
}

// Service functions
export async function validateLocation(
  coords: Coordinates
): Promise<ValidationResult> {
  const response = await axios.post<ValidationResult>(
    `${BASE_PATH}/validate`,
    coords
  );
  return response.data;
}

export async function getGeofenceLocations(): Promise<GeofenceLocation[]> {
  const response = await axios.get<GeofenceLocation[]>(BASE_PATH);
  return response.data;
}

export async function createGeofence(
  data: GeofenceCreate
): Promise<GeofenceLocation> {
  const response = await axios.post<GeofenceLocation>(BASE_PATH, data);
  return response.data;
}

export async function updateGeofence(
  id: string,
  data: Partial<GeofenceCreate>
): Promise<GeofenceLocation> {
  const response = await axios.patch<GeofenceLocation>(
    `${BASE_PATH}/${id}`,
    data
  );
  return response.data;
}

export async function deleteGeofence(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}
