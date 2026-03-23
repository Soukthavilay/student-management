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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getCached, setCache } from '../services/cache';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

function formatCurrency(amount) {
  if (!amount || amount === 0) return '0';
  return amount.toLocaleString('vi-VN');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function SemesterFeeSection({ tuitionFee, config, colors, isDark, onPay }) {
  const [expanded, setExpanded] = useState(true);

  const semesterTotals = {
    amountDue: 0,
    amountPaid: 0,
    discount: 0,
    debt: 0,
    credits: 0,
  };

  tuitionFee.items.forEach((item) => {
    semesterTotals.amountDue += item.amountDue;
    semesterTotals.amountPaid += item.amountPaid;
    semesterTotals.discount += item.discount;
    semesterTotals.debt += item.debt;
    semesterTotals.credits += item.credits || 0;
  });

  const isPaid = semesterTotals.debt === 0 && semesterTotals.amountDue > 0;
  const hasDebt = semesterTotals.debt > 0;

  // Get credit price from config
  const creditPrice = config?.creditPrice || 0;

  return (
    <View style={[styles.semesterContainer, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
      <TouchableOpacity
        style={[styles.semesterHeader, { backgroundColor: isDark ? '#1A2744' : '#1E3A5F' }]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.semesterHeaderLeft}>
          <Text style={styles.semesterTitle}>
            Năm học: {tuitionFee.academicYear} - Học kỳ: {tuitionFee.semester}
          </Text>
          {creditPrice > 0 && (
            <Text style={[styles.semesterSubtitle, { color: '#93C5FD' }]}>
              Giá: {formatCurrency(creditPrice)}đ/tín chỉ
            </Text>
          )}
        </View>
        <View style={styles.semesterHeaderRight}>
          {isPaid && (
            <View style={[styles.paidBadge, { backgroundColor: '#16A34A20' }]}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={[styles.paidBadgeText, { color: '#16A34A' }]}>Đã đóng</Text>
            </View>
          )}
          {hasDebt && (
            <View style={[styles.paidBadge, { backgroundColor: '#DC262620' }]}>
              <Ionicons name="alert-circle" size={14} color="#DC2626" />
              <Text style={[styles.paidBadgeText, { color: '#DC2626' }]}>Còn nợ</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: Spacing.sm }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.semesterContent}>
          {/* Column Header */}
          <View style={[styles.tableHeader, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
            <Text style={[styles.colHeaderName, { color: colors.textSecondary }]}>Môn học</Text>
            <Text style={[styles.colHeaderSmall, { color: colors.textSecondary }]}>TC</Text>
            <Text style={[styles.colHeader, { color: colors.textSecondary }]}>Phải đóng</Text>
            <Text style={[styles.colHeader, { color: colors.textSecondary }]}>Còn nợ</Text>
          </View>

          {/* Fee Items */}
          {tuitionFee.items.map((item) => {
            const itemName = item.enrollment
              ? `${item.enrollment.section.code}-${item.enrollment.section.subject.name}`
              : item.name;

            return (
              <View
                key={item.id}
                style={[styles.feeRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.feeNameCol}>
                  <Text style={[styles.feeName, { color: colors.text }]} numberOfLines={2}>
                    {itemName}
                  </Text>
                  {item.credits > 0 && item.creditPrice > 0 && (
                    <Text style={[styles.feeCalc, { color: colors.textTertiary }]}>
                      {item.credits} tc × {formatCurrency(item.creditPrice)}đ
                    </Text>
                  )}
                  {item.paidAt && (
                    <Text style={[styles.feeDate, { color: colors.textTertiary }]}>
                      Ngày đóng: {formatDate(item.paidAt)}
                    </Text>
                  )}
                  {item.discount > 0 && (
                    <Text style={[styles.feeDiscount, { color: colors.success }]}>
                      Miễn giảm: {formatCurrency(item.discount)}đ
                    </Text>
                  )}
                </View>
                <Text style={[styles.feeSmall, { color: colors.text }]}>{item.credits || 0}</Text>
                <Text style={[styles.feeAmount, { color: colors.text }]}>
                  {formatCurrency(item.amountDue)}
                </Text>
                <Text style={[styles.feeAmount, { color: item.debt > 0 ? colors.error : colors.text }]}>
                  {formatCurrency(item.debt)}
                </Text>
              </View>
            );
          })}

          {/* Semester Totals */}
          <View style={[styles.totalRow, { backgroundColor: isDark ? '#1C1917' : '#FFF7ED' }]}>
            <Text style={[styles.totalLabel, { color: isDark ? '#FED7AA' : '#9A3412' }]}>
              Tổng ({semesterTotals.credits} tín chỉ)
            </Text>
            <Text style={[styles.totalSmall, { color: isDark ? '#FED7AA' : '#9A3412' }]}>-</Text>
            <Text style={[styles.totalAmount, { color: isDark ? '#FED7AA' : '#9A3412' }]}>
              {formatCurrency(semesterTotals.amountDue)}
            </Text>
            <Text style={[styles.totalAmount, { color: isDark ? '#FED7AA' : '#9A3412' }]}>
              {formatCurrency(semesterTotals.debt)}
            </Text>
          </View>

          {/* Pay Button */}
          {hasDebt && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => onPay(tuitionFee.id, semesterTotals.debt)}
            >
              <Ionicons name="card-outline" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Thanh toán {formatCurrency(semesterTotals.debt)} đ qua VNPay
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function TuitionScreen({ navigation }) {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [data, setData] = useState({ tuitionFees: [], totals: { amountDue: 0, amountPaid: 0, discount: 0, debt: 0 }, configs: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.student.getTuitionFees();
      setData(response.data);
      await setCache('tuitionFees', response.data);
    } catch {
      const cached = await getCached('tuitionFees');
      if (cached) setData(cached);
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

  const handlePay = async (tuitionFeeId, amount) => {
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn muốn thanh toán ${formatCurrency(amount)} đ qua VNPay?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Thanh toán',
          onPress: async () => {
            try {
              const res = await api.student.createPayment({ tuitionFeeId, amount });
              const paymentUrl = res.data?.data?.paymentUrl;
              if (paymentUrl) {
                await Linking.openURL(paymentUrl);
              } else {
                Alert.alert('Lỗi', 'Không thể tạo link thanh toán');
              }
            } catch (err) {
              const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết học phí</Text>
          <View style={styles.backButton} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const { tuitionFees, totals, configs } = data;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết học phí</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Grand Total Card */}
        <View style={[styles.grandTotalCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.grandTotalTitle, { color: colors.text }]}>Tổng học phí</Text>
          <View style={styles.grandTotalGrid}>
            <View style={styles.grandTotalItem}>
              <Text style={[styles.grandTotalLabel, { color: colors.textSecondary }]}>Phải đóng</Text>
              <Text style={[styles.grandTotalValue, { color: colors.text }]}>
                {formatCurrency(totals.amountDue)} đ
              </Text>
            </View>
            <View style={styles.grandTotalItem}>
              <Text style={[styles.grandTotalLabel, { color: colors.textSecondary }]}>Đã đóng</Text>
              <Text style={[styles.grandTotalValue, { color: colors.success }]}>
                {formatCurrency(totals.amountPaid)} đ
              </Text>
            </View>
            <View style={styles.grandTotalItem}>
              <Text style={[styles.grandTotalLabel, { color: colors.textSecondary }]}>Miễn giảm</Text>
              <Text style={[styles.grandTotalValue, { color: colors.accent }]}>
                {formatCurrency(totals.discount)} đ
              </Text>
            </View>
            <View style={styles.grandTotalItem}>
              <Text style={[styles.grandTotalLabel, { color: colors.textSecondary }]}>Còn nợ</Text>
              <Text style={[styles.grandTotalValue, { color: totals.debt > 0 ? colors.error : colors.success }]}>
                {formatCurrency(totals.debt)} đ
              </Text>
            </View>
          </View>
        </View>

        {/* Semester Fee Sections */}
        {tuitionFees.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              Chưa có thông tin học phí
            </Text>
          </View>
        ) : (
          tuitionFees.map((tf) => {
            const config = configs.find(c => c.academicYear === tf.academicYear && c.semester === tf.semester);
            return (
              <SemesterFeeSection
                key={tf.id}
                tuitionFee={tf}
                config={config}
                colors={colors}
                isDark={isDark}
                onPay={handlePay}
              />
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
  grandTotalCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  grandTotalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  grandTotalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  grandTotalItem: {
    width: '48%',
    paddingVertical: Spacing.sm,
  },
  grandTotalLabel: {
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  grandTotalValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
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
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  semesterSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  paidBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  semesterContent: {},
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  colHeaderName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  colHeaderSmall: {
    width: 30,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  colHeader: {
    width: 70,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  feeNameCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  feeName: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  feeCalc: {
    fontSize: 10,
    marginTop: 1,
  },
  feeDate: {
    fontSize: 10,
    marginTop: 2,
  },
  feeDiscount: {
    fontSize: 10,
    marginTop: 1,
  },
  feeSmall: {
    width: 30,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  feeAmount: {
    width: 70,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  totalLabel: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  totalSmall: {
    width: 30,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  totalAmount: {
    width: 70,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'right',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#1E3A5F',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
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
});
