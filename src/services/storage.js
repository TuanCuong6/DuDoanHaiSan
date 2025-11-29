import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  setToken: async token => {
    try {
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Lỗi lưu token:', error);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Lỗi đọc token:', error);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
    } catch (error) {
      console.error('Lỗi xóa token:', error);
    }
  },

  setUserInfo: async userInfo => {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Lỗi lưu thông tin user:', error);
    }
  },

  getUserInfo: async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Lỗi đọc thông tin user:', error);
      return null;
    }
  },
};
