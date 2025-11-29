import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { expertPredictionsAPI } from '../../services/api';

const ExpertPredictionDetailScreen = ({ navigation, route }) => {
  const { predictionId } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const response = await expertPredictionsAPI.getById(predictionId);
      if (response.data) {
        setDetail(response.data);
      }
    } catch (error) {
      console.error('Error loading detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultLabel = (text) => {
    switch (text) {
      case '-1': return 'Kém';
      case '0': return 'Trung bình';
      case '1': return 'Tốt';
      default: return text;
    }
  };

  const getResultColor = (text) => {
    switch (text) {
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
        <Text style={styles.headerTitle}>Chi tiết dự đoán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.resultRow}>
            <Text style={styles.label}>Kết quả dự đoán</Text>
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: getResultColor(detail?.prediction_text) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.resultText,
                  { color: getResultColor(detail?.prediction_text) },
                ]}
              >
                {getResultLabel(detail?.prediction_text)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin khu vực</Text>
            <View style={styles.infoRow}>
              <Icon name="location" size={18} color="#666" />
              <Text style={styles.infoText}>{detail?.Area?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="map" size={18} color="#666" />
              <Text style={styles.infoText}>
                {detail?.Area?.Province?.name} - {detail?.Area?.District?.name}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="time" size={18} color="#666" />
              <Text style={styles.infoText}>{formatDate(detail?.createdAt)}</Text>
            </View>
          </View>

          {detail?.NaturalElements && detail.NaturalElements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Các yếu tố tự nhiên ({detail.NaturalElements.length})
              </Text>
              {detail.NaturalElements.map((element, index) => (
                <View key={element.id} style={styles.elementCard}>
                  <View style={styles.elementHeader}>
                    <Text style={styles.elementName}>{element.name}</Text>
                    <View style={styles.valueBadge}>
                      <Text style={styles.valueText}>
                        {element.PredictionNatureElement?.value}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.elementDescription}>{element.description}</Text>
                  <View style={styles.elementMeta}>
                    <Text style={styles.elementUnit}>Đơn vị: {element.unit}</Text>
                    <Text style={styles.elementCategory}>{element.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  elementCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  elementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  elementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  valueBadge: {
    backgroundColor: '#2E86AB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  elementDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  elementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  elementUnit: {
    fontSize: 12,
    color: '#999',
  },
  elementCategory: {
    fontSize: 12,
    color: '#2E86AB',
    fontWeight: '500',
  },
});

export default ExpertPredictionDetailScreen;
