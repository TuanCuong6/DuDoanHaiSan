import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usersAPI, areasAPI } from '../../services/api';
import { storage } from '../../services/storage';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    try {
      const userInfo = await storage.getUserInfo();
      if (!userInfo?.id) return;

      const [profileRes, provincesRes, districtsRes] = await Promise.all([
        usersAPI.getById(userInfo.id),
        areasAPI.getProvinces(),
        areasAPI.getDistricts(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }
      if (provincesRes.data) {
        setProvinces(provincesRes.data);
      }
      if (districtsRes.data) {
        setDistricts(districtsRes.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProvinceName = (id) => {
    return provinces.find(p => p.id === id)?.name || '-';
  };

  const getDistrictName = (id) => {
    return districts.find(d => d.id === id)?.name || '-';
  };

  const getRoleLabel = (role, district) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': 
        return district ? 'Quản lý cấp huyện' : 'Quản lý cấp tỉnh';
      case 'expert': return 'Chuyên gia';
      default: return role;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Icon name="person" size={60} color="#2E86AB" />
          </View>
          <Text style={styles.name}>{profile?.username}</Text>
          <Text style={styles.role}>{getRoleLabel(profile?.role, profile?.district)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{profile?.phone || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Địa chỉ</Text>
              <Text style={styles.infoValue}>{profile?.address || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="map-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tỉnh/Thành</Text>
              <Text style={styles.infoValue}>{getProvinceName(profile?.province)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="business-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Quận/Huyện</Text>
              <Text style={styles.infoValue}>{profile?.district ? getDistrictName(profile.district) : '-'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="shield-checkmark-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <Text style={[styles.infoValue, profile?.status === 'active' && styles.statusActive]}>
                {profile?.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditProfile', { profile, provinces, districts })}
        >
          <Icon name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cập nhật hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Icon name="key-outline" size={20} color="#2E86AB" />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Đổi mật khẩu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  avatarSection: { alignItems: 'center', padding: 32, backgroundColor: '#fff', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  role: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 8, padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  statusActive: { color: '#27ae60' },
  button: { flexDirection: 'row', backgroundColor: '#2E86AB', marginHorizontal: 16, padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  buttonSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#2E86AB' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: '#2E86AB' },
});

export default ProfileScreen;
