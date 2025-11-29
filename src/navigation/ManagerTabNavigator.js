import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import ManagerPredictionListScreen from '../screens/manager/ManagerPredictionListScreen';
import ManagerAreaListScreen from '../screens/manager/ManagerAreaListScreen';
import ManagerUserListScreen from '../screens/manager/ManagerUserListScreen';
import UserMenu from '../components/UserMenu';
import { storage } from '../services/storage';

const Tab = createBottomTabNavigator();

const ManagerTabNavigator = ({ navigation }) => {
  const [isProvincialManager, setIsProvincialManager] = useState(false);

  useEffect(() => {
    checkManagerLevel();
  }, []);

  const checkManagerLevel = async () => {
    const userInfo = await storage.getUserInfo();
    // Nếu district === null thì là quản lý cấp tỉnh
    setIsProvincialManager(userInfo?.district === null);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'PredictionList') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'AreaList') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'UserList') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E86AB',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2E86AB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <UserMenu navigation={navigation} />,
      })}
    >
      <Tab.Screen
        name="PredictionList"
        component={ManagerPredictionListScreen}
        options={{ title: 'Dự Đoán', headerTitle: 'Danh Sách Dự Đoán' }}
      />
      <Tab.Screen
        name="AreaList"
        component={ManagerAreaListScreen}
        options={{ title: 'Khu Vực', headerTitle: 'Danh Sách Khu Vực' }}
      />
      {isProvincialManager && (
        <Tab.Screen
          name="UserList"
          component={ManagerUserListScreen}
          options={{ title: 'Người Dùng', headerTitle: 'Danh Sách Người Dùng' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default ManagerTabNavigator;
