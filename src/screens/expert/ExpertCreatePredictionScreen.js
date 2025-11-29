import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import Papa from 'papaparse';
import RNFS from 'react-native-fs';
import { areasAPI, expertPredictionsAPI } from '../../services/api';
import { storage } from '../../services/storage';

const NATURAL_ELEMENTS = [
  { key: 'R_PO4', label: 'R_PO4', unit: 'mg/L' }, { key: 'O2Sat', label: 'O2Sat', unit: '%' },
  { key: 'O2ml_L', label: 'O2ml_L', unit: 'ml/L' }, { key: 'STheta', label: 'STheta', unit: '°C' },
  { key: 'Salnty', label: 'Salnty', unit: 'PSU' }, { key: 'R_DYNHT', label: 'R_DYNHT', unit: 'm' },
  { key: 'T_degC', label: 'T_degC', unit: '°C' }, { key: 'R_Depth', label: 'R_Depth', unit: 'm' },
  { key: 'Distance', label: 'Distance', unit: 'km' }, { key: 'Wind_Spd', label: 'Wind_Spd', unit: 'm/s' },
  { key: 'Wave_Ht', label: 'Wave_Ht', unit: 'm' }, { key: 'Wave_Prd', label: 'Wave_Prd', unit: 's' },
  { key: 'IntChl', label: 'IntChl', unit: 'mg/m²' }, { key: 'Dry_T', label: 'Dry_T', unit: '°C' },
];

const MODELS = [
  { value: 'oyster_ridge', label: 'oyster_ridge' }, { value: 'oyster_gbr', label: 'oyster_gbr' },
  { value: 'oyster_xgboost', label: 'oyster_xgboost' }, { value: 'oyster_svr', label: 'oyster_svr' },
  { value: 'oyster_rf', label: 'oyster_random_forest' }, { value: 'oyster_lightgbm', label: 'oyster_lightgbm' },
  { value: 'oyster_stack', label: 'oyster_stack' },
];

const ExpertCreatePredictionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [searchArea, setSearchArea] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);

  useEffect(() => {
    loadAreas();
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const userInfo = await storage.getUserInfo();
    if (userInfo?.id) setUserId(userInfo.id);
  };

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      if (response.data?.areas) setAreas(response.data.areas);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const handleInputChange = (key, value) => {
    setInputs({ ...inputs, [key]: value });
  };

  const handleFilePick = async () => {
    try {
      const result = await pick({
        type: [types.xlsx, types.xls],
        allowMultiSelection: false,
      });
      console.log('Selected file:', result);
      setSelectedFile(result[0]);
    } catch (err) {
      if (err?.message !== 'User canceled document picker') {
        console.error('File pick error:', err);
        Alert.alert('Lỗi', 'Không thể chọn file');
      }
    }
  };

  const handleCsvPick = async () => {
    try {
      const result = await pick({
        type: [types.csv, types.plainText],
        allowMultiSelection: false,
      });
      console.log('Selected CSV:', result);
      const file = result[0];
      setCsvFile(file);
      
      // Đọc file CSV - xử lý content:// URI cho Android
      let text = '';
      if (file.uri.startsWith('content://')) {
        // Copy file sang cache rồi đọc
        const destPath = `${RNFS.CachesDirectoryPath}/${file.name}`;
        await RNFS.copyFile(file.uri, destPath);
        text = await RNFS.readFile(destPath, 'utf8');
      } else {
        // File path thông thường
        text = await RNFS.readFile(file.uri, 'utf8');
      }
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Parsed CSV data:', results.data);
          setCsvData(results.data);
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          Alert.alert('Lỗi', 'Không thể đọc file CSV');
        }
      });
    } catch (err) {
      if (err?.message !== 'User canceled document picker') {
        console.error('CSV pick error:', err);
        Alert.alert('Lỗi', 'Không thể chọn file CSV');
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedArea) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực');
      return;
    }
    if (!selectedModel) {
      Alert.alert('Lỗi', 'Vui lòng chọn mô hình');
      return;
    }
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    const missingFields = NATURAL_ELEMENTS.filter(el => !inputs[el.key] || inputs[el.key].trim() === '');
    if (missingFields.length > 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tất cả các trường');
      return;
    }
    setLoading(true);
    try {
      const response = await expertPredictionsAPI.create({
        userId, areaId: selectedArea.id, modelName: selectedModel.value, inputs,
      });
      if (response.data) {
        const resultText = response.data.prediction_text === -1 || response.data.prediction_text === '-1' ? 'Kém' : response.data.prediction_text === 0 || response.data.prediction_text === '0' ? 'Trung bình' : 'Tốt';
        Alert.alert('Thành công', `Dự đoán: ${resultText}\nMô hình: ${response.data.model_used}`, [{ text: 'OK', onPress: () => navigation.navigate('PredictionList') }]);
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo dự đoán');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadExcel = async (isTemplate2 = false) => {
    if (!selectedModel) {
      Alert.alert('Lỗi', 'Vui lòng chọn mô hình');
      return;
    }
    if (!isTemplate2 && !selectedArea) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Lỗi', 'Vui lòng chọn file Excel');
      return;
    }
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', String(userId));
      formData.append('modelName', selectedModel.value);
      if (!isTemplate2) formData.append('areaId', String(selectedArea.id));
      
      // React Native FormData format - phải dùng đúng cấu trúc
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type || selectedFile.nativeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: selectedFile.name || 'upload.xlsx',
      });
      
      console.log('FormData details:', {
        userId: String(userId),
        modelName: selectedModel.value,
        areaId: selectedArea?.id ? String(selectedArea.id) : 'N/A',
        fileName: selectedFile.name,
        fileType: selectedFile.type || selectedFile.nativeType,
        fileUri: selectedFile.uri,
      });
      
      const response = isTemplate2 
        ? await expertPredictionsAPI.uploadExcel2(formData) 
        : await expertPredictionsAPI.uploadExcel(formData);
      
      console.log('Upload response:', response.data);
      
      if (response.data) {
        Alert.alert('Thành công', response.data.message, [
          { text: 'OK', onPress: () => navigation.navigate('Jobs') }
        ]);
      }
    } catch (error) {
      console.error('Upload error full:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Không thể upload file';
      
      Alert.alert('Lỗi', `${errorMsg}\nStatus: ${error.response?.status || 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = searchArea.trim() ? areas.filter(area => area.name?.toLowerCase().includes(searchArea.toLowerCase())) : areas;

  const renderAreaItem = ({ item }) => (
    <TouchableOpacity style={styles.areaItem} onPress={() => { setSelectedArea(item); setShowAreaModal(false); setSearchArea(''); }}>
      <Text style={styles.areaName}>{item.name}</Text>
      <Text style={styles.areaLocation}>{item.Province?.name} - {item.District?.name}</Text>
    </TouchableOpacity>
  );

  const renderSinglePrediction = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn Khu Vực *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowAreaModal(true)}>
            <Text style={[styles.pickerText, !selectedArea && styles.pickerPlaceholder]}>{selectedArea ? selectedArea.name : 'Chọn khu vực'}</Text>
            <Icon name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
          {selectedArea && <Text style={styles.helperText}>{selectedArea.Province?.name} - {selectedArea.District?.name}</Text>}
        </View>
        {selectedArea && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Chọn Mô Hình *</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setShowModelModal(true)}>
              <Text style={[styles.pickerText, !selectedModel && styles.pickerPlaceholder]}>{selectedModel ? selectedModel.label : 'Chọn mô hình'}</Text>
              <Icon name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        {selectedModel && (
          <>
            <Text style={styles.sectionTitle}>Nhập Số Liệu</Text>
            {NATURAL_ELEMENTS.map((element) => (
              <View key={element.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{element.label} ({element.unit})</Text>
                <TextInput style={styles.input} placeholder={`Nhập ${element.label}`} value={inputs[element.key] || ''} onChangeText={(value) => handleInputChange(element.key, value)} keyboardType="numeric" />
              </View>
            ))}
            <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <><Icon name="send" size={20} color="#fff" /><Text style={styles.submitButtonText}>Gửi Dự Đoán Cá Nhân</Text></>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderTemplate1 = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn Mô Hình *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowModelModal(true)}>
            <Text style={[styles.pickerText, !selectedModel && styles.pickerPlaceholder]}>{selectedModel ? selectedModel.label : 'Chọn mô hình'}</Text>
            <Icon name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn Khu Vực *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowAreaModal(true)}>
            <Text style={[styles.pickerText, !selectedArea && styles.pickerPlaceholder]}>{selectedArea ? selectedArea.name : 'Chọn khu vực'}</Text>
            <Icon name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload Excel (.xlsx, .xls) *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleFilePick}>
            <Icon name="cloud-upload-outline" size={24} color="#2E86AB" />
            <Text style={styles.uploadButtonText}>{selectedFile ? selectedFile.name : 'Chọn file Excel'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={() => handleUploadExcel(false)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <><Icon name="send" size={20} color="#fff" /><Text style={styles.submitButtonText}>Gửi Dự Đoán</Text></>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTemplate2 = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn Mô Hình *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowModelModal(true)}>
            <Text style={[styles.pickerText, !selectedModel && styles.pickerPlaceholder]}>{selectedModel ? selectedModel.label : 'Chọn mô hình'}</Text>
            <Icon name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload Excel (.xlsx, .xls) *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleFilePick}>
            <Icon name="cloud-upload-outline" size={24} color="#2E86AB" />
            <Text style={styles.uploadButtonText}>{selectedFile ? selectedFile.name : 'Chọn file Excel'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={() => handleUploadExcel(true)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <><Icon name="send" size={20} color="#fff" /><Text style={styles.submitButtonText}>Gửi Dự Đoán</Text></>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const handleBatchSubmit = async () => {
    if (!selectedArea) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực');
      return;
    }
    if (!selectedModel) {
      Alert.alert('Lỗi', 'Vui lòng chọn mô hình');
      return;
    }
    if (!csvData || csvData.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn file CSV');
      return;
    }
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    
    setLoading(true);
    try {
      const response = await expertPredictionsAPI.batch({
        userId,
        areaId: selectedArea.id,
        modelName: selectedModel.value,
        data: csvData,
      });
      
      console.log('Batch response:', response.data);
      
      if (response.data) {
        Alert.alert('Thành công', response.data.message || 'Đã gửi dự đoán hàng loạt', [
          { text: 'OK', onPress: () => navigation.navigate('PredictionList') }
        ]);
      }
    } catch (error) {
      console.error('Batch error:', error);
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Không thể gửi dự đoán hàng loạt';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderBatchPrediction = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn Khu Vực *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowAreaModal(true)}>
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
          <Text style={styles.label}>Chọn Mô Hình *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowModelModal(true)}>
            <Text style={[styles.pickerText, !selectedModel && styles.pickerPlaceholder]}>
              {selectedModel ? selectedModel.label : 'Chọn mô hình'}
            </Text>
            <Icon name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload CSV (.csv) *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleCsvPick}>
            <Icon name="cloud-upload-outline" size={24} color="#2E86AB" />
            <Text style={styles.uploadButtonText}>
              {csvFile ? csvFile.name : 'Chọn file CSV'}
            </Text>
          </TouchableOpacity>
          {csvData && (
            <Text style={styles.helperText}>
              Đã tải {csvData.length} dòng dữ liệu
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleBatchSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Gửi Dự Đoán Hàng Loạt</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPlaceholder = (title) => (
    <View style={styles.placeholderContainer}>
      <Icon name="construct" size={64} color="#ddd" />
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Đang phát triển</Text>
    </View>
  );

  const tabs = [
    { label: 'Đơn Lẻ', icon: 'document-text' },
    { label: 'Hàng Loạt', icon: 'documents' },
    { label: 'Mẫu 1', icon: 'grid' },
    { label: 'Mẫu 2', icon: 'apps' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity key={index} style={[styles.tab, activeTab === index && styles.tabActive]} onPress={() => setActiveTab(index)}>
            <Icon name={tab.icon} size={18} color={activeTab === index ? '#2E86AB' : '#999'} />
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === 0 && renderSinglePrediction()}
      {activeTab === 1 && renderBatchPrediction()}
      {activeTab === 2 && renderTemplate1()}
      {activeTab === 3 && renderTemplate2()}
      <Modal visible={showAreaModal} transparent animationType="slide" onRequestClose={() => setShowAreaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn khu vực</Text>
              <TouchableOpacity onPress={() => setShowAreaModal(false)}><Icon name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#999" />
              <TextInput style={styles.searchInput} placeholder="Tìm khu vực..." value={searchArea} onChangeText={setSearchArea} />
            </View>
            <FlatList data={filteredAreas} renderItem={renderAreaItem} keyExtractor={(item) => item.id.toString()} style={styles.areaList} />
          </View>
        </View>
      </Modal>
      <Modal visible={showModelModal} transparent animationType="fade" onRequestClose={() => setShowModelModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModelModal(false)}>
          <View style={styles.modelModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn mô hình</Text>
              <TouchableOpacity onPress={() => setShowModelModal(false)}><Icon name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
            {MODELS.map((model) => (
              <TouchableOpacity key={model.value} style={[styles.modelOption, selectedModel?.value === model.value && styles.modelOptionSelected]} onPress={() => { setSelectedModel(model); setShowModelModal(false); }}>
                <Text style={[styles.modelOptionText, selectedModel?.value === model.value && styles.modelOptionTextSelected]}>{model.label}</Text>
                {selectedModel?.value === model.value && <Icon name="checkmark" size={20} color="#2E86AB" />}
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
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingHorizontal: 4 },
  tab: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 4, gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2E86AB' },
  tabText: { fontSize: 11, color: '#999', fontWeight: '500', textAlign: 'center' },
  tabTextActive: { color: '#2E86AB', fontWeight: '600' },
  tabContent: { flex: 1 },
  form: { padding: 16 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  picker: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { fontSize: 14, color: '#333' },
  pickerPlaceholder: { color: '#999' },
  helperText: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 10, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#666', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 14, color: '#333' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 16, gap: 12 },
  uploadButtonText: { fontSize: 14, color: '#666', flex: 1 },
  submitButton: { flexDirection: 'row', backgroundColor: '#2E86AB', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
  placeholderTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  placeholderText: { fontSize: 14, color: '#999', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f5f5f5', margin: 12, borderRadius: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  areaList: { flexGrow: 1 },
  areaItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  areaName: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 4 },
  areaLocation: { fontSize: 13, color: '#666' },
  modelModalContent: { backgroundColor: '#fff', borderRadius: 12, width: '80%', maxWidth: 400 },
  modelOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modelOptionSelected: { backgroundColor: '#f0f8ff' },
  modelOptionText: { fontSize: 15, fontWeight: '500', color: '#333' },
  modelOptionTextSelected: { color: '#2E86AB', fontWeight: '600' },
});

export default ExpertCreatePredictionScreen;
 