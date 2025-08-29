import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setUserType, setUser } from '../../store/slices/authSlice';

const UserTypeSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const walletAddress = useSelector((state: any) => state.auth?.walletAddress);

  const handleUserTypeSelection = (userType: 'customer' | 'producer') => {
    dispatch(setUserType(userType));
    
    // Create mock user object
    const mockUser = {
      id: '1',
      walletAddress: walletAddress || '',
      userType,
      profile: {
        displayName: userType === 'customer' ? 'Müşteri' : 'Üretici',
      },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    
    dispatch(setUser(mockUser));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Tipini Seçin</Text>
      <Text style={styles.subtitle}>
        Hangi tür kullanıcı olarak devam etmek istiyorsunuz?
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.customerButton]} 
        onPress={() => handleUserTypeSelection('customer')}
      >
        <Text style={styles.buttonText}>Müşteri</Text>
        <Text style={styles.buttonSubtext}>Plan satın alın ve kullanın</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.producerButton]} 
        onPress={() => handleUserTypeSelection('producer')}
      >
        <Text style={styles.buttonText}>Üretici</Text>
        <Text style={styles.buttonSubtext}>Plan oluşturun ve satın</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  customerButton: {
    backgroundColor: '#007AFF',
  },
  producerButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
});

export default UserTypeSelectionScreen;
