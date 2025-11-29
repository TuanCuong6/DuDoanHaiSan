import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { areasAPI } from '../../services/api';

const AreaManagementTab = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      if (response.data && response.data.areas) {
        setAreas(response.data.areas);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAreas();
  };

  const handleEdit = (area) => {
    Alert.alert('Sửa khu vực', `Chức năng sửa khu vực: ${area.name}\n(Đang phát triển)`);
  };

  const handleSendEmail = (area) => {
    Alert.alert('Gửi email', `Gửi email cho khu vực: ${area.name}\n(Đang phát triển)`);
  };

  const handleDelete = (area) => {
    Alert.alert(
      'Xóa khu vực',
      `Bạn có chắc chắn muốn xóa khu vực: ${area.name}?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Thông báo', 'Chức năng xóa đang phát triển');
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.areaDetail}>
            {item.District?.name} - {item.Province?.name}
          </Text>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                item.area_type === 'oyster'
                  ? styles.badgeOyster
                  : item.area_type === 'cobia'
                  ? styles.badgeCobia
                  : styles.badgeDefault,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.area_type === 'oyster'
                  ? 'Hàu'
                  : item.area_type === 'cobia'
                  ? 'Cá'
                  : item.area_type}
              </Text>
            </View>
            <Text style={styles.areaSize}>{item.area} ha</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>✏️ Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.emailButton]}
          onPress={() => handleSendEmail(item)}
        >
          <Text style={styles.actionButtonText}>📧 Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionButtonText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={areas}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E86AB']}
            tintColor="#2E86AB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có dữ liệu khu vực</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  areaDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeOyster: {
    backgroundColor: '#e8f5e8',
  },
  badgeCobia: {
    backgroundColor: '#e3f2fd',
  },
  badgeDefault: {
    backgroundColor: '#f5f5f5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  areaSize: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E86AB',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  emailButton: {
    backgroundColor: '#9b59b6',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AreaManagementTab;
