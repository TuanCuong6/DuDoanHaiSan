import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AreaManagementScreen from '../screens/admin/AreaManagementScreen';
import PredictionScreen from '../screens/admin/PredictionScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import EmailSubscriptionScreen from '../screens/admin/EmailSubscriptionScreen';
import { storage } from '../services/storage';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await storage.removeToken();
          navigation.replace('Home');
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E86AB',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#2E86AB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#e74c3c',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              marginRight: 16,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
              Đăng xuất
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="AreaManagement"
        component={AreaManagementScreen}
        options={{
          title: 'Quản lý khu vực',
          tabBarLabel: 'Khu vực',
          tabBarIcon: ({ color, size }) => (
            <Icon name="location" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{
          title: 'Dự đoán',
          tabBarLabel: 'Dự đoán',
          tabBarIcon: ({ color, size }) => (
            <Icon name="stats-chart" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          title: 'Quản lý người dùng',
          tabBarLabel: 'Người dùng',
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EmailSubscription"
        component={EmailSubscriptionScreen}
        options={{
          title: 'Đăng ký Email',
          tabBarLabel: 'Email',
          tabBarIcon: ({ color, size }) => (
            <Icon name="mail" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
