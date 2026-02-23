import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
}

export default function NotificationsScreen() {
  const { isDark } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = useCallback(async (pageNum = 1, showLoader = true) => {
    if (showLoader && pageNum === 1) setLoading(true);
    if (pageNum > 1) setLoadingMore(true);
    try {
      const res = await api.student.getNotifications({ page: pageNum, pageSize: 20 });
      const items = res.data.data || [];
      const pagination = res.data.pagination || {};
      if (pageNum === 1) setNotifications(items);
      else setNotifications((prev) => [...prev, ...items]);
      setHasMore(pageNum < (pagination.totalPages || 1));
      setPage(pageNum);
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false); setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(1, false); };
  const onEndReached = () => { if (!loadingMore && hasMore) loadData(page + 1, false); };

  const markAsRead = async (id) => {
    try {
      await api.student.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch { /* silent */ }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.isRead ? colors.card : colors.unreadBg, shadowColor: colors.cardShadow }]}
      activeOpacity={0.7}
      onPress={() => { if (!item.isRead) markAsRead(item.id); }}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconCircle, { backgroundColor: item.isRead ? colors.surfaceSecondary : colors.primary + '20' }]}>
          <Ionicons name={item.isRead ? 'mail-open-outline' : 'mail-outline'} size={20} color={item.isRead ? colors.textTertiary : colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.notifTitle, { color: colors.text, fontWeight: item.isRead ? '500' : '700' }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>{item.body}</Text>
          <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (<View style={[styles.unreadBadge, { backgroundColor: colors.notification }]}><Text style={styles.unreadBadgeText}>{unreadCount}</Text></View>)}
      </View>
      <FlatList
        data={notifications} renderItem={renderItem} keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={onEndReached} onEndReachedThreshold={0.3}
        ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} /><Text style={[styles.emptyText, { color: colors.textTertiary }]}>Chưa có thông báo</Text></View>}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: Spacing.lg }} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: '#FFFFFF' },
  unreadBadge: { minWidth: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.sm },
  unreadBadgeText: { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: '700' },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  notifTitle: { fontSize: FontSize.md, marginBottom: Spacing.xs },
  notifBody: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  notifTime: { fontSize: FontSize.xs },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginTop: Spacing.xs, marginLeft: Spacing.sm },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: FontSize.md, marginTop: Spacing.lg },
});
