import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { storage } from '../services/storage';
import AreaManagementTab from './admin/AreaManagementTab';
import PredictionTab from './admin/PredictionTab';
import UserManagementTab from './admin/UserManagementTab';

const AdminDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('areas');

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await storage.removeToken();
          navigation.replace('Home');
        },
      },
    ]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'areas':
        return <AreaManagementTab />;
      case 'prediction':
        return <PredictionTab />;
      case 'users':
        return <UserManagementTab />;
      default:
        return <AreaManagementTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản trị hệ thống</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'areas' && styles.activeTab]}
          onPress={() => setActiveTab('areas')}
        >
          <Text style={[styles.tabText, activeTab === 'areas' && styles.activeTabText]}>
            📍 Quản lý khu vực
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'prediction' && styles.activeTab]}
          onPress={() => setActiveTab('prediction')}
        >
          <Text style={[styles.tabText, activeTab === 'prediction' && styles.activeTabText]}>
            📊 Dự đoán
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            👥 Quản lý người dùng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2E86AB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2E86AB',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2E86AB',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});

export default AdminDashboard;
