import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { emailAPI } from '../../services/api';

const SendPredictionEmailScreen = ({ navigation, route }) => {
  const { prediction } = route.params;
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const response = await emailAPI.getSubscribers(prediction.area_id);
      if (response.data && response.data.data && response.data.data.subscribers) {
        setSubscribers(response.data.data.subscribers);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmail = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const selectAll = () => {
    if (selectedEmails.length === subscribers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(subscribers.map(s => s.email));
    }
  };

  const handleSendToAll = async () => {
    Alert.alert(
      'Gửi cho tất cả',
      `Gửi thông báo đến ${subscribers.length} người?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: async () => {
            setSending(true);
            try {
              await emailAPI.sendManual({
                area_id: prediction.area_id,
                subject: `Dự đoán mới cho khu vực ${prediction.Area?.name}`,
                content: `Kết quả dự đoán: ${getResultLabel(prediction.prediction_text)}`,
              });
              Alert.alert('Thành công', 'Đã gửi email thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể gửi email');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const handleSendToSelected = async () => {
    if (selectedEmails.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 người nhận');
      return;
    }

    Alert.alert(
      'Gửi cho đã chọn',
      `Gửi thông báo đến ${selectedEmails.length} người?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: async () => {
            setSending(true);
            try {
              await emailAPI.sendManual({
                areaId: prediction.area_id,
                selectedEmails: selectedEmails,
                sendToAll: false,
                predictionData: {
                  result: `Dự đoán #${prediction.id}`,
                  model: 'Hệ thống dự đoán',
                  predictionCount: 1,
                  batchPrediction: false,
                },
              });
              Alert.alert('Thành công', 'Đã gửi email thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Send email error:', error);
              Alert.alert('Lỗi', 'Không thể gửi email');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const getResultLabel = (text) => {
    switch (text) {
      case '-1': return 'Kém';
      case '0': return 'Trung bình';
      case '1': return 'Tốt';
      default: return text;
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedEmails.includes(item.email);
    return (
      <TouchableOpacity
        style={[styles.subscriberItem, isSelected && styles.subscriberItemSelected]}
        onPress={() => toggleEmail(item.email)}
      >
        <View style={styles.checkbox}>
          {isSelected && <Icon name="checkmark" size={18} color="#2E86AB" />}
        </View>
        <Text style={styles.emailText}>{item.email}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn người nhận</Text>
        <TouchableOpacity onPress={selectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {selectedEmails.length === subscribers.length ? 'Bỏ chọn' : 'Chọn tất cả'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Khu vực</Text>
        <Text style={styles.infoValue}>{prediction.Area?.name}</Text>
        <Text style={styles.infoCount}>
          {selectedEmails.length}/{subscribers.length} người được chọn
        </Text>
      </View>

      <FlatList
        data={subscribers}
        renderItem={renderItem}
        keyExtractor={item => item.email}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="mail-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Chưa có người đăng ký</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.sendAllButton, sending && styles.buttonDisabled]}
          onPress={handleSendToAll}
          disabled={sending || subscribers.length === 0}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Gửi cho tất cả</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.sendSelectedButton, sending && styles.buttonDisabled]}
          onPress={handleSendToSelected}
          disabled={sending || selectedEmails.length === 0}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Gửi cho đã chọn</Text>
          )}
        </TouchableOpacity>
      </View>
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
  selectAllButton: {
    padding: 4,
  },
  selectAllText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoCount: {
    fontSize: 13,
    color: '#2E86AB',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  subscriberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subscriberItemSelected: {
    borderColor: '#2E86AB',
    backgroundColor: '#f0f8ff',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2E86AB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendAllButton: {
    backgroundColor: '#2E86AB',
  },
  sendSelectedButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default SendPredictionEmailScreen;
