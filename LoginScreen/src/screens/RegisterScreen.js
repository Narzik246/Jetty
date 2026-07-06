import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Modal, 
  FlatList 
} from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState(''); // Format: YYYY-MM-DD
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Select Gender'); 
  const [role, setRole] = useState('Patient'); 
  const [contact, setContact] = useState('+63'); // Starts with +63 by default

  // Dropdown UI Visibility States
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  // UPDATE THIS STRING to match your network IP address!
  const BASE_URL = "http://yourip:1337";

  const genderOptions = ['Male', 'Female', 'Other'];
  
  // Updated list featuring all your target system personnel types!
  const roleOptions = ['Patient', 'Nurse', 'Pharmacy', 'General Physician', 'Admin']; 

  // Automatic Age Calculation Logic
  const handleBirthdateChange = (text) => {
    setBirthdate(text);

    // Verify format matches YYYY-MM-DD pattern completely
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(text)) {
      const birthDateObj = new Date(text);
      const today = new Date();
      
      if (isNaN(birthDateObj.getTime())) return; 

      let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
      const monthDifference = today.getMonth() - birthDateObj.getMonth();
      
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
        calculatedAge--;
      }

      if (calculatedAge >= 0 && calculatedAge < 125) {
        setAge(calculatedAge.toString());
      } else {
        setAge('');
      }
    } else {
      setAge(''); 
    }
  };

  // Safe Contact Number Text Formatter
  const handleContactChange = (text) => {
    // If the admin completely clears it, reset it back to the required baseline prefix
    if (!text.startsWith('+63')) {
      setContact('+63');
      return;
    }
    
    // Strip out non-numeric characters after the plus sign to stop copy-paste bugs
    const numbersAfterPrefix = text.slice(3).replace(/[^0-9]/g, '');
    
    // Lock character payload to precisely 10 extra digits (+63 + 10 digits = 13 characters max)
    if (numbersAfterPrefix.length <= 10) {
      setContact('+63' + numbersAfterPrefix);
    }
  };

  // Execution script for registration request pipeline
  const executeRegistrationRequest = async (confirmElderlyFlag = false) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role: role, 
          fullName: fullName.trim(),
          birthday: birthdate.trim(), // Passes 'birthday' string to match backend requirements
          gender: gender,
          contact: contact.trim(),
          confirmElderly: confirmElderlyFlag // Passes toggle indicator down to the engine logic
        })
      });

      const result = await response.json();

      // Check if backend catches the 100+ validation trap rule string
      if (response.status === 200 && result.isElderlyWarning) {
        Alert.alert(
          "Age Verification Check",
          `Yo, are you really ${age}? The data you are putting here is important for your health, so we would appreciate honesty!`,
          [
            { text: "Fix Birthday", style: "cancel" },
            { text: "Yes, I'm sure", onPress: () => executeRegistrationRequest(true) } // Override warning flag parameter
          ]
        );
        return;
      }

      if (response.ok && result.success) {
        Alert.alert("Success 🎉", `Account for ${fullName} registered successfully under role: ${role}!`, [
          { text: "Done", onPress: () => navigation.goBack() } 
        ]);
      } else {
        Alert.alert("Registration Failed", result.message || "An account issue occurred.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Network Error", "Unable to establish backend registration bridge.");
    }
  };

  const handleRegister = () => {
    if (!username.trim() || !password.trim() || !fullName.trim() || !birthdate.trim() || !age || gender === 'Select Gender' || contact.trim() === '+63') {
      Alert.alert("Missing Fields", "Please populate all registration forms completely. Ensure Birthday follows YYYY-MM-DD.");
      return;
    }

    // Force total character count check (+63 plus exactly 10 digits equals 13 total characters)
    if (contact.length !== 13) {
      Alert.alert("Invalid Phone Number", "The contact number must have exactly 10 digits after the +63 country routing prefix code.");
      return;
    }

    // Hand execution payload over to handler script
    executeRegistrationRequest(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.logo}>Account Provisioning</Text>
        <Text style={styles.subtitle}>Super Admin Management Terminal</Text>

        <TextInput style={styles.input} placeholder="Full Name (e.g. John Doe)" value={fullName} onChangeText={setFullName} />
        
        {/* Birthday Field */}
        <TextInput 
          style={styles.input} 
          placeholder="Birthday (YYYY-MM-DD) e.g. 2002-05-18" 
          keyboardType="numeric"
          maxLength={10}
          value={birthdate} 
          onChangeText={handleBirthdateChange} 
        />

        {/* Calculated Age Box (Read Only Status Display) */}
        <View style={[styles.input, styles.disabledInput]}>
          <Text style={{ color: age ? '#111827' : '#9CA3AF' }}>
            {age ? `Calculated Age: ${age} years old` : "Age (Calculated automatically from birthdate)"}
          </Text>
        </View>

        {/* Custom Gender Selector Dropdown Toggle Button */}
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setGenderModalVisible(true)}>
          <Text style={[styles.dropdownButtonText, gender !== 'Select Gender' && { color: '#111827' }]}>
            {gender}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Custom System Role Selector Dropdown Toggle Button */}
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setRoleModalVisible(true)}>
          <Text style={{ color: '#111827', fontWeight: '500' }}>
            System Role Account Type: <Text style={{fontWeight: '700', color: '#2D5AF0'}}>{role}</Text>
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Formatted Contact Number Field */}
        <TextInput 
          style={styles.input} 
          placeholder="Contact Number (+63...)" 
          keyboardType="phone-pad" 
          value={contact} 
          maxLength={13}
          onChangeText={handleContactChange} 
        />
        
        <View style={styles.divider} />

        <TextInput style={styles.input} placeholder="System Login Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="System Login Password" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Authorize System Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel & Discard</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* GENDER PICKER OVERLAY MODAL SHEET */}
      <Modal visible={genderModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setGenderModalVisible(false)}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalHeaderTitle}>Select Assigned Gender</Text>
            {genderOptions.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={styles.modalSelectorItem}
                onPress={() => {
                  setGender(item);
                  setGenderModalVisible(false);
                }}
              >
                <Text style={styles.modalSelectorItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ROLE PICKER OVERLAY MODAL SHEET */}
      <Modal visible={roleModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRoleModalVisible(false)}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalHeaderTitle}>Assign System Role Access Permissions</Text>
            {roleOptions.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={styles.modalSelectorItem}
                onPress={() => {
                  setRole(item);
                  setRoleModalVisible(false);
                }}
              >
                <Text style={styles.modalSelectorItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 24, justifyContent: 'center' },
  logo: { fontSize: 28, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginTop: 10 },
  subtitle: { textAlign: 'center', color: '#EF4444', marginBottom: 25, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  input: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center' },
  disabledInput: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  dropdownButtonText: { color: '#9CA3AF', fontSize: 14 },
  dropdownArrow: { color: '#6B7280', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 15 },
  button: { backgroundColor: '#2D5AF0', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelButtonText: { color: '#6B7280', fontWeight: '600' },
  
  // Overlay Sheet Styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContentCard: { backgroundColor: '#FFF', width: '80%', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 15, textAlign: 'center' },
  modalSelectorItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', width: '100%', alignItems: 'center' },
  modalSelectorItemText: { fontSize: 15, fontWeight: '600', color: '#374151' }
});