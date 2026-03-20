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

function SemesterSection({ semester, subjects, colors, isDark }) {
  const [expanded, setExpanded] = useState(true);

  const totalCredits = subjects.reduce((sum, cs) => sum + (cs.subject.credits || 0), 0);

  return (
    <View style={[styles.semesterContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
      <TouchableOpacity
        style={[styles.semesterHeader, { backgroundColor: isDark ? colors.card : '#F8FAFC' }]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.semesterHeaderLeft}>
          <Text style={[styles.semesterTitle, { color: colors.text }]}>
            Học kỳ {semester}
          </Text>
          <Text style={[styles.semesterSubtitle, { color: colors.textSecondary }]}>
            {subjects.length} môn học • {totalCredits} tín chỉ
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.semesterContent}>
          {subjects.map((cs) => (
            <View
              key={cs.subject.id}
              style={[styles.subjectRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
                  {cs.subject.name}
                </Text>
                <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                  {cs.subject.code} • {cs.subject.credits} tín chỉ
                </Text>
              </View>
              <Ionicons name="book-outline" size={20} color={colors.accent} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CurriculumScreen({ navigation }) {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [curriculumData, setCurriculumData] = useState({ curriculum: null, student: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Get curriculum from grades API which now includes curriculum data
      const response = await api.student.getGrades();
      setCurriculumData({
        curriculum: response.data.curriculum,
        student: response.data.student,
      });
      await setCache('curriculum', response.data.curriculum);
    } catch {
      const cached = await getCached('curriculum');
      if (cached) {
        setCurriculumData(prev => ({ ...prev, curriculum: cached }));
      }
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chương trình đào tạo</Text>
          <View style={styles.backButton} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const { curriculum } = curriculumData;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chương trình đào tạo</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {!curriculum ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="school-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              Khoa chưa có chương trình đào tạo
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Vui lòng liên hệ phòng đào tạo để biết thêm chi tiết
            </Text>
          </View>
        ) : (
          <>
            {/* Curriculum Info */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <Text style={[styles.curriculumName, { color: colors.text }]}>
                {curriculum.name}
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {curriculum.totalSemesters} học kỳ
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="book-outline" size={18} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {curriculum.subjects?.length || 0} môn học
                </Text>
              </View>
            </View>

            {/* Semester List */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Danh sách môn học
              </Text>
            </View>

            {Array.from({ length: curriculum.totalSemesters }, (_, i) => i + 1).map((semester) => {
              const semesterSubjects = curriculum.subjects?.filter(cs => cs.semester === semester) || [];
              if (semesterSubjects.length === 0) return null;

              return (
                <SemesterSection
                  key={semester}
                  semester={semester}
                  subjects={semesterSubjects}
                  colors={colors}
                  isDark={isDark}
                />
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  curriculumName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  infoText: {
    fontSize: FontSize.sm,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  semesterContainer: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  semesterHeaderLeft: {
    flex: 1,
  },
  semesterTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  semesterSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  semesterContent: {
    paddingHorizontal: Spacing.lg,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  subjectInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  subjectName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  subjectCode: {
    fontSize: FontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  emptyText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
