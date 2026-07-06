import { redirect } from 'next/navigation';

// AURA-342: Menu feature "Biometric & Geolocation Consent Register" maps to the
// canonical attendance consent register workspace, recording biometric /
// geolocation / photo capture consent with grant and revocation tracking.
export default function AttendanceConsentRegisterRedirect() {
  redirect('/dashboard/attendance-compliance/consents');
}
