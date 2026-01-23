/**
 * Employee Directory Screen
 * Search and browse company employee directory
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore } from '@/stores/theme.store';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Sarah Johnson', position: 'Senior Engineer', department: 'Engineering', email: 'sarah.johnson@company.com', phone: '+1 555-0101', isOnline: true },
  { id: '2', name: 'Michael Chen', position: 'Product Manager', department: 'Product', email: 'michael.chen@company.com', phone: '+1 555-0102', isOnline: true },
  { id: '3', name: 'Emily Davis', position: 'UX Designer', department: 'Design', email: 'emily.davis@company.com', phone: '+1 555-0103', isOnline: false },
  { id: '4', name: 'James Wilson', position: 'Tech Lead', department: 'Engineering', email: 'james.wilson@company.com', phone: '+1 555-0104', isOnline: true },
  { id: '5', name: 'Lisa Anderson', position: 'HR Manager', department: 'Human Resources', email: 'lisa.anderson@company.com', phone: '+1 555-0105', isOnline: false },
  { id: '6', name: 'David Martinez', position: 'Sales Director', department: 'Sales', email: 'david.martinez@company.com', phone: '+1 555-0106', isOnline: true },
  { id: '7', name: 'Anna Kim', position: 'Data Analyst', department: 'Analytics', email: 'anna.kim@company.com', phone: '+1 555-0107', isOnline: false },
  { id: '8', name: 'Robert Taylor', position: 'Finance Lead', department: 'Finance', email: 'robert.taylor@company.com', phone: '+1 555-0108', isOnline: true },
  { id: '9', name: 'Jessica Brown', position: 'Marketing Specialist', department: 'Marketing', email: 'jessica.brown@company.com', phone: '+1 555-0109', isOnline: false },
  { id: '10', name: 'Thomas Lee', position: 'DevOps Engineer', department: 'Engineering', email: 'thomas.lee@company.com', phone: '+1 555-0110', isOnline: true },
];

export function Directory() {
  const { theme } = useThemeStore();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const departments = useMemo(() => {
    return [...new Set(mockEmployees.map((e) => e.department))];
  }, []);

  const filtered = useMemo(() => {
    return mockEmployees.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase());
      const matchesDept = !selectedDept || e.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [search, selectedDept]);

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const initialsColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
  const getColor = (id: string) => initialsColors[parseInt(id) % initialsColors.length];

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={[styles.employeeCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: getColor(item.id) }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.position, { color: theme.colors.textSecondary }]}>{item.position}</Text>
          <Text style={[styles.department, { color: theme.colors.primary }]}>{item.department}</Text>
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: theme.colors.primary + '15' }]}
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
        >
          <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: theme.colors.primary + '15' }]}
          onPress={() => Linking.openURL(`mailto:${item.email}`)}
        >
          <Ionicons name="mail-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search employees..."
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Department Filter */}
      <FlatList
        horizontal
        data={[null, ...departments]}
        keyExtractor={(item) => item || 'all'}
        showsHorizontalScrollIndicator={false}
        style={styles.deptFilter}
        contentContainerStyle={styles.deptContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.deptChip,
              {
                backgroundColor: selectedDept === item ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedDept(item)}
          >
            <Text style={{ fontSize: 12, fontWeight: '500', color: selectedDept === item ? '#fff' : theme.colors.text }}>
              {item || 'All'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results Count */}
      <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
        {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* Employee List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderEmployee}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchSection: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, paddingHorizontal: 12, gap: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  deptFilter: { maxHeight: 40, marginTop: 12 },
  deptContent: { paddingHorizontal: 16, gap: 6 },
  deptChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  resultCount: { fontSize: 12, paddingHorizontal: 16, paddingVertical: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  employeeCard: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  position: { fontSize: 12, marginTop: 2 },
  department: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  contactActions: { flexDirection: 'row', gap: 8 },
  contactBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});
