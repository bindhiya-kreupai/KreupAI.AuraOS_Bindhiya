import { NextRequest, NextResponse } from "next/server";

interface BiometricVerifyRequest {
  employeeId: string;
  biometricType: "fingerprint" | "facial" | "iris";
  biometricData: string;
}

interface BiometricVerifyResponse {
  verified: boolean;
  employeeId: string;
  employeeName: string;
  confidenceScore: number;
  verificationMethod: string;
  timestamp: string;
  attendanceRecorded: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BiometricVerifyRequest = await request.json();

    if (!body.employeeId || !body.biometricType || !body.biometricData) {
      return NextResponse.json(
        { error: "employeeId, biometricType, and biometricData are required" },
        { status: 400 }
      );
    }

    // Mock biometric verification - simulate high confidence match
    const confidenceScore = 0.92 + Math.random() * 0.08;
    const verified = confidenceScore >= 0.95;

    const response: BiometricVerifyResponse = {
      verified,
      employeeId: body.employeeId,
      employeeName: "John Smith",
      confidenceScore: Math.round(confidenceScore * 1000) / 1000,
      verificationMethod: body.biometricType,
      timestamp: new Date().toISOString(),
      attendanceRecorded: verified,
      message: verified
        ? "Biometric verification successful. Attendance recorded."
        : "Biometric verification failed. Confidence score below threshold.",
    };

    return NextResponse.json(response, { status: verified ? 200 : 401 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
