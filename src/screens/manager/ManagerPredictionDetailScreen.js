import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ManagerPredictionDetailScreen = ({ route, navigation }) => {
  const { prediction, subscribers = [], area } = route.params;
  const [showSubscribers, setShowSubscribers] = useState(false);

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

  const handleSendEmail = () => {
    if (subscribers.length === 0) {
      Alert.alert(
        'Thông báo',
        'Không có người dùng nào đăng ký nhận thông báo cho khu vực này.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Gửi Email',
      `Bạn có muốn gửi thông báo dự đoán này đến ${subscribers.length} người đăng ký?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => {
            // TODO: Implement send email logic
            Alert.alert('Thành công', 'Đã gửi email thông báo!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết dự đoán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Kết quả dự đoán</Text>
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: getResultColor(prediction.prediction_text) },
            ]}
          >
            <Text style={styles.resultText}>
              {getResultLabel(prediction.prediction_text)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin khu vực</Text>
          
          <View style={styles.infoRow}>
            <Icon name="location" size={20} color="#2E86AB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tên khu vực</Text>
              <Text style={styles.infoValue}>{prediction.Area?.name || area?.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="map" size={20} color="#2E86AB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tỉnh/Thành phố</Text>
              <Text style={styles.infoValue}>
                {prediction.Area?.Province?.name || area?.Province?.name}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="navigate" size={20} color="#2E86AB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Quận/Huyện</Text>
              <Text style={styles.infoValue}>
                {prediction.Area?.District?.name || area?.District?.name}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="water" size={20} color="#2E86AB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Loại khu vực</Text>
              <Text style={styles.infoValue}>
                {prediction.Area?.area_type === 'oyster' ? 'Nuôi hàu' : prediction.Area?.area_type}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin dự đoán</Text>
          
          <View style={styles.infoRow}>
            <Icon name="time" size={20} color="#2E86AB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian tạo</Text>
              <Text style={styles.infoValue}>{formatDate(prediction.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="refresh" size={20} color="#2E86AB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Cập nhật lần cuối</Text>
              <Text style={styles.infoValue}>{formatDate(prediction.updatedAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.subscribersHeader}
            onPress={() => setShowSubscribers(!showSubscribers)}
          >
            <View style={styles.subscribersTitle}>
              <Icon name="mail" size={20} color="#2E86AB" />
              <Text style={styles.sectionTitle}>
                Người đăng ký ({subscribers.length})
              </Text>
            </View>
            <Icon
              name={showSubscribers ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showSubscribers && (
            <View style={styles.subscribersList}>
              {subscribers.length === 0 ? (
                <Text style={styles.emptyText}>
                  Chưa có người dùng nào đăng ký nhận thông báo
                </Text>
              ) : (
                subscribers.map((subscriber, index) => (
                  <View key={index} style={styles.subscriberItem}>
                    <Icon name="person-circle-outline" size={24} color="#666" />
                    <Text style={styles.subscriberEmail}>{subscriber.email}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            subscribers.length === 0 && styles.sendButtonDisabled,
          ]}
          onPress={handleSendEmail}
          disabled={subscribers.length === 0}
        >
          <Icon name="send" size={20} color="#fff" />
          <Text style={styles.sendButtonText}>
            Gửi Email Thông Báo
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#2E86AB',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  resultCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  subscribersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscribersTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscribersList: {
    marginTop: 12,
  },
  subscriberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  subscriberEmail: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86AB',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ManagerPredictionDetailScreen;
