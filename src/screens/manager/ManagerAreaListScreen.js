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
import { areasAPI } from '../../services/api';

const ManagerAreaListScreen = ({ navigation }) => {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAreas();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      if (response.data && response.data.areas) {
        setAreas(response.data.areas);
        setFilteredAreas(response.data.areas);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách khu vực');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAreas();
  };

  const applyFilters = (search, type) => {
    let filtered = areas;

    if (search.trim() !== '') {
      filtered = filtered.filter(area =>
        area.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type !== 'all') {
      filtered = filtered.filter(area => area.area_type === type);
    }

    setFilteredAreas(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(text, selectedType);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setShowTypeDropdown(false);
    applyFilters(searchQuery, type);
  };

  const clearSearch = () => {
    setSearchQuery('');
    applyFilters('', selectedType);
  };

  const handleDelete = (area) => {
    Alert.alert(
      'Xóa khu vực',
      `Bạn có chắc chắn muốn xóa khu vực: ${area.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await areasAPI.delete(area.id);
              Alert.alert('Thành công', 'Xóa khu vực thành công');
              loadAreas();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa khu vực');
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'oyster': return 'Hàu';
      case 'cobia': return 'Cá';
      default: return type;
    }
  };

  const getFilterTypeLabel = (type) => {
    switch (type) {
      case 'all': return 'Tất cả loại';
      case 'oyster': return 'Hàu';
      case 'cobia': return 'Cá';
      default: return type;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('ManagerAreaDetail', { areaId: item.id })}
      >
        <View style={styles.areaInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.areaName}>{item.name}</Text>
            <View
              style={[
                styles.typeBadge,
                item.area_type === 'oyster' ? styles.typeOyster : styles.typeCobia,
              ]}
            >
              <Text style={styles.typeText}>{getTypeLabel(item.area_type)}</Text>
            </View>
          </View>
          <Text style={styles.areaDetail}>
            {item.Province?.name} • {item.District?.name}
          </Text>
          <Text style={styles.areaSize}>Diện tích: {item.area} ha</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('ManagerEditArea', { area: item });
            }}
          >
            <Icon name="create-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('ManagerEmailRegister', { area: item });
            }}
          >
            <Icon name="mail-outline" size={20} color="#9b59b6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <Icon name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
        onPress={() => navigation.navigate('ManagerAddArea')}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Thêm khu vực</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên khu vực..."
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
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <Icon name="filter" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.filterText}>{getFilterTypeLabel(selectedType)}</Text>
            <Icon 
              name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>

          {showTypeDropdown && (
            <View style={styles.dropdown}>
              {['all', 'oyster', 'cobia'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dropdownItem,
                    selectedType === type && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleTypeFilter(type)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      selectedType === type && styles.dropdownTextActive,
                    ]}
                  >
                    {getFilterTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredAreas}
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
            <Icon name="location-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>
              {searchQuery || selectedType !== 'all' 
                ? 'Không tìm thấy khu vực phù hợp' 
                : 'Không có dữ liệu khu vực'}
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
    minWidth: 120,
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
    minWidth: 140,
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
  areaInfo: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeOyster: {
    backgroundColor: '#e8f5e9',
  },
  typeCobia: {
    backgroundColor: '#e3f2fd',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  areaDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  areaSize: {
    fontSize: 13,
    color: '#2E86AB',
    fontWeight: '500',
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
    textAlign: 'center',
  },
});

export default ManagerAreaListScreen;
