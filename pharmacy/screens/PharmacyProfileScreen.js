import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function PharmacyProfileScreen() {
  // Master reactive profile data state matching layout requirements
  const [profile, setProfile] = useState({
    pharmacyName: "OkieDoc+ Partner Pharmacy",
    branchName: "Central Branch",
    status: "Active",
    address: "123 Health Street, Makati City, Metro Manila 1200",
    contactNumber: "+63 2 8123 4567",
    email: "central@okiedocpharmacy.ph",
    operatingHoursWeekday: "8:00 AM - 8:00 PM",
    operatingHoursWeekend: "9:00 AM - 6:00 PM",
    serviceType: "Pickup & Delivery",
    licenseNumber: "PH-PHARM-2024-001234",
    pharmacistInCharge: "Dr. Maria Garcia, RPh",
  });

  // Modal display visibility trigger and temporary input state buffer
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBuffer, setEditBuffer] = useState({ ...profile });

  const openEditModal = () => {
    setEditBuffer({ ...profile });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    setProfile({ ...editBuffer });
    setIsEditModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollWrapper}>
        
        {/* TOP BRAND HERO BLOCK CONTAINER */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Feather name="plus-square" size={32} color="#10B981" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.mainTitle}>{profile.pharmacyName}</Text>
            <Text style={styles.subTitleText}>{profile.branchName}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.badgeText}>✓ {profile.status}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editActionTrigger} onPress={openEditModal}>
            <Feather name="edit-3" size={16} color="#FFFFFF" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* DETAILS LAYOUT SPECIFICATION MATRIX */}
        <View style={styles.detailsGroupBlock}>
          <Text style={styles.groupSectionHeading}>Core Identification</Text>
          
          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Pharmacy Name</Text>
            <Text style={styles.metaFieldValue}>{profile.pharmacyName}</Text>
          </View>
          
          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Branch Designation</Text>
            <Text style={styles.metaFieldValue}>{profile.branchName}</Text>
          </View>

          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Physical Address</Text>
            <Text style={styles.metaFieldValue}>📍 {profile.address}</Text>
          </View>
        </View>

        <View style={styles.detailsGroupBlock}>
          <Text style={styles.groupSectionHeading}>Communication & Availability</Text>
          
          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Contact Number</Text>
            <Text style={styles.metaFieldValue}>📞 {profile.contactNumber}</Text>
          </View>

          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Email Node</Text>
            <Text style={styles.metaFieldValue}>✉️ {profile.email}</Text>
          </View>

          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Operating Hours (Weekday)</Text>
            <Text style={styles.metaFieldValue}>🕒 {profile.operatingHoursWeekday}</Text>
          </View>

          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Operating Hours (Weekend)</Text>
            <Text style={styles.metaFieldValue}>🕒 {profile.operatingHoursWeekend}</Text>
          </View>
        </View>

        <View style={styles.detailsGroupBlock}>
          <Text style={styles.groupSectionHeading}>Regulatory Records & Capacity</Text>
          
          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Service Configuration Scope</Text>
            <Text style={styles.metaFieldValue}> {profile.serviceType}</Text>
          </View>

          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Operational License Identifier</Text>
            <Text style={styles.metaFieldValue}> {profile.licenseNumber}</Text>
          </View>

          <View style={styles.dataRowUnit}>
            <Text style={styles.metaFieldLabel}>Pharmacist in Charge</Text>
            <Text style={styles.metaFieldValue}> {profile.pharmacistInCharge}</Text>
          </View>
        </View>

        {/* BOTTOM PARTNERSHIP ANCHOR BANNER FOOTER */}
        <View style={styles.partnershipDisclaimerCard}>
          <Text style={styles.partnershipTitle}>Partnership Information</Text>
          <Text style={styles.partnershipText}>
            This pharmacy is an authorized OkieDoc+ partner pharmacy. All prescription orders from OkieDoc+ telemedicine consultations will be securely routed to this portal interface instance context for fulfillment processing.
          </Text>
        </View>

      </ScrollView>

      {/* FULL-WINDOW EDIT LAYOUT MODAL SHEET OVERLAY */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent={false}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalScreenContainer}
        >
          <View style={styles.modalHeaderActionBar}>
            <TouchableOpacity onPress={() => setIsEditModalOpen(false)} style={styles.modalHeaderDismiss}>
              <Feather name="x" size={22} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Modify Profile Data</Text>
            <TouchableOpacity onPress={handleSaveProfile} style={styles.modalHeaderSave}>
              <Text style={styles.modalSaveActionText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalInputScroll}>
            
            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Pharmacy Entity Name</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.pharmacyName}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, pharmacyName: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Branch Code Name</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.branchName}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, branchName: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Physical Location Address</Text>
              <TextInput
                style={[styles.formInputFieldBox, { minHeight: 60 }]}
                multiline
                value={editBuffer.address}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, address: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Contact Telephone / Mobile</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.contactNumber}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, contactNumber: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Administrative Email Address</Text>
              <TextInput
                style={styles.formInputFieldBox}
                keyboardType="email-address"
                value={editBuffer.email}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, email: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Operating Timeline Framework (Weekday)</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.operatingHoursWeekday}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, operatingHoursWeekday: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Operating Timeline Framework (Weekend)</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.operatingHoursWeekend}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, operatingHoursWeekend: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Fulfillment Channel Capabilities</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.serviceType}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, serviceType: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Regulatory Board License ID</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.licenseNumber}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, licenseNumber: t })}
              />
            </View>

            <View style={styles.inputContainerUnit}>
              <Text style={styles.inputFieldTagLabel}>Primary Sign-off Pharmacist</Text>
              <TextInput
                style={styles.formInputFieldBox}
                value={editBuffer.pharmacistInCharge}
                onChangeText={(t) => setEditBuffer({ ...editBuffer, pharmacistInCharge: t })}
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollWrapper: { padding: 16, paddingBottom: 30 },
  
  // Hero Block Structure
  profileHeaderCard: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 16, position: "relative" },
  avatarCircle: { width: 55, height: 55, borderRadius: 10, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center", marginRight: 14 },
  headerInfo: { flex: 1, minWidth: 150 },
  mainTitle: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
  subTitleText: { fontSize: 13, color: "#94A3B8", marginTop: 2 },
  activeBadge: { alignSelf: "flex-start", backgroundColor: "#065F46", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 6 },
  badgeText: { color: "#34D399", fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  
  editActionTrigger: { backgroundColor: "#10B981", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, position: "absolute", right: 16, top: 16 },
  editBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },

  // Data Information Segments
  detailsGroupBlock: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  groupSectionHeading: { fontSize: 12, fontWeight: "800", color: "#64748B", textTransform: "uppercase", trackingSpace: 1, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", paddingBottom: 4 },
  dataRowUnit: { marginBottom: 10 },
  metaFieldLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600", marginBottom: 2 },
  metaFieldValue: { fontSize: 13, color: "#1E293B", fontWeight: "500", lineHeight: 18 },

  // Disclaimer Block
  partnershipDisclaimerCard: { backgroundColor: "#EFF6FF", borderWith: 1, borderColor: "#BFDBFE", borderRadius: 10, padding: 14, borderLeftWidth: 4, borderLeftColor: "#2563EB" },
  partnershipTitle: { fontSize: 13, fontWeight: "700", color: "#1E40AF", marginBottom: 4 },
  partnershipText: { fontSize: 11, color: "#2563EB", lineHeight: 16, fontWeight: "400" },

  // Complete Form Layer Editing Elements
  modalScreenContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  modalHeaderActionBar: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", backgroundColor: "#F8FAFC" },
  modalHeaderDismiss: { padding: 6 },
  modalHeaderTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  modalHeaderSave: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "#10B981", borderRadius: 6 },
  modalSaveActionText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  
  modalInputScroll: { padding: 16, paddingBottom: 40 },
  inputContainerUnit: { marginBottom: 14 },
  inputFieldTagLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 6, textTransform: "uppercase" },
  formInputFieldBox: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: "#0F172A" }
});