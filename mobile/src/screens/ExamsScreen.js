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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} — ${hours}:${mins}`;
}

function getDaysUntil(dateStr) {
  const now = new Date();
  const exam = new Date(dateStr);
  const diff = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ExamsScreen() {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [exams, setExams] = useState([]);
  const [examEligibility, setExamEligibility] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Always fetch fresh data from backend, don't use cache
      const response = await api.student.getExams();
      const examsData = response.data.exams || [];
      console.log('Exams loaded from backend:', examsData.map(e => ({ id: e.id, sectionId: e.sectionId })));
      setExams(examsData);
      await setCache('exams', examsData);

      // Load exam eligibility for each exam
      const eligibilityMap = {};
      for (const exam of examsData) {
        try {
          const eligResponse = await api.student.getExamEligibility({
            sectionId: exam.sectionId,
          });
          if (eligResponse.data) {
            eligibilityMap[exam.id] = eligResponse.data;
            console.log(`Exam ${exam.id} eligibility:`, eligResponse.data);
          }
        } catch (error) {
          console.log(`Error loading eligibility for exam ${exam.id}:`, error.message);
          // Silently fail for individual eligibility checks
        }
      }
      console.log('All eligibilities loaded:', eligibilityMap);
      setExamEligibility(eligibilityMap);
      await setCache('exam-eligibility', eligibilityMap);
    } catch (error) {
      console.log('Error loading exams:', error);
      const cached = await getCached('exams');
      if (cached) setExams(cached);
      const cachedEligibility = await getCached('exam-eligibility');
      if (cachedEligibility) setExamEligibility(cachedEligibility);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Lịch Thi</Text>
        <Text style={styles.headerSubtitle}>{exams.length} kỳ thi</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {exams.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Chưa có lịch thi
            </Text>
          </View>
        ) : (
          exams.map((exam) => {
            const daysUntil = getDaysUntil(exam.examDate);
            const isPast = daysUntil < 0;
            const isUrgent = daysUntil >= 0 && daysUntil <= 3;
            const eligibility = examEligibility[exam.id];
            const isNotEligible = eligibility && eligibility.isEligible === false;

            return (
              <View
                key={exam.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                    borderLeftColor: isNotEligible
                      ? colors.error
                      : isPast
                        ? colors.textTertiary
                        : isUrgent
                          ? colors.error
                          : colors.accent,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
                    {exam.section?.subject?.name || ''}
                  </Text>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: isNotEligible
                          ? colors.error + '20'
                          : isPast
                            ? colors.surfaceSecondary
                            : isUrgent
                              ? colors.error + '20'
                              : colors.accent + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        {
                          color: isNotEligible
                            ? colors.error
                            : isPast
                              ? colors.textTertiary
                              : isUrgent
                                ? colors.error
                                : colors.accent,
                        },
                      ]}
                    >
                      {isNotEligible ? 'Không đủ điều kiện' : exam.type}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                  {exam.section?.subject?.code || ''} — {exam.section?.code || ''}
                </Text>

                {isNotEligible && eligibility && (
                  <View style={[styles.warningBox, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={[styles.warningTitle, { color: colors.error }]}>
                        Vắng quá {eligibility.absenceThreshold ?? 20}%
                      </Text>
                      <Text style={[styles.warningText, { color: colors.error }]}>
                        Tỉ lệ vắng: {eligibility.absenceRate ?? 0}% (Ngưỡng: {eligibility.absenceThreshold ?? 20}%)
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.accent} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {formatDate(exam.examDate)}
                  </Text>
                </View>

                {exam.room && (
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.accent} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {exam.room}
                    </Text>
                  </View>
                )}

                {!isPast && !isNotEligible && (
                  <Text
                    style={[
                      styles.countdown,
                      { color: isUrgent ? colors.error : colors.success },
                    ]}
                  >
                    {daysUntil === 0 ? 'Hôm nay!' : `Còn ${daysUntil} ngày`}
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
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
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
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  subjectName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  subjectCode: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  warningTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  warningText: {
    fontSize: FontSize.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: FontSize.sm,
  },
  countdown: {
    fontSize: FontSize.sm,
    fontWeight: '700',
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
