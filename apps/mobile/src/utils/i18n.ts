/**
 * Internationalization Configuration
 * Supports English, Arabic, and Hindi
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// English translations
const en = {
  translation: {
    common: {
      days: 'days',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      viewAll: 'View All',
      share: 'Share',
      approve: 'Approve',
      reject: 'Reject',
      loading: 'Loading...',
    },
    navigation: {
      dashboard: 'Dashboard',
      attendance: 'Attendance',
      leave: 'Leave',
      payroll: 'Payroll',
      more: 'More',
    },
    auth: {
      tagline: 'Your HR Companion',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      login: 'Login',
      forgotPassword: 'Forgot Password?',
      loginWithBiometric: 'Login with Biometric',
      loginFailed: 'Login Failed',
      emailRequired: 'Email is required',
      invalidEmail: 'Please enter a valid email',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Password must be at least 6 characters',
      needHelp: 'Need help?',
      contactSupport: 'Contact Support',
      biometricPrompt: 'Authenticate to login',
      usePassword: 'Use Password',
      faceId: 'Face ID',
      touchId: 'Touch ID',
      biometricDescription: 'Use biometric authentication for quick and secure login.',
      biometricNotAvailable: 'Biometric authentication is not available on this device.',
      authenticateWithBiometric: 'Authenticate',
      usePasswordInstead: 'Use Password Instead',
      checkEmail: 'Check Your Email',
      resetEmailSent: 'We sent a password reset link to {{email}}',
      backToLogin: 'Back to Login',
      forgotPasswordDescription: 'Enter your email address and we will send you a link to reset your password.',
      sendResetLink: 'Send Reset Link',
      error: 'Error',
      unknownError: 'An unknown error occurred',
    },
    dashboard: {
      todayStatus: "Today's Status",
      quickActions: 'Quick Actions',
      applyLeave: 'Apply Leave',
      viewPayslip: 'View Payslip',
      attendance: 'Attendance',
      myTeam: 'My Team',
      leaveBalances: 'Leave Balances',
      upcoming: 'Upcoming',
    },
    attendance: {
      checkIn: 'Check In',
      checkOut: 'Check Out',
      workHours: 'Work Hours',
      todayRecord: "Today's Record",
      monthlySummary: 'Monthly Summary',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      onLeave: 'On Leave',
      totalHours: 'Total Hours',
      overtime: 'Overtime',
      success: 'Success',
      error: 'Error',
      checkedIn: 'You have checked in successfully',
      checkedOut: 'You have checked out successfully',
      confirmCheckOut: 'Confirm Check Out',
      confirmCheckOutMessage: 'Are you sure you want to check out?',
      dayCompleted: 'Day Completed',
      noRecords: 'No attendance records found',
      status: {
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        early_leave: 'Early Leave',
        half_day: 'Half Day',
        on_leave: 'On Leave',
        holiday: 'Holiday',
        weekend: 'Weekend',
      },
      takePhoto: 'Take Photo',
      retake: 'Retake',
      cameraPermissionRequired: 'Camera permission is required for check-in.',
      locationCaptured: 'Location captured',
      photoRequired: 'Please take a photo before checking in',
      photoError: 'Failed to take photo',
    },
    leave: {
      applyLeave: 'Apply Leave',
      balances: 'Leave Balances',
      recentRequests: 'Recent Requests',
      pending: 'pending',
      noRequests: 'No leave requests found',
      types: {
        annual: 'Annual Leave',
        sick: 'Sick Leave',
        emergency: 'Emergency Leave',
        maternity: 'Maternity Leave',
        paternity: 'Paternity Leave',
        hajj: 'Hajj Leave',
        compassionate: 'Compassionate Leave',
        unpaid: 'Unpaid Leave',
      },
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        cancelled: 'Cancelled',
      },
      leaveType: 'Leave Type',
      dates: 'Dates',
      startDate: 'Start Date',
      endDate: 'End Date',
      totalDays: 'Total Days',
      reason: 'Reason',
      reasonPlaceholder: 'Enter the reason for your leave request...',
      reasonRequired: 'Please enter a reason for your leave',
      invalidDates: 'End date must be after start date',
      submit: 'Submit Request',
      success: 'Success',
      error: 'Error',
      requestSubmitted: 'Your leave request has been submitted',
      pendingApprovals: 'Pending Approvals',
      requestsPending: 'requests pending',
      confirmApprove: 'Approve Request',
      confirmApproveMessage: 'Are you sure you want to approve this leave request?',
      confirmReject: 'Reject Request',
      enterRejectionReason: 'Please enter a reason for rejection',
      requestApproved: 'Leave request has been approved',
      requestRejected: 'Leave request has been rejected',
      allCaughtUp: 'All Caught Up!',
      noPendingApprovals: 'No pending leave requests to approve',
    },
    payroll: {
      currentMonth: 'Current Month',
      gross: 'Gross',
      deductions: 'Deductions',
      yearToDate: 'Year to Date',
      grossPay: 'Gross Pay',
      netPay: 'Net Pay',
      tax: 'Tax',
      totalDeductions: 'Total Deductions',
      payslips: 'Payslips',
      pending: 'Pending',
      paidOn: 'Paid on',
      taxSummary: 'Tax Summary',
      salaryStructure: 'Salary Structure',
      downloadPdf: 'Download PDF',
      earnings: 'Earnings',
      notFound: 'Payslip not found',
      status: {
        draft: 'Draft',
        processed: 'Processed',
        paid: 'Paid',
        pending: 'Pending',
      },
    },
    performance: {
      currentRating: 'Current Rating',
      goals: 'Goals',
      completed: 'Completed',
      reviewDue: 'Review Due',
      myGoals: 'My Goals',
      addGoal: 'Add Goal',
      upcomingReviews: 'Upcoming Reviews',
      status: {
        not_started: 'Not Started',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },
    profile: {
      employeeId: 'Employee ID',
      email: 'Email',
      department: 'Department',
      designation: 'Designation',
      role: 'Role',
      editProfile: 'Edit Profile',
      details: 'Profile Details',
      changePassword: 'Change Password',
      documents: 'My Documents',
    },
    settings: {
      account: 'Account',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      work: 'Work',
      performance: 'Performance',
      documents: 'Documents',
      myTeam: 'My Team',
      preferences: 'Preferences',
      language: 'Language',
      appearance: 'Appearance',
      support: 'Support',
      help: 'Help & FAQ',
      about: 'About',
      feedback: 'Send Feedback',
      logout: 'Logout',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      pushNotifications: 'Push Notifications',
      emailNotifications: 'Email Notifications',
      biometricLogin: 'Biometric Login',
    },
    notifications: {
      markAllRead: 'Mark All as Read',
      noNotifications: 'No notifications',
    },
  },
};

// Arabic translations
const ar = {
  translation: {
    common: {
      days: 'أيام',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      viewAll: 'عرض الكل',
      share: 'مشاركة',
      approve: 'موافقة',
      reject: 'رفض',
      loading: 'جاري التحميل...',
    },
    navigation: {
      dashboard: 'لوحة التحكم',
      attendance: 'الحضور',
      leave: 'الإجازات',
      payroll: 'الرواتب',
      more: 'المزيد',
    },
    auth: {
      tagline: 'رفيقك في الموارد البشرية',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      login: 'تسجيل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginWithBiometric: 'تسجيل الدخول بالبصمة',
    },
    dashboard: {
      todayStatus: 'حالة اليوم',
      quickActions: 'إجراءات سريعة',
      applyLeave: 'طلب إجازة',
      viewPayslip: 'عرض كشف الراتب',
      attendance: 'الحضور',
      myTeam: 'فريقي',
      leaveBalances: 'رصيد الإجازات',
      upcoming: 'القادم',
    },
    attendance: {
      checkIn: 'تسجيل الحضور',
      checkOut: 'تسجيل الانصراف',
      workHours: 'ساعات العمل',
      todayRecord: 'سجل اليوم',
      monthlySummary: 'ملخص الشهر',
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      onLeave: 'في إجازة',
    },
    leave: {
      applyLeave: 'طلب إجازة',
      balances: 'رصيد الإجازات',
      types: {
        annual: 'إجازة سنوية',
        sick: 'إجازة مرضية',
        emergency: 'إجازة طارئة',
        unpaid: 'إجازة بدون راتب',
      },
    },
    payroll: {
      currentMonth: 'الشهر الحالي',
      netPay: 'صافي الراتب',
      grossPay: 'إجمالي الراتب',
      deductions: 'الاستقطاعات',
    },
  },
};

// Hindi translations
const hi = {
  translation: {
    common: {
      days: 'दिन',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      save: 'सहेजें',
      viewAll: 'सभी देखें',
    },
    navigation: {
      dashboard: 'डैशबोर्ड',
      attendance: 'उपस्थिति',
      leave: 'छुट्टी',
      payroll: 'वेतन',
      more: 'और',
    },
    auth: {
      tagline: 'आपका HR साथी',
      email: 'ईमेल',
      password: 'पासवर्ड',
      login: 'लॉगिन',
    },
    attendance: {
      checkIn: 'चेक इन',
      checkOut: 'चेक आउट',
      present: 'उपस्थित',
      absent: 'अनुपस्थित',
    },
    leave: {
      applyLeave: 'छुट्टी के लिए आवेदन करें',
      types: {
        annual: 'वार्षिक छुट्टी',
        sick: 'बीमारी की छुट्टी',
      },
    },
  },
};

// Language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLang = await AsyncStorage.getItem('app_language');
      if (storedLang) {
        callback(storedLang);
        return;
      }
      callback('en');
    } catch {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('app_language', lng);
      // Handle RTL for Arabic
      I18nManager.forceRTL(lng === 'ar');
    } catch (error) {
      console.error('Failed to cache language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en,
      ar,
      hi,
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
