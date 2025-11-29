import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ExpertPredictionListScreen from '../screens/expert/ExpertPredictionListScreen';
import ExpertCreatePredictionScreen from '../screens/expert/ExpertCreatePredictionScreen';
import { storage } from '../services/storage';

const Tab = createBottomTabNavigator();

const ExpertTabNavigator = ({ navigation }) => {
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
        name="PredictionList"
        component={ExpertPredictionListScreen}
        options={{
          title: 'Danh sách dự đoán',
          tabBarLabel: 'Dự đoán',
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreatePrediction"
        component={ExpertCreatePredictionScreen}
        options={{
          title: 'Tạo dự đoán',
          tabBarLabel: 'Tạo mới',
          tabBarIcon: ({ color, size }) => (
            <Icon name="add-circle" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ExpertTabNavigator;
