import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getCached, setCache } from '../services/cache';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

function getLetterGrade(gpa) {
  if (gpa >= 3.6) return 'A';
  if (gpa >= 3.2) return 'A-';
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

export default function GradesScreen() {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [gradesData, setGradesData] = useState({ cumulativeGpa: 0, grades: [] });
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

  const { cumulativeGpa, grades } = gradesData;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Bảng Điểm</Text>

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
        {grades.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Chưa có điểm
            </Text>
          </View>
        ) : (
          grades.map((item) => {
            const grade = item.grade;
            const hasGrade = grade && grade.finalScore != null;

            return (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
                      {item.section?.subject?.name || ''}
                    </Text>
                    <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                      {item.section?.subject?.code} — {item.section?.code} — {item.section?.subject?.credits} TC
                    </Text>
                  </View>
                  {hasGrade && (
                    <View style={[styles.letterBadge, { backgroundColor: getGradeColor(grade.gpaPoint, colors) + '20' }]}>
                      <Text style={[styles.letterText, { color: getGradeColor(grade.gpaPoint, colors) }]}>
                        {getLetterGrade(grade.gpaPoint)}
                      </Text>
                    </View>
                  )}
                </View>

                {hasGrade ? (
                  <>
                    {grade.components && grade.components.length > 0 && (
                      <View style={[styles.componentsList, { borderTopColor: colors.border }]}>
                        {grade.components.map((comp) => (
                          <View key={comp.id} style={styles.componentRow}>
                            <Text style={[styles.componentName, { color: colors.textSecondary }]}>
                              {comp.name} ({(comp.weight * 100).toFixed(0)}%)
                            </Text>
                            <Text style={[styles.componentScore, { color: colors.text }]}>
                              {comp.score.toFixed(1)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                      <Text style={[styles.totalLabel, { color: colors.text }]}>Điểm tổng</Text>
                      <Text style={[styles.totalScore, { color: colors.primary }]}>
                        {grade.finalScore.toFixed(1)} / {grade.gpaPoint.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              grade.status === 'SUBMITTED'
                                ? colors.success + '20'
                                : colors.warning + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                grade.status === 'SUBMITTED' ? colors.success : colors.warning,
                            },
                          ]}
                        >
                          {grade.status === 'SUBMITTED' ? 'Đã nộp' : 'Nháp'}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={[styles.noGrade, { color: colors.textTertiary }]}>
                    Chưa có điểm
                  </Text>
                )}
              </View>
            );
          })
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
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
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
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  subjectCode: {
    fontSize: FontSize.xs,
  },
  letterBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  letterText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  componentsList: {
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  componentName: {
    fontSize: FontSize.sm,
  },
  componentScore: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  totalScore: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  statusRow: {
    marginTop: Spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  noGrade: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginTop: Spacing.md,
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
