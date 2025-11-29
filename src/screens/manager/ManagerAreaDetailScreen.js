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
import { areasAPI } from '../../services/api';

const ManagerAreaDetailScreen = ({ navigation, route }) => {
  const { areaId } = route.params;
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAreaDetail();
  }, []);

  const loadAreaDetail = async () => {
    try {
      const response = await areasAPI.getById(areaId);
      if (response.data) {
        setArea(response.data);
      }
    } catch (error) {
      console.error('Error loading area detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    return type === 'oyster' ? 'Hàu' : 'Cá';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
        <Text style={styles.headerTitle}>Chi tiết khu vực</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.areaName}>{area.name}</Text>
            <View
              style={[
                styles.typeBadge,
                area.area_type === 'oyster' ? styles.typeOyster : styles.typeCobia,
              ]}
            >
              <Text style={styles.typeText}>{getTypeLabel(area.area_type)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Icon name="location" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vị trí</Text>
                <Text style={styles.infoValue}>
                  {area.Province?.name} - {area.District?.name}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="resize" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Diện tích</Text>
                <Text style={styles.infoValue}>{area.area} ha</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="navigate" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tọa độ</Text>
                <Text style={styles.infoValue}>
                  Vĩ độ: {area.latitude?.toFixed(6)}
                </Text>
                <Text style={styles.infoValue}>
                  Kinh độ: {area.longitude?.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#999',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  areaName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeOyster: {
    backgroundColor: '#e8f5e9',
  },
  typeCobia: {
    backgroundColor: '#e3f2fd',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  section: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
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
});

export default ManagerAreaDetailScreen;
