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
  StatusBar,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { areasAPI } from '../services/api';
import { storage } from '../services/storage';

const HomeScreen = ({ navigation }) => {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const applyFilters = (search, type) => {
    let filtered = areas;

    // Lọc theo tên
    if (search.trim() !== '') {
      filtered = filtered.filter(area =>
        area.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Lọc theo loại
    if (type !== 'all') {
      filtered = filtered.filter(area => area.area_type === type);
    }

    setFilteredAreas(filtered);
  };

  const handleSearch = text => {
    setSearchQuery(text);
    applyFilters(text, selectedType);
  };

  const handleTypeFilter = type => {
    setSelectedType(type);
    setShowDropdown(false);
    applyFilters(searchQuery, type);
  };

  const clearSearch = () => {
    setSearchQuery('');
    applyFilters('', selectedType);
  };

  const getTypeLabel = type => {
    switch (type) {
      case 'all':
        return 'Tất cả';
      case 'oyster':
        return 'Hàu';
      case 'cobia':
        return 'Cá';
      default:
        return 'Tất cả';
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAreas();
  };

  // Table Header Component
  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.cellName]}>Tên khu vực</Text>
        <Text style={[styles.headerCell, styles.cellProvince]}>Tỉnh/Thành</Text>
        <Text style={[styles.headerCell, styles.cellType]}>Loại</Text>
        <Text style={[styles.headerCell, styles.cellArea]}>Diện tích</Text>
      </View>
    </View>
  );

  // Table Row Component
  const TableRow = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
      ]}
      onPress={() => navigation.navigate('AreaDetail', { areaId: item.id })}
    >
      <View style={[styles.cell, styles.cellName]}>
        <Text style={styles.nameText} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.districtText}>{item.District?.name}</Text>
      </View>

      <View style={[styles.cell, styles.cellProvince]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.Province?.name || '-'}
        </Text>
      </View>

      <View style={[styles.cell, styles.cellType]}>
        <View
          style={[
            styles.typeBadge,
            item.area_type === 'oyster'
              ? styles.typeOyster
              : item.area_type === 'cobia'
              ? styles.typeCobia
              : styles.typeDefault,
          ]}
        >
          <Text style={styles.typeText}>
            {item.area_type === 'oyster'
              ? 'Hàu'
              : item.area_type === 'cobia'
              ? 'Cá'
              : item.area_type}
          </Text>
        </View>
      </View>

      <View style={[styles.cell, styles.cellArea]}>
        <Text style={styles.areaText}>{item.area} ha</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Khu vực nuôi trồng</Text>
          <Text style={styles.headerSubtitle}>
            {filteredAreas.length} khu vực được tìm thấy
          </Text>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khu vực..."
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

        {/* Filter Dropdown */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Icon name="filter" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.filterText}>{getTypeLabel(selectedType)}</Text>
            <Icon 
              name={showDropdown ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedType === 'all' && styles.dropdownItemActive,
                ]}
                onPress={() => handleTypeFilter('all')}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selectedType === 'all' && styles.dropdownTextActive,
                  ]}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedType === 'oyster' && styles.dropdownItemActive,
                ]}
                onPress={() => handleTypeFilter('oyster')}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selectedType === 'oyster' && styles.dropdownTextActive,
                  ]}
                >
                  Hàu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedType === 'cobia' && styles.dropdownItemActive,
                ]}
                onPress={() => handleTypeFilter('cobia')}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selectedType === 'cobia' && styles.dropdownTextActive,
                  ]}
                >
                  Cá
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Table View */}
      <View style={styles.tableContainer}>
        <TableHeader />
        <FlatList
          data={filteredAreas}
          renderItem={TableRow}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E86AB']}
              tintColor="#2E86AB"
            />
          }
          contentContainerStyle={styles.tableContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Không tìm thấy khu vực phù hợp'
                  : 'Không có dữ liệu khu vực'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tableHeader: {
    backgroundColor: '#2E86AB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCell: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  // Column widths
  cellName: { width: '40%', paddingLeft: 12 },
  cellProvince: { width: '25%', alignItems: 'center' },
  cellType: { width: '15%', alignItems: 'center' },
  cellArea: { width: '20%', alignItems: 'center' },

  tableContent: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowEven: {
    backgroundColor: '#fff',
  },
  rowOdd: {
    backgroundColor: '#f8f9fa',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  districtText: {
    fontSize: 12,
    color: '#666',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  typeOyster: {
    backgroundColor: '#e8f5e8',
  },
  typeCobia: {
    backgroundColor: '#e3f2fd',
  },
  typeDefault: {
    backgroundColor: '#f5f5f5',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  areaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E86AB',
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
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 10,
    zIndex: 1000,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
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
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    minWidth: 100,
    gap: 4,
  },
  filterText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#e8f4f8',
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

export default HomeScreen;
