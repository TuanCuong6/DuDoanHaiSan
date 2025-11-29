import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { emailAPI } from '../../services/api';

const ManagerEmailRegisterScreen = ({ navigation, route }) => {
  const { area } = route.params || {};
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await emailAPI.sendOTP(email, area.id);
      const message = response.data?.message || 'Mã OTP đã được gửi đến email của bạn';
      Alert.alert('Thành công', message);
      setStep(2);
    } catch (error) {
      console.error('Send OTP Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể gửi mã OTP';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 số');
      return;
    }

    setLoading(true);
    try {
      const response = await emailAPI.verifyOTP(email, otp, area.id);
      console.log('Verify OTP Success:', response.data);
      setStep(3);
    } catch (error) {
      console.error('Verify OTP Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await emailAPI.sendOTP(email, area.id);
      const message = response.data?.message || 'Mã OTP mới đã được gửi';
      Alert.alert('Thành công', message);
      setOtp('');
    } catch (error) {
      console.error('Resend OTP Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể gửi lại mã OTP';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setStep(1);
    setEmail('');
    setOtp('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký Email</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Icon name="mail" size={64} color="#2E86AB" style={styles.icon} />
            <Text style={styles.title}>Đăng ký nhận thông báo</Text>
            <Text style={styles.subtitle}>cho khu vực</Text>
            <Text style={styles.areaName}>{area?.name}</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email của bạn</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập địa chỉ email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Gửi mã xác thực</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Icon name="lock-closed" size={64} color="#2E86AB" style={styles.icon} />
            <Text style={styles.title}>Nhập mã OTP</Text>
            <Text style={styles.subtitle}>
              Vui lòng nhập mã 6 số đã được gửi đến
            </Text>
            <Text style={styles.emailText}>{email}</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Mã OTP</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Xác thực đăng ký</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>Gửi lại mã?</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Icon name="checkmark-circle" size={80} color="#27ae60" style={styles.icon} />
            <Text style={styles.successTitle}>Đăng ký thành công!</Text>
            <Text style={styles.successSubtitle}>
              Bạn sẽ nhận được thông báo về khu vực
            </Text>
            <Text style={styles.areaName}>{area?.name}</Text>
            <Text style={styles.successEmail}>tại email: {email}</Text>

            <View style={styles.form}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleRegisterAnother}
              >
                <Text style={styles.buttonText}>Đăng ký email khác</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.secondaryButtonText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  areaName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E86AB',
    textAlign: 'center',
    marginBottom: 32,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2E86AB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  resendText: {
    color: '#2E86AB',
    fontSize: 14,
    fontWeight: '500',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#27ae60',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  successEmail: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  secondaryButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManagerEmailRegisterScreen;
