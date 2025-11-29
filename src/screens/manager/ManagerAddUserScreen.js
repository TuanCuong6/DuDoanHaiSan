import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usersAPI, areasAPI } from '../../services/api';
import { storage } from '../../services/storage';

const ManagerAddUserScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [loginName, setLoginName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [userProvince, setUserProvince] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userInfo = await storage.getUserInfo();
    if (userInfo?.province) {
      setUserProvince(userInfo.province);
    }

    try {
      const [provincesRes, districtsRes] = await Promise.all([
        areasAPI.getProvinces(),
        areasAPI.getDistricts(),
      ]);

      if (provincesRes.data) {
        setProvinces(provincesRes.data);
      }

      if (districtsRes.data) {
        setDistricts(districtsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getProvinceName = () => {
    const province = provinces.find(p => p.id === userProvince);
    return province?.name || 'Đang tải...';
  };

  const getDistrictsInProvince = () => {
    return districts.filter(d => d.province_id === userProvince);
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }
    if (!loginName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }
    if (!selectedDistrict) {
      Alert.alert('Lỗi', 'Vui lòng chọn huyện');
      return;
    }

    setLoading(true);
    try {
      await usersAPI.create({
        username,
        login_name: loginName,
        email,
        phone,
        address,
        password,
        province: userProvince,
        district: selectedDistrict.id,
        role: 'manager',
      });

      Alert.alert('Thành công', 'Thêm người dùng thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm người dùng');
    } finally {
      setLoading(false);
    }
  };

  const renderDistrictItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedDistrict?.id === item.id && styles.modalItemSelected,
      ]}
      onPress={() => {
        setSelectedDistrict(item);
        setShowDistrictModal(false);
      }}
    >
      <Text
        style={[
          styles.modalItemText,
          selectedDistrict?.id === item.id && styles.modalItemTextSelected,
        ]}
      >
        {item.name}
      </Text>
      {selectedDistrict?.id === item.id && (
        <Icon name="checkmark" size={20} color="#2E86AB" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Người Dùng Mới</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và Tên *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên Đăng Nhập *</Text>
            <TextInput
              style={styles.input}
              value={loginName}
              onChangeText={setLoginName}
              placeholder="Nhập tên đăng nhập"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số Điện Thoại *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Địa Chỉ</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mật Khẩu *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vai Trò</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>Quản lý cấp huyện</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tỉnh</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{getProvinceName()}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Huyện *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowDistrictModal(true)}
            >
              <Text style={[styles.pickerText, !selectedDistrict && styles.pickerPlaceholder]}>
                {selectedDistrict ? selectedDistrict.name : 'Chọn huyện'}
              </Text>
              <Icon name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="add" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Thêm Người Dùng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showDistrictModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Huyện</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getDistrictsInProvince()}
              renderItem={renderDistrictItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>Không có huyện nào</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#2E86AB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 32,
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
  inputDisabled: {
    backgroundColor: '#f5f5f5',
  },
  inputDisabledText: {
    color: '#999',
    fontSize: 14,
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
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#2E86AB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
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
    maxHeight: '70%',
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#2E86AB',
    fontWeight: '600',
  },
  emptyModal: {
    padding: 32,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ManagerAddUserScreen;
