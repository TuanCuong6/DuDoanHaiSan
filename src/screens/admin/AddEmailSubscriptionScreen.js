import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { emailAPI, areasAPI } from '../../services/api';

const AddEmailSubscriptionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [searchArea, setSearchArea] = useState('');

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      console.log('Areas API response:', response);
      console.log('Areas data:', response.data);
      
      if (response.data) {
        // Kiểm tra cả 2 trường hợp: response.data.areas hoặc response.data là array
        const areasList = response.data.areas || response.data;
        if (Array.isArray(areasList)) {
          setAreas(areasList);
          console.log('Loaded areas count:', areasList.length);
          console.log('First area:', areasList[0]);
        } else {
          console.error('Areas data is not an array:', areasList);
        }
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Lỗi', 'Không thể tải danh sách khu vực');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (!selectedArea) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực');
      return;
    }

    setLoading(true);
    try {
      await emailAPI.create({
        email: email.trim(),
        area_id: selectedArea.id,
        is_active: isActive,
      });
      Alert.alert('Thành công', 'Đã thêm đăng ký email', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = searchArea.trim()
    ? areas.filter(area =>
        area.name?.toLowerCase().includes(searchArea.toLowerCase()) ||
        area.Province?.name?.toLowerCase().includes(searchArea.toLowerCase())
      )
    : areas;

  const renderAreaItem = ({ item }) => {
    console.log('Rendering area item:', item.name);
    return (
      <TouchableOpacity
        style={styles.areaItem}
        onPress={() => {
          console.log('Selected area:', item.name);
          setSelectedArea(item);
          setShowAreaPicker(false);
          setSearchArea('');
        }}
      >
        <Text style={styles.areaName}>{item.name}</Text>
        <Text style={styles.areaLocation}>
          {item.Province?.name} - {item.District?.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm đăng ký email</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Khu vực * ({areas.length} khu vực)</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                console.log('Opening area picker, areas count:', areas.length);
                setShowAreaPicker(true);
              }}
            >
              <Text style={[styles.pickerText, !selectedArea && styles.pickerPlaceholder]}>
                {selectedArea ? selectedArea.name : 'Chọn khu vực'}
              </Text>
              <Icon name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {selectedArea && (
              <Text style={styles.helperText}>
                {selectedArea.Province?.name} - {selectedArea.District?.name}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.label}>Trạng thái</Text>
                <Text style={styles.helperText}>
                  {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, isActive && styles.toggleActive]}
                onPress={() => setIsActive(!isActive)}
              >
                <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Thêm đăng ký</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAreaPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          console.log('Modal closing');
          setShowAreaPicker(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Chọn khu vực ({filteredAreas.length}/{areas.length})
              </Text>
              <TouchableOpacity onPress={() => setShowAreaPicker(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm khu vực..."
                value={searchArea}
                onChangeText={(text) => {
                  console.log('Search text:', text);
                  setSearchArea(text);
                }}
              />
            </View>

            <FlatList
              data={filteredAreas}
              renderItem={renderAreaItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.areaList}
              ListEmptyComponent={
                <View style={styles.emptyArea}>
                  <Text style={styles.emptyAreaText}>
                    {searchArea ? 'Không tìm thấy khu vực' : areas.length === 0 ? 'Đang tải...' : 'Không có dữ liệu'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  pickerPlaceholder: {
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#27ae60',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#2E86AB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  areaList: {
    flexGrow: 1,
  },
  areaItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  areaName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  areaLocation: {
    fontSize: 13,
    color: '#666',
  },
  emptyArea: {
    padding: 32,
    alignItems: 'center',
  },
  emptyAreaText: {
    fontSize: 14,
    color: '#999',
  },
});

export default AddEmailSubscriptionScreen;
