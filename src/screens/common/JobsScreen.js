import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { jobsAPI } from '../../services/api';

const JobsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [showStateModal, setShowStateModal] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadJobs();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadJobs();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchText, selectedState]);

  const loadJobs = async () => {
    try {
      const response = await jobsAPI.getAll(100, 0);
      if (response.data?.jobs) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(job =>
        job.name?.toLowerCase().includes(search) ||
        job.id?.toLowerCase().includes(search) ||
        job.creator?.username?.toLowerCase().includes(search)
      );
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter(job => job.state === selectedState);
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedState('all');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'completed': return '#27ae60';
      case 'active': return '#3498db';
      case 'failed': return '#e74c3c';
      case 'waiting': return '#f39c12';
      default: return '#999';
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case 'completed': return 'Hoàn thành';
      case 'active': return 'Đang xử lý';
      case 'failed': return 'Thất bại';
      case 'waiting': return 'Đang chờ';
      default: return state;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.jobName}>{item.name}</Text>
          <Text style={styles.jobId}>ID: {item.id.substring(0, 8)}...</Text>
        </View>
        <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.state) + '20' }]}>
          <Text style={[styles.stateText, { color: getStateColor(item.state) }]}>
            {getStateLabel(item.state)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.creator?.username}</Text>
        </View>

        {item.data?.originalname && (
          <View style={styles.infoRow}>
            <Icon name="document-outline" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.data.originalname}
            </Text>
          </View>
        )}

        <View style={styles.timeSection}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Tạo lúc:</Text>
            <Text style={styles.timeValue}>{formatDate(item.createdon)}</Text>
          </View>
          {item.startedon && (
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Bắt đầu:</Text>
              <Text style={styles.timeValue}>{formatDate(item.startedon)}</Text>
            </View>
          )}
          {item.completedon && (
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Hoàn tất:</Text>
              <Text style={styles.timeValue}>{formatDate(item.completedon)}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Jobs</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
        </View>
      </SafeAreaView>
    );
  }

  const stateOptions = [
    { value: 'all', label: 'Tất cả', color: '#666' },
    { value: 'completed', label: 'Hoàn thành', color: '#27ae60' },
    { value: 'active', label: 'Đang xử lý', color: '#3498db' },
    { value: 'failed', label: 'Thất bại', color: '#e74c3c' },
    { value: 'waiting', label: 'Đang chờ', color: '#f39c12' },
  ];

  const activeFiltersCount = (searchText ? 1 : 0) + (selectedState !== 'all' ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs ({filteredJobs.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, ID, người tạo..."
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
          onPress={() => setShowStateModal(true)}
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
            {filteredJobs.length} kết quả
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredJobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
            <Icon name="briefcase-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>
              {searchText || selectedState !== 'all' 
                ? 'Không tìm thấy kết quả phù hợp' 
                : 'Không có job nào'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={showStateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStateModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo trạng thái</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {stateOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedState === option.value && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedState(option.value);
                  setShowStateModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    { color: option.color },
                    selectedState === option.value && styles.filterOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedState === option.value && (
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  headerLeft: { flex: 1 },
  jobName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  jobId: { fontSize: 12, color: '#999' },
  stateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stateText: { fontSize: 12, fontWeight: '600' },
  cardBody: { padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 14, color: '#666', flex: 1 },
  timeSection: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timeLabel: { fontSize: 13, color: '#999' },
  timeValue: { fontSize: 13, color: '#666', fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 16 },
  searchContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', gap: 8 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: '#333' },
  filterButton: { width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#e74c3c', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  activeFiltersBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#e3f2fd' },
  activeFiltersText: { fontSize: 13, color: '#2E86AB', fontWeight: '500' },
  clearFiltersText: { fontSize: 13, color: '#2E86AB', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, width: '80%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  filterOptionSelected: { backgroundColor: '#f0f8ff' },
  filterOptionText: { fontSize: 15, fontWeight: '500' },
  filterOptionTextSelected: { fontWeight: '600' },
});

export default JobsScreen;
