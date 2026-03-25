import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.student.getExams();
      const examsData = response.data.exams || [];
      console.log('Exams loaded:', examsData.map(e => ({ 
        id: e.id, 
        isRegistered: e.isRegistered,
        isEligible: e.eligibility?.isEligible 
      })));
      setExams(examsData);
      await setCache('exams', examsData);
    } catch (error) {
      console.log('Error loading exams:', error);
      const cached = await getCached('exams');
      if (cached) setExams(cached);
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

  const handleRegisterExam = async (exam) => {
    if (!exam.eligibility?.isEligible) {
      Alert.alert(
        'Không đủ điều kiện',
        `Bạn không đủ điều kiện dự thi. Tỉ lệ vắng: ${exam.eligibility?.absenceRate ?? 0}% (Ngưỡng: ${exam.eligibility?.absenceThreshold ?? 20}%)`
      );
      return;
    }

    Alert.alert(
      'Xác nhận đăng ký thi',
      `Bạn muốn đăng ký thi môn ${exam.section?.subject?.name}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng ký',
          onPress: async () => {
            setRegisteringId(exam.id);
            try {
              await api.student.registerExam({ examId: exam.id });
              Alert.alert('Thành công', 'Đăng ký thi thành công!');
              loadData(false);
            } catch (error) {
              const message = error.response?.data?.message || 'Không thể đăng ký thi';
              Alert.alert('Lỗi', message);
            } finally {
              setRegisteringId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const registeredCount = exams.filter(e => e.isRegistered).length;
  const availableCount = exams.filter(e => !e.isRegistered && e.eligibility?.isEligible).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Lịch Thi</Text>
        <Text style={styles.headerSubtitle}>
          {exams.length} kỳ thi | {registeredCount} đã đăng ký | {availableCount} có thể đăng ký
        </Text>
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
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Bạn cần đăng ký học phần trước để có lịch thi
            </Text>
          </View>
        ) : (
          exams.map((exam) => {
            const daysUntil = getDaysUntil(exam.examDate);
            const isPast = daysUntil < 0;
            const isUrgent = daysUntil >= 0 && daysUntil <= 3;
            const isEligible = exam.eligibility?.isEligible;
            const isRegistered = exam.isRegistered;
            const isRegistering = registeringId === exam.id;

            // DEBUG
            console.log(`Exam ${exam.id} (${exam.section?.subject?.name}): daysUntil=${daysUntil}, isPast=${isPast}, isEligible=${isEligible}, isRegistered=${isRegistered}`);

            let borderColor = colors.accent;
            let badgeBg = colors.accent + '20';
            let badgeText = colors.accent;
            let statusText = exam.type;

            if (isRegistered) {
              borderColor = colors.success;
              badgeBg = colors.success + '20';
              badgeText = colors.success;
              statusText = 'Đã đăng ký';
            } else if (!isEligible) {
              borderColor = colors.error;
              badgeBg = colors.error + '20';
              badgeText = colors.error;
              statusText = 'Không đủ điều kiện';
            } else if (isPast) {
              borderColor = colors.textTertiary;
              badgeBg = colors.surfaceSecondary;
              badgeText = colors.textTertiary;
            } else if (isUrgent) {
              borderColor = colors.error;
              badgeBg = colors.error + '20';
              badgeText = colors.error;
            }

            return (
              <View
                key={exam.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.cardShadow,
                    borderLeftColor: borderColor,
                    opacity: isPast ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
                    {exam.section?.subject?.name || ''}
                  </Text>
                  <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.typeBadgeText, { color: badgeText }]}>
                      {statusText}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                  {exam.section?.subject?.code || ''} — {exam.section?.code || ''}
                </Text>

                {!isEligible && !isRegistered && (
                  <View style={[styles.warningBox, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={[styles.warningTitle, { color: colors.error }]}>
                        Không đủ điều kiện dự thi
                      </Text>
                      <Text style={[styles.warningText, { color: colors.error }]}>
                        Tỉ lệ vắng: {exam.eligibility?.absenceRate ?? 0}% (Ngưỡng: {exam.eligibility?.absenceThreshold ?? 20}%)
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
                      Phòng: {exam.room}
                    </Text>
                  </View>
                )}

                {isRegistered && exam.registration && (
                  <View style={styles.metaRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.metaText, { color: colors.success }]}>
                      Đăng ký ngày: {new Date(exam.registration.registrationDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                )}

                {!isRegistered && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => handleRegisterExam(exam)}
                      disabled={!isEligible || isRegistering}
                      style={[
                        styles.registerButton,
                        {
                          backgroundColor: isEligible ? colors.primary : colors.surfaceSecondary,
                          opacity: isEligible && !isRegistering ? 1 : 0.5,
                        },
                      ]}
                    >
                      {isRegistering ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                          <Text style={styles.registerButtonText}>Đăng ký thi</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {!isPast && (
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
  emptySubtext: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  registeredText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  countdown: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
