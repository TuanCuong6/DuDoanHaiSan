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
import { predictionsAPI } from '../../services/api';

const PredictionDetailScreen = ({ navigation, route }) => {
  const { prediction } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const response = await predictionsAPI.getById(prediction.id);
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
            <Text style={styles.areaName}>{detail?.Area?.name}</Text>
            <Text style={styles.location}>
              {detail?.Area?.Province?.name} - {detail?.Area?.District?.name}
            </Text>
          </View>

          {detail?.NaturalElements && detail.NaturalElements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Các yếu tố tự nhiên</Text>
              {detail.NaturalElements.map((element) => (
                <View key={element.id} style={styles.elementRow}>
                  <View style={styles.elementInfo}>
                    <Text style={styles.elementName}>{element.name}</Text>
                    <Text style={styles.elementDesc} numberOfLines={2}>
                      {element.description}
                    </Text>
                  </View>
                  <Text style={styles.elementValue}>
                    {element.PredictionNatureElement?.value} {element.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => navigation.navigate('SendPredictionEmail', { prediction: detail })}
        >
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.emailButtonText}>Gửi Email</Text>
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
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
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
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  areaName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  elementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  elementInfo: {
    flex: 1,
    marginRight: 12,
  },
  elementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  elementDesc: {
    fontSize: 12,
    color: '#999',
  },
  elementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E86AB',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emailButton: {
    flexDirection: 'row',
    backgroundColor: '#2E86AB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PredictionDetailScreen;
