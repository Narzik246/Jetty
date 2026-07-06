import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ route, navigation }) {
  const { role, user } = route.params;

  // Since 'user' is now an object returned from our new backend, 
  // we pull the fullName string out safely, or fall back to a template string.
  const displayName = typeof user === 'object' && user !== null ? user.fullName : user;

  const handleLogout = async () => {
    // Drop token parameters
    await AsyncStorage.removeItem('active_user');
    await AsyncStorage.removeItem('user_role');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>OkieDoc</Text>
      <Text style={styles.subtitle}>{role.toUpperCase()} PORTAL</Text>
      
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome back, {displayName}!</Text>
        {role === 'Admin' && <Text style={styles.roleText}>🔑 Full System Access Granted</Text>}
        {role === 'Nurse' && <Text style={styles.roleText}>📋 Viewing Patient Vitals...</Text>}
        {role === 'Pharmacy' && <Text style={styles.roleText}>💊 Prescription Orders Pending...</Text>}
        {role === 'General Physician' && <Text style={styles.roleText}>🩺 Appointment Schedule...</Text>}
        {role === 'Patient' && <Text style={styles.roleText}>📅 Your Medical Records...</Text>}
      </View>

      {/* 🔐 Admin Only: Account Provisioning Action Trigger */}
      {role === 'Admin' && (
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>➕ Register New System Account</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 24, justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: '#2D5AF0', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#7F8C8D', marginBottom: 30, fontSize: 14, fontWeight: 'bold' },
  card: { backgroundColor: '#F9F9F9', padding: 25, borderRadius: 20, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#2D5AF0' },
  welcomeText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  roleText: { color: '#555', fontSize: 16 },
  
  // New Admin Register Account Button Styling
  registerButton: { backgroundColor: '#2D5AF0', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  registerButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  logoutButton: { backgroundColor: '#FF4444', padding: 18, borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});