import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { emailAPI } from '../../services/api';

const EmailSubscriptionScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSubscriptions();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      const filtered = subscriptions.filter(item =>
        item.email?.toLowerCase().includes(search) ||
        item.area?.name?.toLowerCase().includes(search)
      );
      setFilteredSubscriptions(filtered);
    } else {
      setFilteredSubscriptions(subscriptions);
    }
  }, [subscriptions, searchText]);

  const loadSubscriptions = async () => {
    try {
      const response = await emailAPI.getAll(1000, 0);
      if (response.data && response.data.subscriptions) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Xác nhận xóa',
      `Xóa đăng ký của ${item.email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await emailAPI.delete(item.id);
              Alert.alert('Thành công', 'Đã xóa đăng ký');
              loadSubscriptions();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa đăng ký');
            }
          },
        },
      ]
    );
  };

  const handleSendTest = (item) => {
    Alert.alert(
      'Gửi email test',
      `Gửi email test đến ${item.email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: async () => {
            try {
              await emailAPI.sendTest(item.email);
              Alert.alert('Thành công', 'Đã gửi email test');
            } catch (error) {
              Alert.alert('Lỗi', error.response?.data?.error || 'Không thể gửi email');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.emailInfo}>
          <Text style={styles.email}>{item.email}</Text>
          <View style={[styles.statusBadge, item.is_active ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusText}>
              {item.is_active ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.area?.name || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Đăng ký: {formatDate(item.created_at)}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSendTest(item)}
        >
          <Icon name="mail-outline" size={18} color="#2E86AB" />
          <Text style={styles.actionButtonText}>Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditEmailSubscription', { subscription: item })}
        >
          <Icon name="create-outline" size={18} color="#f39c12" />
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Icon name="trash-outline" size={18} color="#e74c3c" />
          <Text style={styles.actionButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEmailSubscription')}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Thêm đăng ký</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo email hoặc khu vực..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredSubscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
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
            <Icon name="mail-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>
              {searchText ? 'Không tìm thấy kết quả' : 'Chưa có đăng ký email'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86AB',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d4edda',
  },
  statusInactive: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  },
});

export default EmailSubscriptionScreen;
