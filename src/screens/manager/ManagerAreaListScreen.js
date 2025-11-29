import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ManagerAreaListScreen = () => {
  return (
    <View style={styles.container}>
      <Icon name="map" size={64} color="#ddd" />
      <Text style={styles.title}>Danh Sách Khu Vực</Text>
      <Text style={styles.subtitle}>Đang phát triển</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default ManagerAreaListScreen;
