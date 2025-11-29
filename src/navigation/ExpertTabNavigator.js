import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import ExpertPredictionListScreen from '../screens/expert/ExpertPredictionListScreen';
import ExpertCreatePredictionScreen from '../screens/expert/ExpertCreatePredictionScreen';
import UserMenu from '../components/UserMenu';

const Tab = createBottomTabNavigator();

const ExpertTabNavigator = ({ navigation }) => {
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
        headerRight: () => <UserMenu navigation={navigation} />,
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
