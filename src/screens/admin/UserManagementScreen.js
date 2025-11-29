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
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usersAPI, areasAPI } from '../../services/api';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const [usersRes, provincesRes, districtsRes] = await Promise.all([
        usersAPI.getAll(),
        areasAPI.getProvinces(),
        areasAPI.getDistricts(),
      ]);
      
      if (usersRes.data && usersRes.data.data) {
        setUsers(usersRes.data.data);
        setFilteredUsers(usersRes.data.data);
      }
      if (provincesRes.data) {
        setProvinces(provincesRes.data);
      }
      if (districtsRes.data) {
        setDistricts(districtsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (search, role) => {
    let filtered = users;

    // Lọc theo tên
    if (search.trim() !== '') {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Lọc theo vai trò
    if (role !== 'all') {
      if (role === 'province_manager') {
        // Quản lý cấp tỉnh: role = manager và district = null
        filtered = filtered.filter(user => user.role === 'manager' && !user.district);
      } else if (role === 'district_manager') {
        // Quản lý cấp huyện: role = manager và có district
        filtered = filtered.filter(user => user.role === 'manager' && user.district);
      } else {
        filtered = filtered.filter(user => user.role === role);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(text, selectedRole);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
    applyFilters(searchQuery, role);
  };

  const clearSearch = () => {
    setSearchQuery('');
    applyFilters('', selectedRole);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = (user) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa người dùng: ${user.username}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersAPI.delete(user.id);
              Alert.alert('Thành công', 'Xóa người dùng thành công');
              loadData();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa người dùng');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.status === 'active') {
        await usersAPI.deactivate(user.id);
        Alert.alert('Thành công', 'Vô hiệu hóa người dùng thành công');
      } else {
        await usersAPI.activate(user.id);
        Alert.alert('Thành công', 'Kích hoạt người dùng thành công');
      }
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
    }
  };

  const getProvinceName = (provinceId) => {
    const province = provinces.find(p => p.id === provinceId);
    return province?.name || '-';
  };

  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.id === districtId);
    return district?.name || '-';
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

  const getFilterRoleLabel = (role) => {
    switch (role) {
      case 'all': return 'Tất cả vai trò';
      case 'admin': return 'Quản trị viên';
      case 'province_manager': return 'Quản lý cấp tỉnh';
      case 'district_manager': return 'Quản lý cấp huyện';
      case 'expert': return 'Chuyên gia';
      default: return role;
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.username}</Text>
            <View style={[
              styles.statusBadge,
              item.status === 'active' ? styles.statusActive : styles.statusInactive
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userDetail}>
            {getRoleLabel(item.role, item.district)} • {getProvinceName(item.province)}
            {item.district && ` • ${getDistrictName(item.district)}`}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('EditUser', { 
              user: item, 
              provinces, 
              districts 
            })}
          >
            <Icon name="create-outline" size={20} color="#666" />
          </TouchableOpacity>

          {item.role !== 'admin' && (
            <>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleToggleStatus(item)}
              >
                <Icon 
                  name={item.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'} 
                  size={20} 
                  color={item.status === 'active' ? '#f39c12' : '#27ae60'} 
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDelete(item)}
              >
                <Icon name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddUser', { provinces, districts })}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Thêm người dùng</Text>
      </TouchableOpacity>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc email..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            <Icon name="filter" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.filterText}>{getFilterRoleLabel(selectedRole)}</Text>
            <Icon 
              name={showRoleDropdown ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>

          {showRoleDropdown && (
            <View style={styles.dropdown}>
              {['all', 'admin', 'province_manager', 'district_manager', 'expert'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.dropdownItem,
                    selectedRole === role && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleRoleFilter(role)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      selectedRole === role && styles.dropdownTextActive,
                    ]}
                  >
                    {getFilterRoleLabel(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
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
            <Icon name="people-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Không có người dùng</Text>
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 13,
    color: '#999',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  iconButton: {
    padding: 8,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    zIndex: 1000,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    minWidth: 140,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#f5f5f5',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownTextActive: {
    color: '#2E86AB',
    fontWeight: '600',
  },
});

export default UserManagementScreen;
