import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AreaDetailScreen from './src/screens/AreaDetailScreen';
import AdminTabNavigator from './src/navigation/AdminTabNavigator';
import ExpertTabNavigator from './src/navigation/ExpertTabNavigator';
import ManagerTabNavigator from './src/navigation/ManagerTabNavigator';
import AddUserScreen from './src/screens/admin/AddUserScreen';
import EditUserScreen from './src/screens/admin/EditUserScreen';
import AddAreaScreen from './src/screens/admin/AddAreaScreen';
import EditAreaScreen from './src/screens/admin/EditAreaScreen';
import AreaDetailAdminScreen from './src/screens/admin/AreaDetailAdminScreen';
import EmailRegisterScreen from './src/screens/admin/EmailRegisterScreen';
import PredictionDetailScreen from './src/screens/admin/PredictionDetailScreen';
import SendPredictionEmailScreen from './src/screens/admin/SendPredictionEmailScreen';
import AddEmailSubscriptionScreen from './src/screens/admin/AddEmailSubscriptionScreen';
import EditEmailSubscriptionScreen from './src/screens/admin/EditEmailSubscriptionScreen';
import ExpertPredictionDetailScreen from './src/screens/expert/ExpertPredictionDetailScreen';
import ManagerEditUserScreen from './src/screens/manager/ManagerEditUserScreen';
import ManagerAddUserScreen from './src/screens/manager/ManagerAddUserScreen';
import ManagerPredictionDetailScreen from './src/screens/manager/ManagerPredictionDetailScreen';
import ManagerAreaDetailScreen from './src/screens/manager/ManagerAreaDetailScreen';
import ManagerAddAreaScreen from './src/screens/manager/ManagerAddAreaScreen';
import ManagerEditAreaScreen from './src/screens/manager/ManagerEditAreaScreen';
import ManagerEmailRegisterScreen from './src/screens/manager/ManagerEmailRegisterScreen';
import ProfileScreen from './src/screens/common/ProfileScreen';
import JobsScreen from './src/screens/common/JobsScreen';
import EditProfileScreen from './src/screens/common/EditProfileScreen';
import ChangePasswordScreen from './src/screens/common/ChangePasswordScreen';

const Stack = createStackNavigator();

const AuthLoadingScreen = ({ navigation }) => {
  useEffect(() => {
    // Luôn chuyển đến Home (không cần kiểm tra token)
    navigation.replace('Home');
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2E86AB" />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthLoading">
        <Stack.Screen
          name="AuthLoading"
          component={AuthLoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AreaDetail"
          component={AreaDetailScreen}
          options={{ title: 'Chi tiết khu vực' }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExpertDashboard"
          component={ExpertTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerDashboard"
          component={ManagerTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerAddUser"
          component={ManagerAddUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerEditUser"
          component={ManagerEditUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerPredictionDetail"
          component={ManagerPredictionDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerAreaDetail"
          component={ManagerAreaDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerAddArea"
          component={ManagerAddAreaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerEditArea"
          component={ManagerEditAreaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManagerEmailRegister"
          component={ManagerEmailRegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddUser"
          component={AddUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditUser"
          component={EditUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddArea"
          component={AddAreaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditArea"
          component={EditAreaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AreaDetailAdmin"
          component={AreaDetailAdminScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailRegister"
          component={EmailRegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PredictionDetail"
          component={PredictionDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SendPredictionEmail"
          component={SendPredictionEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddEmailSubscription"
          component={AddEmailSubscriptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditEmailSubscription"
          component={EditEmailSubscriptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExpertPredictionDetail"
          component={ExpertPredictionDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Jobs"
          component={JobsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
