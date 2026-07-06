import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 💡 Your active tunnel address or current IP format:
  const BASE_URL = "http://yourip:1337"; 

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Empty Fields", "Please complete all inputs.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 💾 Save session data cleanly as strings
        await AsyncStorage.setItem('active_user', JSON.stringify(result.user));
        await AsyncStorage.setItem('user_role', result.user.role);

        // Send to dashboard with the nested backend user attributes
        navigation.replace('Dashboard', { role: result.user.role, user: result.user });
      } else {
        Alert.alert("Failed", result.message || "Invalid login credentials.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Network Error", "Cannot connect to backend server.");
    }
  };

  // ⚡ Developer Shortcut Utility to Autofill testing accounts immediately
  const handleAutofill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.logo}>OkieDoc</Text>
        <Text style={styles.subtitle}>Login to Portal</Text>

        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* 🛠️ DEVELOPER TESTING CHEAT SHEET CONTAINER */}
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Developer Testing Accounts (Tap to Autofill)</Text>
          
          <TouchableOpacity 
            style={styles.debugRow} 
            onPress={() => handleAutofill('admin_test', 'Password123!')}
          >
            <Text style={styles.debugRole}>Admin Account:</Text>
            <Text style={styles.debugCredentials}>User: admin_test | Pass: Password123!</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.debugRow} 
            onPress={() => handleAutofill('patient_test', 'Password123!')}
          >
            <Text style={styles.debugRole}>Patient Account:</Text>
            <Text style={styles.debugCredentials}>User: patient_test | Pass: Password123!</Text>
          </TouchableOpacity>
          
          <Text style={styles.debugFooter}>⚠️ Note: Ensure these accounts are generated via Postman or Admin Panel before tapping login!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  logo: { fontSize: 36, fontWeight: '900', color: '#2D5AF0', textAlign: 'center', marginTop: 40 },
  subtitle: { textAlign: 'center', color: '#7F8C8D', marginBottom: 30, fontSize: 16 },
  input: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  button: { backgroundColor: '#2D5AF0', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Debug Box Layout Styling
  debugBox: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 16, marginTop: 20 },
  debugTitle: { fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  debugRow: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', padding: 10, borderRadius: 8, marginVertical: 4 },
  debugRole: { fontSize: 12, fontWeight: '700', color: '#2D5AF0' },
  debugCredentials: { fontSize: 12, color: '#4B5563', fontFamily: 'monospace', marginTop: 2 },
  debugFooter: { fontSize: 10, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }
});