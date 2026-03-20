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

function getLetterGrade(gpa) {
  if (gpa >= 3.6) return 'A+';
  if (gpa >= 3.2) return 'A';
  if (gpa >= 2.5) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

function getGradeColor(gpa, colors) {
  if (gpa >= 3.2) return colors.success;
  if (gpa >= 2.0) return colors.warning;
  return colors.error;
}

function getStatusText(status, enrollment) {
  if (!enrollment) return 'Chưa đăng ký';
  if (!enrollment.grade) return 'Đang học';
  if (enrollment.grade.status === 'PASSED' || enrollment.grade.gpaPoint >= 1.0) return 'Đạt';
  if (enrollment.grade.status === 'FAILED' || enrollment.grade.gpaPoint < 1.0) return 'Không đạt';
  return 'Đang học';
}

function getStatusColor(status, enrollment, colors) {
  if (!enrollment) return colors.textTertiary;
  if (!enrollment.grade) return colors.info || colors.primary;
  if (enrollment.grade.status === 'PASSED' || enrollment.grade.gpaPoint >= 1.0) return colors.success;
  if (enrollment.grade.status === 'FAILED' || enrollment.grade.gpaPoint < 1.0) return colors.error;
  return colors.warning;
}

function SemesterSection({ semester, curriculumSubjects, enrollments, colors, isDark }) {
  const [expanded, setExpanded] = useState(true);

  // Match curriculum subjects with enrollments
  const semesterItems = curriculumSubjects.map(cs => {
    const enrollment = enrollments.find(e => e.section?.subject?.id === cs.subject.id);
    return {
      curriculumSubject: cs,
      enrollment: enrollment || null,
    };
  });

  const enrolledCount = semesterItems.filter(item => item.enrollment).length;
  const totalCredits = semesterItems
    .filter(item => item.enrollment)
    .reduce((sum, item) => sum + (item.enrollment.section?.subject?.credits || 0), 0);

  const gradedItems = semesterItems.filter(item => item.enrollment?.grade?.gpaPoint != null);
  const semesterGPA = gradedItems.length > 0
    ? (gradedItems.reduce((sum, item) => sum + item.enrollment.grade.gpaPoint * (item.enrollment.section?.subject?.credits || 0), 0) /
       gradedItems.reduce((sum, item) => sum + (item.enrollment.section?.subject?.credits || 0), 0))
    : null;

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
          <Text style={[styles.semesterSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {enrolledCount}/{curriculumSubjects.length} môn • {totalCredits} tín chỉ
          </Text>
        </View>
        <View style={styles.semesterHeaderRight}>
          {semesterGPA !== null && (
            <View style={[styles.gpaBadge, { backgroundColor: getGradeColor(semesterGPA, colors) + '20' }]}>
              <Text style={[styles.gpaBadgeText, { color: getGradeColor(semesterGPA, colors) }]}>
                GPA {semesterGPA.toFixed(2)}
              </Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
            style={{ marginLeft: Spacing.sm }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.semesterContent}>
          {semesterItems.map(({ curriculumSubject, enrollment }) => {
            const hasGrade = enrollment?.grade?.finalScore != null;
            const statusText = getStatusText(null, enrollment);
            const statusColor = getStatusColor(null, enrollment, colors);

            return (
              <View
                key={curriculumSubject.subject.id}
                style={[styles.subjectRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={1}>
                    {curriculumSubject.subject.name}
                  </Text>
                  <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                    {curriculumSubject.subject.code} • {curriculumSubject.subject.credits} TC
                    {enrollment ? ` • ${enrollment.section?.code}` : ''}
                  </Text>
                </View>

                <View style={styles.gradeInfo}>
                  {hasGrade ? (
                    <>
                      <View style={[styles.letterBadge, { backgroundColor: getGradeColor(enrollment.grade.gpaPoint, colors) + '20' }]}>
                        <Text style={[styles.letterText, { color: getGradeColor(enrollment.grade.gpaPoint, colors) }]}>
                          {getLetterGrade(enrollment.grade.gpaPoint)}
                        </Text>
                      </View>
                      <Text style={[styles.scoreText, { color: colors.text }]}>
                        {enrollment.grade.finalScore.toFixed(1)}
                      </Text>
                    </>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ExtraCoursesSection({ enrollments, colors, isDark }) {
  if (enrollments.length === 0) return null;

  return (
    <View style={[styles.semesterContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
      <View style={[styles.semesterHeader, { backgroundColor: isDark ? '#3D3D1F' : '#FEFCE8' }]}>
        <View style={styles.semesterHeaderLeft}>
          <Text style={[styles.semesterTitle, { color: isDark ? '#FEF08A' : '#854D0E' }]}>
            Môn học ngoài chương trình
          </Text>
          <Text style={[styles.semesterSubtitle, { color: isDark ? '#FDE047' : '#A16207' }]}>
            {enrollments.length} môn học
          </Text>
        </View>
      </View>

      <View style={styles.semesterContent}>
        {enrollments.map((enrollment) => {
          const grade = enrollment.grade;
          const hasGrade = grade && grade.finalScore != null;

          return (
            <View
              key={enrollment.id}
              style={[styles.subjectRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={1}>
                  {enrollment.section?.subject?.name}
                </Text>
                <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                  {enrollment.section?.subject?.code} • {enrollment.section?.subject?.credits} TC
                  {' • '}{enrollment.section?.semester} / {enrollment.section?.academicYear}
                </Text>
              </View>

              <View style={styles.gradeInfo}>
                {hasGrade ? (
                  <>
                    <View style={[styles.letterBadge, { backgroundColor: getGradeColor(grade.gpaPoint, colors) + '20' }]}>
                      <Text style={[styles.letterText, { color: getGradeColor(grade.gpaPoint, colors) }]}>
                        {getLetterGrade(grade.gpaPoint)}
                      </Text>
                    </View>
                    <Text style={[styles.scoreText, { color: colors.text }]}>
                      {grade.finalScore.toFixed(1)}
                    </Text>
                  </>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: (colors.info || colors.primary) + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: colors.info || colors.primary }]}>
                      Đang học
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function GradesScreen() {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [gradesData, setGradesData] = useState({ cumulativeGpa: 0, grades: [], curriculum: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.student.getGrades();
      setGradesData(response.data);
      await setCache('grades', response.data);
    } catch {
      const cached = await getCached('grades');
      if (cached) setGradesData(cached);
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
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const { cumulativeGpa, grades, curriculum } = gradesData;

  // Find extra enrollments not in curriculum
  const extraEnrollments = grades.filter(e => {
    if (!curriculum) return true;
    return !curriculum.subjects.some(cs => cs.subject.id === e.section?.subject?.id);
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Bảng Điểm</Text>
        {curriculum && (
          <Text style={styles.curriculumName} numberOfLines={1}>
            {curriculum.name}
          </Text>
        )}

        <View style={[styles.gpaCircle, { backgroundColor: colors.gpaCircleBg }]}>
          <Text style={[styles.gpaValue, { color: colors.gpaCircleStroke }]}>
            {cumulativeGpa.toFixed(2)}
          </Text>
          <Text style={[styles.gpaLabel, { color: colors.gpaCircleStroke }]}>GPA</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {!curriculum ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="school-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Khoa chưa có chương trình đào tạo
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Vui lòng liên hệ phòng đào tạo
            </Text>
          </View>
        ) : (
          <>
            {/* Curriculum semesters */}
            {Array.from({ length: curriculum.totalSemesters }, (_, i) => i + 1).map((semester) => {
              const semesterSubjects = curriculum.subjects.filter(cs => cs.semester === semester);
              if (semesterSubjects.length === 0) return null;

              return (
                <SemesterSection
                  key={semester}
                  semester={semester}
                  curriculumSubjects={semesterSubjects}
                  enrollments={grades}
                  colors={colors}
                  isDark={isDark}
                />
              );
            })}

            {/* Extra courses */}
            <ExtraCoursesSection
              enrollments={extraEnrollments}
              colors={colors}
              isDark={isDark}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  curriculumName: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  gpaCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpaValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  gpaLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: -2,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  semesterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  semesterTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  semesterSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  gpaBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  gpaBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
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
  gradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  letterBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  scoreText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
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
