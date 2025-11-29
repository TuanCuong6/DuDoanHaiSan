import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { predictionsAPI, areasAPI, emailAPI } from '../../services/api';

const ManagerPredictionListScreen = ({ navigation }) => {
  const [predictions, setPredictions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const limit = 10;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [predictions, searchText, selectedFilter]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadAreas(),
        loadPredictions()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAllAreas();
      if (response.data && response.data.areas) {
        setAreas(response.data.areas);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadPredictions = async (isLoadMore = false) => {
    if (isLoadMore && !hasMore) return;

    try {
      const currentOffset = isLoadMore ? offset : 0;
      const response = await predictionsAPI.getAll(limit, currentOffset);
      
      if (response.data) {
        const newPredictions = response.data.rows || [];
        
        if (isLoadMore) {
          const existingIds = new Set(predictions.map(p => p.id));
          const uniqueNew = newPredictions.filter(p => !existingIds.has(p.id));
          setPredictions([...predictions, ...uniqueNew]);
          setOffset(currentOffset + newPredictions.length);
        } else {
          setPredictions(newPredictions);
          setOffset(newPredictions.length);
        }
        
        setHasMore(newPredictions.length === limit);
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    setHasMore(true);
    loadPredictions(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadPredictions(true);
    }
  };

  const applyFilters = () => {
    let filtered = [...predictions];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.Area?.name?.toLowerCase().includes(search) ||
        item.Area?.Province?.name?.toLowerCase().includes(search) ||
        item.Area?.District?.name?.toLowerCase().includes(search)
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.prediction_text === selectedFilter);
    }

    setFilteredPredictions(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedFilter('all');
  };

  const filterOptions = [
    { value: 'all', label: 'Tất cả', color: '#666' },
    { value: '-1', label: 'Kém', color: '#e74c3c' },
    { value: '0', label: 'Trung bình', color: '#f39c12' },
    { value: '1', label: 'Tốt', color: '#27ae60' },
  ];

  const getResultLabel = (predictionText) => {
    switch (predictionText) {
      case '-1': return 'Kém';
      case '0': return 'Trung bình';
      case '1': return 'Tốt';
      default: return predictionText;
    }
  };

  const getResultColor = (predictionText) => {
    switch (predictionText) {
      case '-1': return '#e74c3c';
      case '0': return '#f39c12';
      case '1': return '#27ae60';
      default: return '#999';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetail = async (item) => {
    try {
      const [predictionResponse, subscribersResponse] = await Promise.all([
        predictionsAPI.getById(item.id),
        emailAPI.getSubscribers(item.area_id)
      ]);

      navigation.navigate('ManagerPredictionDetail', {
        prediction: predictionResponse.data,
        subscribers: subscribersResponse.data?.data?.subscribers || [],
        area: item.Area
      });
    } catch (error) {
      console.error('Error loading detail:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleViewDetail(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.predictionInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.areaName} numberOfLines={2}>
              {item.Area?.name}
            </Text>
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: getResultColor(item.prediction_text) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.resultText,
                  { color: getResultColor(item.prediction_text) },
                ]}
              >
                {getResultLabel(item.prediction_text)}
              </Text>
            </View>
          </View>

          <Text style={styles.location}>
            {item.Area?.Province?.name} • {item.Area?.District?.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="person-outline" size={14} color="#999" />
              <Text style={styles.metaText}>{item.User?.username}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={14} color="#999" />
              <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>

        <Icon name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2E86AB" />
      </View>
    );
  };

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

  const activeFiltersCount = (searchText ? 1 : 0) + (selectedFilter !== 'all' ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên khu vực..."
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
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter" size={20} color="#2E86AB" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {filteredPredictions.length} kết quả
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredPredictions}
        renderItem={renderItem}
        keyExtractor={(item, index) => `prediction-${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E86AB']}
            tintColor="#2E86AB"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="stats-chart-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>
              {searchText || selectedFilter !== 'all' 
                ? 'Không tìm thấy kết quả phù hợp' 
                : 'Không có dữ liệu dự đoán'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo phân loại</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedFilter === option.value && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedFilter(option.value);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    { color: option.color },
                    selectedFilter === option.value && styles.filterOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedFilter === option.value && (
                  <Icon name="checkmark" size={20} color="#2E86AB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
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
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#2E86AB',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#2E86AB',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  filterOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  predictionInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  areaName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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

export default ManagerPredictionListScreen;
