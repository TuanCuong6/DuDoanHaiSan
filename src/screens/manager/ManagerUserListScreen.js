import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usersAPI, areasAPI } from '../../services/api';
import { storage } from '../../services/storage';

const ManagerUserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [userProvince, setUserProvince] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    const initData = async () => {
      await loadUserProvince();
      loadProvinces();
      loadDistricts();
    };
    initData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userProvince) {
        loadUsers();
      }
    }, [userProvince])
  );

  useEffect(() => {
    if (userProvince && !loading) {
      const timer = setTimeout(() => {
        loadUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchText]);

  const loadUserProvince = async () => {
    try {
      const userInfo = await storage.getUserInfo();
      if (userInfo?.province) {
        setUserProvince(userInfo.province);
      }
    } catch (error) {
      console.error('Error loading user province:', error);
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await areasAPI.getProvinces();
      if (response.data) {
        setProvinces(response.data);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadDistricts = async () => {
    try {
      const response = await areasAPI.getDistricts();
      if (response.data) {
        setDistricts(response.data);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadUsers = async (isLoadMore = false) => {
    if (isLoadMore && !hasMore) return;

    try {
      const currentOffset = isLoadMore ? offset : 0;
      const response = await usersAPI.getPaginated({
        search: searchText,
        role: 'manager',
        province: userProvince,
        limit,
        offset: currentOffset,
      });

      if (response.data) {
        const newUsers = response.data.users || [];
        
        if (isLoadMore) {
          setUsers([...users, ...newUsers]);
          setOffset(currentOffset + newUsers.length);
        } else {
          setUsers(newUsers);
          setOffset(newUsers.length);
        }
        
        setHasMore(newUsers.length === limit);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    setHasMore(true);
    loadUsers(false);
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action} người dùng ${user.username}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              if (user.status === 'active') {
                await usersAPI.deactivate(user.id);
              } else {
                await usersAPI.activate(user.id);
              }
              Alert.alert('Thành công', `Đã ${action} người dùng`);
              loadUsers();
            } catch (error) {
              Alert.alert('Lỗi', `Không thể ${action} người dùng`);
            }
          },
        },
      ]
    );
  };

  const getProvinceName = (provinceId) => {
    const province = provinces.find(p => p.id === provinceId);
    return province?.name || provinceId;
  };

  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.id === districtId);
    return district?.name || districtId;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'active' ? '#27ae60' : '#e74c3c' },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.login_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="mail-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="call-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {getDistrictName(item.district)}, {getProvinceName(item.province)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ManagerEditUser', { user: item })}
        >
          <Icon name="create-outline" size={20} color="#2E86AB" />
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={() => handleToggleStatus(item)}
        >
          <Icon
            name={item.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
            size={20}
            color={item.status === 'active' ? '#e74c3c' : '#27ae60'}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: item.status === 'active' ? '#e74c3c' : '#27ae60' },
            ]}
          >
            {item.status === 'active' ? 'Vô hiệu' : 'Kích hoạt'}
          </Text>
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ManagerAddUser')}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Thêm người dùng</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email..."
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
        data={users}
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
            <Icon name="people-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>
              {searchText ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </Text>
          </View>
        }
      />


    </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    padding: 16,
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
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  cardFooter: {
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
  actionButtonDanger: {
    borderLeftWidth: 1,
    borderLeftColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E86AB',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86AB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ManagerUserListScreen;
