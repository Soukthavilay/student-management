import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getCached, setCache } from '../services/cache';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

const DAY_NAMES = ['', '', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

export default function TimetableScreen({ navigation }) {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.student.getTimetable();
      setTimetable(response.data.timetable || []);
      await setCache('timetable', response.data.timetable);
    } catch {
      const cached = await getCached('timetable');
      if (cached) setTimetable(cached);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // Group schedules by dayOfWeek
  const groupedByDay = {};
  timetable.forEach((section) => {
    (section.schedules || []).forEach((schedule) => {
      const day = schedule.dayOfWeek;
      if (!groupedByDay[day]) groupedByDay[day] = [];
      groupedByDay[day].push({
        ...schedule,
        subjectName: section.subject?.name || '',
        subjectCode: section.subject?.code || '',
        sectionCode: section.code,
        lecturers: section.lecturers || [],
      });
    });
  });

  const sortedDays = Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const semesterLabel = () => {
    if (timetable.length === 0) return 'Không có dữ liệu';
    const first = timetable[0];
    const semesterName = typeof first.semester === 'object' ? first.semester?.name : first.semester;
    const academicYear = typeof first.academicYear === 'object' ? first.academicYear?.name : first.academicYear;
    return `${semesterName || 'Học kỳ'}${academicYear ? ` — ${academicYear}` : ''}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Thời khóa biểu</Text>
          <TouchableOpacity style={styles.enrollButton} onPress={() => navigation.navigate('Enrollment')}>
            <Ionicons name="add-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.enrollButtonText}>Đăng ký HP</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {semesterLabel()}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {sortedDays.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Chưa có lịch học
            </Text>
          </View>
        ) : (
          sortedDays.map((day) => (
            <View key={day} style={styles.daySection}>
              <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.dayBadgeText}>{DAY_NAMES[day] || `Ngày ${day}`}</Text>
              </View>
              {groupedByDay[day]
                .sort((a, b) => {
                  const shiftDiff = (a.shift ?? 99) - (b.shift ?? 99);
                  if (shiftDiff !== 0) return shiftDiff;
                  return (a.startTime || '').localeCompare(b.startTime || '');
                })
                .map((item, idx) => (
                  <View
                    key={idx}
                    style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                  >
                    <View style={styles.timeColumn}>
                      <Text style={[styles.timeText, { color: colors.primary }]}>
                        {item.startTime}
                      </Text>
                      <View style={[styles.timeDivider, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                        {item.endTime}
                      </Text>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
                        {item.subjectName}
                      </Text>
                      <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                        {item.subjectCode} — {item.sectionCode}
                      </Text>
                      {item.room && (
                        <View style={styles.metaRow}>
                          <Ionicons name="location-outline" size={14} color={colors.accent} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.room}
                          </Text>
                        </View>
                      )}
                      {item.lecturers.length > 0 && (
                        <View style={styles.metaRow}>
                          <Ionicons name="person-outline" size={14} color={colors.accent} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.lecturers.join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f6eed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  daySection: {
    marginBottom: Spacing.xl,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  timeColumn: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    width: 50,
  },
  timeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  timeDivider: {
    width: 2,
    height: 16,
    borderRadius: 1,
    marginVertical: Spacing.xs,
  },
  infoColumn: {
    flex: 1,
  },
  subjectName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  subjectCode: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: FontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: FontSize.md,
    marginTop: Spacing.lg,
  },
});
