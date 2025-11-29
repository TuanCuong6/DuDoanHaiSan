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
} from 'react-native';
import { areasAPI } from '../services/api';

const { width } = Dimensions.get('window');

const AreaDetailScreen = ({ route, navigation }) => {
  const { areaId } = route.params;
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAreaDetail = async () => {
    try {
      setLoading(true);
      const response = await areasAPI.getById(areaId);
      if (response.data) {
        setArea(response.data);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin khu vực');
        navigation.goBack();
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
      </ScrollView>
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
});

export default AreaDetailScreen;
