import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

const DAY_NAMES = ['', '', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

export default function EnrollmentScreen({ navigation }) {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [sections, setSections] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.student.getAvailableSections();
      setSections(response.data.data || []);
      setSemester(response.data.semester);
    } catch (error) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tải danh sách học phần');
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

  const handleRegister = async (sectionId) => {
    setProcessingId(sectionId);
    try {
      await api.student.registerSection({ sectionId });
      Alert.alert('Thành công', 'Đăng ký học phần thành công');
      loadData(false);
    } catch (error) {
      Alert.alert('Lỗi đăng ký', error?.response?.data?.message || 'Không thể đăng ký học phần này');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDrop = (sectionId, subjectName) => {
    Alert.alert(
      'Hủy đăng ký',
      `Bạn có chắc chắn muốn hủy đăng ký học phần ${subjectName}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy đăng ký',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(sectionId);
            try {
              await api.student.dropSection(sectionId);
              Alert.alert('Thành công', 'Đã hủy đăng ký học phần');
              loadData(false);
            } catch (error) {
              Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể hủy đăng ký');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredSections = sections.filter(s => 
    s.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSectionItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
      <View style={styles.cardHeader}>
        <View style={styles.subjectInfo}>
          <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
            {item.subject.name}
          </Text>
          <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
            {item.subject.code} — Lớp: {item.code}
          </Text>
        </View>
        <View style={[styles.creditsBadge, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.creditsText, { color: colors.accent }]}>
            {item.subject.credits} TC
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.lecturer?.user?.fullName || 'Chưa xếp GV'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Còn {item.availableSlots} / {item.capacity} chỗ
          </Text>
        </View>
      </View>

      <View style={styles.scheduleContainer}>
        {item.schedules.map((sched, idx) => (
          <View key={idx} style={styles.scheduleRow}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={[styles.scheduleText, { color: colors.textSecondary }]}>
              {DAY_NAMES[sched.dayOfWeek]}, Ca {sched.shift} ({sched.room || 'N/A'})
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {item.isEnrolled ? (
          <TouchableOpacity 
            style={[styles.dropButton, { borderColor: colors.error }]}
            onPress={() => handleDrop(item.id, item.subject.name)}
            disabled={processingId !== null}
          >
            {processingId === item.id ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{marginRight: 4}} />
                <Text style={[styles.dropButtonText, { color: colors.error }]}>Hủy đăng ký</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.registerButton, { backgroundColor: item.availableSlots > 0 ? colors.primary : colors.textTertiary }]}
            onPress={() => handleRegister(item.id)}
            disabled={processingId !== null || item.availableSlots <= 0}
          >
            {processingId === item.id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>
                {item.availableSlots > 0 ? 'Đăng ký ngay' : 'Đã hết chỗ'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng ký học phần</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          {semester
            ? `${semester.name || 'Học kỳ'}${semester.academicYear ? ` — ${typeof semester.academicYear === 'object' ? semester.academicYear.name : semester.academicYear}` : ''}`
            : 'Đang tải học kỳ...'}
        </Text>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Tìm môn học, mã môn..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={filteredSections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSectionItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                {searchQuery ? 'Không tìm thấy môn học nào' : 'Hiện không có lớp học phần nào mở'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.sm,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  subjectInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  subjectName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  creditsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  creditsText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: FontSize.xs,
  },
  scheduleContainer: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  scheduleText: {
    fontSize: 12,
  },
  actions: {
    marginTop: Spacing.xs,
  },
  registerButton: {
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  dropButton: {
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    flexDirection: 'row',
  },
  dropButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: FontSize.md,
    marginTop: Spacing.lg,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
});
