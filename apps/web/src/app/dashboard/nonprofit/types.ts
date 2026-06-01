export type VolunteerStatus = 'active' | 'inactive' | 'pending_approval';
export type DeploymentStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export interface Volunteer { volunteerId: string; name: string; email: string; phone: string; skills: string[]; availability: string[]; hoursContributed: number; assignedMissions: string[]; status: VolunteerStatus; createdAt: string; }
export interface FieldMission { missionId: string; missionName: string; location: string; startDate: string; endDate: string; volunteers: string[]; objectives: string[]; budget: number; expenses: number; status: DeploymentStatus; createdAt: string; }
export interface Donor { donorId: string; donorName: string; donorType: 'individual' | 'corporate' | 'foundation'; email: string; phone?: string; totalDonated: number; lastDonationDate: string; recurring: boolean; communications: DonorCommunication[]; createdAt: string; }
export interface DonorCommunication { communicationId: string; date: string; type: 'email' | 'call' | 'meeting'; subject: string; notes: string; }
export interface NonprofitSettings { settingsId: string; organizationId: string; volunteerSettings: { backgroundCheckRequired: boolean; trainingRequired: boolean; }; deploymentSettings: { advanceNoticeDays: number; maxDuration: number; }; donorSettings: { acknowledgementRequired: boolean; taxReceiptAuto: boolean; }; notifications: { newVolunteer: boolean; missionUpdate: boolean; donationReceived: boolean; }; updatedAt: string; }
export interface NonprofitAlert { alertId: string; alertType: 'volunteer' | 'mission' | 'donor'; severity: 'low' | 'medium' | 'high'; title: string; message: string; relatedEntity: { entityType: string; entityId: string; }; status: 'active' | 'resolved'; createdAt: string; }
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
