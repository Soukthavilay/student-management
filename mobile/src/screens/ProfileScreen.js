import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

export default function ProfileScreen() {
  const { user, isDark, logout, toggleDarkMode } = useAuth();
  const navigation = useNavigation();
  const colors = isDark ? Colors.dark : Colors.light;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.student.getProfile();
      setProfile(res.data.profile);
      setPhone(res.data.profile?.student?.phone || '');
      setAddress(res.data.profile?.student?.address || '');
    } catch { /* silent */ } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const onRefresh = () => { setRefreshing(true); loadProfile(false); };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.student.updateProfile({ phone, address });
      Alert.alert('Thành công', 'Đã cập nhật thông tin');
      setEditMode(false);
      loadProfile(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally { setSaving(false); }
  };

  const handleChangePassword = () => {
    Alert.prompt('Đổi mật khẩu', 'Nhập mật khẩu hiện tại:', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Tiếp',
        onPress: (currentPassword) => {
          Alert.prompt('Đổi mật khẩu', 'Nhập mật khẩu mới (tối thiểu 6 ký tự):', [
            { text: 'Huỷ', style: 'cancel' },
            {
              text: 'Xác nhận',
              onPress: async (newPassword) => {
                if (!newPassword || newPassword.length < 6) {
                  Alert.alert('Lỗi', 'Mật khẩu mới cần ít nhất 6 ký tự');
                  return;
                }
                try {
                  await api.auth.changePassword({ currentPassword, newPassword });
                  Alert.alert('Thành công', 'Đã đổi mật khẩu');
                } catch (e) {
                  Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể đổi mật khẩu');
                }
              },
            },
          ], 'secure-text');
        },
      },
    ], 'secure-text');
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>);
  }

  const student = profile?.student;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={styles.fullName}>{profile?.fullName || ''}</Text>
          <Text style={styles.email}>{profile?.email || ''}</Text>
        </View>

        <View style={styles.content}>
          {/* Info Card */}
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin sinh viên</Text>
            <InfoRow icon="id-card-outline" label="MSSV" value={student?.studentCode} colors={colors} />
            <InfoRow icon="business-outline" label="Khoa" value={student?.department?.name} colors={colors} />
            <InfoRow icon="people-outline" label="Lớp" value={student?.classGroup?.name} colors={colors} />

            {editMode ? (
              <>
                <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Số điện thoại</Text>
                <TextInput style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]} value={phone} onChangeText={setPhone} placeholder="Nhập SĐT" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
                <Text style={[styles.editLabel, { color: colors.textSecondary }]}>Địa chỉ</Text>
                <TextInput style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]} value={address} onChangeText={setAddress} placeholder="Nhập địa chỉ" placeholderTextColor={colors.textTertiary} />
                <View style={styles.editActions}>
                  <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setEditMode(false)}>
                    <Text style={{ color: colors.textSecondary }}>Huỷ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile} disabled={saving}>
                    {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={{ color: '#FFF', fontWeight: '700' }}>Lưu</Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <InfoRow icon="call-outline" label="SĐT" value={student?.phone || '—'} colors={colors} />
                <InfoRow icon="home-outline" label="Địa chỉ" value={student?.address || '—'} colors={colors} />
                <TouchableOpacity style={[styles.editBtn, { borderColor: colors.primary }]} onPress={() => setEditMode(true)}>
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontWeight: '600', marginLeft: Spacing.sm }}>Chỉnh sửa</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Settings Card */}
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cài đặt</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color={colors.accent} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Chế độ tối</Text>
              </View>
              <Switch value={isDark} onValueChange={toggleDarkMode} trackColor={{ false: colors.border, true: colors.accent }} />
            </View>
          </View>

          {/* Curriculum Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
            onPress={() => navigation.navigate('Curriculum')}
          >
            <Ionicons name="school-outline" size={20} color={colors.accent} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Chương trình đào tạo</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Action Buttons */}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]} onPress={handleChangePassword}>
            <Ionicons name="key-outline" size={20} color={colors.accent} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.actionLabel, { color: colors.error }]}>Đăng xuất</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, colors }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={[infoStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.text }]} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB20' },
  label: { fontSize: FontSize.sm, width: 65 },
  value: { fontSize: FontSize.sm, fontWeight: '500', flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: Spacing.xxl, paddingBottom: Spacing.xxxl, borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  fullName: { fontSize: FontSize.xl, fontWeight: '700', color: '#FFF' },
  email: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.xs },
  content: { padding: Spacing.lg, marginTop: -Spacing.lg },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  editLabel: { fontSize: FontSize.sm, fontWeight: '600', marginTop: Spacing.md, marginBottom: Spacing.xs },
  editInput: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 44, fontSize: FontSize.md },
  editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, height: 44, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 1, borderRadius: BorderRadius.md, height: 44, justifyContent: 'center', alignItems: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: BorderRadius.md, height: 40, marginTop: Spacing.lg },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingLabel: { fontSize: FontSize.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  actionLabel: { flex: 1, fontSize: FontSize.md, fontWeight: '500' },
});
