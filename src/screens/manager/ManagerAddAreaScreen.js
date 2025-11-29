import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { areasAPI } from '../../services/api';

const ManagerAddAreaScreen = ({ navigation }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    province: '',
    district: '',
    area_type: 'oyster',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [provincesRes, districtsRes] = await Promise.all([
        areasAPI.getProvinces(),
        areasAPI.getDistricts(),
      ]);
      
      if (provincesRes.data) setProvinces(provincesRes.data);
      if (districtsRes.data) setDistricts(districtsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.province || !formData.district) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const areaData = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        province: formData.province,
        district: formData.district,
        area_type: formData.area_type,
      };

      await areasAPI.create(areaData);
      Alert.alert('Thành công', 'Thêm khu vực thành công', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Lỗi', 'Không thể thêm khu vực');
    } finally {
      setLoading(false);
    }
  };

  const getProvinceName = (provinceId) => {
    const province = provinces.find(p => p.id === provinceId);
    return province?.name || 'Chọn tỉnh/thành';
  };

  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.id === districtId);
    return district?.name || 'Chọn quận/huyện';
  };

  const getFilteredDistricts = () => {
    if (!formData.province) return [];
    return districts.filter(d => d.province_id === formData.province);
  };

  const getTypeLabel = (type) => {
    return type === 'oyster' ? 'Hàu' : 'Cá';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm khu vực</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Tên khu vực <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Nhập tên khu vực"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Vĩ độ (Latitude) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.latitude}
              onChangeText={(text) => setFormData({...formData, latitude: text})}
              placeholder="Ví dụ: 10.762622"
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Kinh độ (Longitude) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.longitude}
              onChangeText={(text) => setFormData({...formData, longitude: text})}
              placeholder="Ví dụ: 106.660172"
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Loại hải sản <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              disabled={loading}
            >
              <Text style={styles.dropdownText}>{getTypeLabel(formData.area_type)}</Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showTypeDropdown && (
              <View style={styles.dropdownList}>
                {['oyster', 'cobia'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({...formData, area_type: type});
                      setShowTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{getTypeLabel(type)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tỉnh/Thành <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
              disabled={loading}
            >
              <Text style={styles.dropdownText}>{getProvinceName(formData.province)}</Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showProvinceDropdown && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {provinces.map(province => (
                  <TouchableOpacity
                    key={province.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({...formData, province: province.id, district: ''});
                      setShowProvinceDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{province.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Quận/Huyện <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDistrictDropdown(!showDistrictDropdown)}
              disabled={!formData.province || loading}
            >
              <Text style={styles.dropdownText}>{getDistrictName(formData.district)}</Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showDistrictDropdown && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {getFilteredDistricts().map(district => (
                  <TouchableOpacity
                    key={district.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({...formData, district: district.id});
                      setShowDistrictDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{district.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Thêm</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2E86AB',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ManagerAddAreaScreen;
