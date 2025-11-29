import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { storage } from '../services/storage';

const UserMenu = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    const userInfo = await storage.getUserInfo();
    if (userInfo?.username) {
      setUsername(userInfo.username);
    }
    if (userInfo?.role) {
      setUserRole(userInfo.role);
    }
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await storage.removeToken();
    navigation.replace('Home');
  };

  const handleProfile = () => {
    setShowMenu(false);
    navigation.navigate('Profile');
  };

  const handleJobs = () => {
    setShowMenu(false);
    navigation.navigate('Jobs');
  };

  return (
    <>
      <TouchableOpacity style={styles.userButton} onPress={() => setShowMenu(true)}>
        <Icon name="person-circle" size={24} color="#fff" />
        <Text style={styles.username}>{username || 'User'}</Text>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            {userRole !== 'manager' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleJobs}>
                <Icon name="briefcase-outline" size={20} color="#333" />
                <Text style={styles.menuText}>Jobs</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Icon name="person-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Hồ sơ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleLogout}>
              <Icon name="log-out-outline" size={20} color="#e74c3c" />
              <Text style={[styles.menuText, styles.menuTextDanger]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 16,
    gap: 6,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuTextDanger: {
    color: '#e74c3c',
  },
});

export default UserMenu;
