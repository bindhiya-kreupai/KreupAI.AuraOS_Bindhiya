/**
 * Main Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useThemeStore } from '@/stores/theme.store';
import {
  MainTabParamList,
  DashboardStackParamList,
  AttendanceStackParamList,
  LeaveStackParamList,
  PayrollStackParamList,
  MoreStackParamList,
} from '@/types';

// Dashboard screens
import { DashboardHomeScreen } from '@/screens/dashboard/DashboardHomeScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';

// Attendance screens
import { AttendanceHomeScreen } from '@/screens/attendance/AttendanceHomeScreen';
import { AttendanceHistoryScreen } from '@/screens/attendance/AttendanceHistoryScreen';
import { CheckInScreen } from '@/screens/attendance/CheckInScreen';

// Leave screens
import { LeaveHomeScreen } from '@/screens/leave/LeaveHomeScreen';
import { ApplyLeaveScreen } from '@/screens/leave/ApplyLeaveScreen';
import { LeaveApprovalsScreen } from '@/screens/leave/LeaveApprovalsScreen';

// Payroll screens
import { PayrollHomeScreen } from '@/screens/payroll/PayrollHomeScreen';
import { PayslipDetailsScreen } from '@/screens/payroll/PayslipDetailsScreen';

// More screens
import { MoreHomeScreen } from '@/screens/settings/MoreHomeScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { PerformanceScreen } from '@/screens/performance/PerformanceScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const AttendanceStack = createNativeStackNavigator<AttendanceStackParamList>();
const LeaveStack = createNativeStackNavigator<LeaveStackParamList>();
const PayrollStack = createNativeStackNavigator<PayrollStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

// Dashboard Stack Navigator
function DashboardNavigator() {
  const { theme } = useThemeStore();

  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <DashboardStack.Screen
        name="DashboardHome"
        component={DashboardHomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <DashboardStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </DashboardStack.Navigator>
  );
}

// Attendance Stack Navigator
function AttendanceNavigator() {
  const { theme } = useThemeStore();

  return (
    <AttendanceStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <AttendanceStack.Screen
        name="AttendanceHome"
        component={AttendanceHomeScreen}
        options={{ title: 'Attendance' }}
      />
      <AttendanceStack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{ title: 'History' }}
      />
      <AttendanceStack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ title: 'Check In/Out' }}
      />
    </AttendanceStack.Navigator>
  );
}

// Leave Stack Navigator
function LeaveNavigator() {
  const { theme } = useThemeStore();

  return (
    <LeaveStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <LeaveStack.Screen
        name="LeaveHome"
        component={LeaveHomeScreen}
        options={{ title: 'Leave' }}
      />
      <LeaveStack.Screen
        name="ApplyLeave"
        component={ApplyLeaveScreen}
        options={{ title: 'Apply Leave' }}
      />
      <LeaveStack.Screen
        name="LeaveApprovals"
        component={LeaveApprovalsScreen}
        options={{ title: 'Approvals' }}
      />
    </LeaveStack.Navigator>
  );
}

// Payroll Stack Navigator
function PayrollNavigator() {
  const { theme } = useThemeStore();

  return (
    <PayrollStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <PayrollStack.Screen
        name="PayrollHome"
        component={PayrollHomeScreen}
        options={{ title: 'Payroll' }}
      />
      <PayrollStack.Screen
        name="PayslipDetails"
        component={PayslipDetailsScreen}
        options={{ title: 'Payslip' }}
      />
    </PayrollStack.Navigator>
  );
}

// More Stack Navigator
function MoreNavigator() {
  const { theme } = useThemeStore();

  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <MoreStack.Screen
        name="MoreHome"
        component={MoreHomeScreen}
        options={{ title: 'More' }}
      />
      <MoreStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <MoreStack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{ title: 'Performance' }}
      />
      <MoreStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </MoreStack.Navigator>
  );
}

export function MainNavigator() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Leave':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Payroll':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{ tabBarLabel: t('navigation.dashboard') }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceNavigator}
        options={{ tabBarLabel: t('navigation.attendance') }}
      />
      <Tab.Screen
        name="Leave"
        component={LeaveNavigator}
        options={{ tabBarLabel: t('navigation.leave') }}
      />
      <Tab.Screen
        name="Payroll"
        component={PayrollNavigator}
        options={{ tabBarLabel: t('navigation.payroll') }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{ tabBarLabel: t('navigation.more') }}
      />
    </Tab.Navigator>
  );
}
