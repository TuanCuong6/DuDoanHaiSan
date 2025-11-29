import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { areasAPI, predictionsAPI, emailAPI } from '../services/api';

const { width } = Dimensions.get('window');

const AreaDetailScreen = ({ route, navigation }) => {
  const { areaId } = route.params;
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAreaDetail = async () => {
    try {
      setLoading(true);
      const [areaRes, predictionRes] = await Promise.all([
        areasAPI.getById(areaId),
        predictionsAPI.getLatestByArea(areaId).catch(() => null),
      ]);
      
      if (areaRes.data) {
        setArea(areaRes.data);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin khu vực');
        navigation.goBack();
      }

      if (predictionRes?.data) {
        setLatestPrediction(predictionRes.data);
      }
    } catch (error) {
      console.error('Error loading area detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết khu vực');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreaDetail();
  }, [areaId]);

  const getAreaTypeText = type => {
    switch (type) {
      case 'oyster':
        return 'Nuôi hàu';
      case 'cobia':
        return 'Nuôi cá';
      default:
        return type;
    }
  };

  const getAreaTypeColor = type => {
    switch (type) {
      case 'oyster':
        return '#27ae60';
      case 'cobia':
        return '#2980b9';
      default:
        return '#7f8c8d';
    }
  };

  const getPredictionStatus = (prediction) => {
    if (!prediction || !prediction.NaturalElements || prediction.NaturalElements.length === 0) {
      return { text: 'Chưa có dự đoán', color: '#95a5a6' };
    }

    // Lấy giá trị O2Sat để đánh giá
    const o2Sat = prediction.NaturalElements.find(el => el.name === 'O2Sat');
    if (o2Sat && o2Sat.PredictionNatureElement) {
      const value = o2Sat.PredictionNatureElement.value;
      if (value >= 80) {
        return { text: 'Tốt', color: '#27ae60' };
      } else if (value >= 60) {
        return { text: 'Trung bình', color: '#f39c12' };
      } else {
        return { text: 'Kém', color: '#e74c3c' };
      }
    }

    return { text: 'Trung bình', color: '#f39c12' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Sending OTP to:', email, 'for area:', areaId);
      const response = await emailAPI.sendOTP(email, areaId);
      console.log('OTP sent successfully:', response.data);
      setOtpSent(true);
      Alert.alert('Thành công', 'Mã OTP đã được gửi đến email của bạn');
    } catch (error) {
      console.error('Error sending OTP:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể gửi mã OTP';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Verifying OTP:', otp, 'for email:', email, 'area:', areaId);
      const response = await emailAPI.verifyOTP(email, otp, areaId);
      console.log('OTP verified successfully:', response.data);
      Alert.alert('Thành công', 'Đăng ký nhận thông báo thành công!', [
        {
          text: 'OK',
          onPress: () => {
            setShowEmailModal(false);
            setEmail('');
            setOtp('');
            setOtpSent(false);
          },
        },
      ]);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Mã OTP không đúng';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowEmailModal(false);
    setEmail('');
    setOtp('');
    setOtpSent(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!area) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin khu vực</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header đơn giản
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card chính */}
        <View style={styles.mainCard}>
          <View style={styles.titleSection}>
            <Text style={styles.areaName}>{area.name}</Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getAreaTypeColor(area.area_type) },
              ]}
            >
              <Text style={styles.typeText}>
                {getAreaTypeText(area.area_type)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Thông tin chính */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Diện tích</Text>
              <Text style={styles.infoValue}>{area.area} ha</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tỉnh/Thành</Text>
              <Text style={styles.infoValue}>{area.Province?.name || '-'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mã khu vực</Text>
              <Text style={styles.infoValue}>#{area.id}</Text>
            </View>
          </View>
        </View>

        {/* Card tọa độ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tọa độ địa lý</Text>
          <View style={styles.coordinateContainer}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Vĩ độ</Text>
              <Text style={styles.coordinateValue}>{area.latitude}</Text>
            </View>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>Kinh độ</Text>
              <Text style={styles.coordinateValue}>{area.longitude}</Text>
            </View>
          </View>
        </View>

        {/* Card dự báo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin dự báo</Text>
          <View style={styles.predictionContainer}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>Trạng thái</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getPredictionStatus(latestPrediction).color },
                ]}
              >
                <Text style={styles.statusText}>
                  {getPredictionStatus(latestPrediction).text}
                </Text>
              </View>
            </View>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>Ngày dự báo</Text>
              <Text style={styles.predictionValue}>
                {formatDate(latestPrediction?.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Card thông tin bổ sung */}
        {area.Province?.central_meridian && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin bổ sung</Text>
            <View style={styles.additionalInfo}>
              <Text style={styles.additionalLabel}>Kinh tuyến trung tâm</Text>
              <Text style={styles.additionalValue}>
                {area.Province.central_meridian}
              </Text>
            </View>
          </View>
        )}

        {/* Nút đăng ký email */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => setShowEmailModal(true)}
        >
          <Icon name="mail-outline" size={20} color="#fff" />
          <Text style={styles.registerButtonText}>Đăng ký email thông báo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal đăng ký email */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đăng ký nhận thông báo</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Nhập email để nhận thông báo dự báo cho khu vực này
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!otpSent}
              />
            </View>

            {otpSent && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mã OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              {!otpSent ? (
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={handleSendOTP}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Gửi mã OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.secondaryButton]}
                    onPress={handleSendOTP}
                    disabled={submitting}
                  >
                    <Text style={styles.secondaryButtonText}>Gửi lại OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.primaryButton]}
                    onPress={handleVerifyOTP}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Xác nhận</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2E86AB',
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  areaName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E86AB',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  coordinateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 6,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  additionalValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  predictionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86AB',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2E86AB',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AreaDetailScreen;
