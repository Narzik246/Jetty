import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
// Import AsyncStorage to pull offline profile configuration
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PharmacyDashboardView() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pharmacyRequests, setPharmacyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    orders: { preparing: 0, readyForPickup: 0, outForDelivery: 0, deliveredToday: 0, failedDelivery: 0 },
    inventory: { available: 0, lowStock: 0, outOfStock: 0 }
  });

  // Dynamic states for the reactive offline metadata header variables
  const [pharmacyName, setPharmacyName] = useState("OkieDoc+ Partner Pharmacy");
  const [branchName, setBranchName] = useState("Central Branch");

  // Target base connection string pointing to your Sails backend
  const BASE_URL = "http://172.16.83.253:1337";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Load local profile metadata if it exists
      await loadOfflineMetadata();
      
      // 2. Run backend queries concurrently
     await Promise.all([loadRequests(), loadDashboardStats()]);
      
      setLoading(false);
    } catch (error) {
      console.log("Error during initial data sync:", error);
      setLoading(false);
    }
  };

  const loadOfflineMetadata = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("@pharmacy_profile_data");
      if (savedProfile !== null) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.pharmacyName) setPharmacyName(parsed.pharmacyName);
        if (parsed.branchName) setBranchName(parsed.branchName);
      }
    } catch (error) {
      console.log("Error loading offline dashboard metrics:", error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/pharmacy/requests`);
      const data = await response.json();
      setPharmacyRequests(data);
    } catch (error) {
      console.log("Error loading requests:", error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/pharmacy/dashboard-stats`);
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.metrics);
      }
    } catch (error) {
      console.log("Error loading stats:", error);
    }
  };

  // --- RE-MAPPED METRIC MATRIX SYSTEM ---
  // No hardcoded numbers or static text. Everything is computed dynamically.
  const stats = [
    { 
      title: "New Prescription Orders", 
      count: pharmacyRequests.filter(r => r.status === "New").length, 
      info: "Awaiting review", 
      color: "#3B82F6" 
    },
    { 
      title: "Preparing Orders", 
      count: dashboardStats.orders.preparing, 
      info: `${dashboardStats.orders.preparing} currently in progress`, 
      color: "#F59E0B" 
    },
    { 
      title: "Ready for Pickup", 
      count: dashboardStats.orders.readyForPickup, 
      info: "Awaiting collection", 
      color: "#10B981" 
    },
    { 
      title: "Out for Delivery", 
      count: dashboardStats.orders.outForDelivery, 
      info: "Dispatched with courier", 
      color: "#A855F7" 
    },
    { 
      title: "Completed Orders", 
      count: dashboardStats.orders.deliveredToday, 
      info: "Successfully processed today", 
      color: "#10B981" 
    },
    { 
      title: "Low Stock Medicines", 
      count: dashboardStats.inventory.lowStock, 
      info: "Requires priority reorder", 
      color: "#EF4444" 
    },
  ];

  const filteredRequests = pharmacyRequests.filter((req) => {
    const matchesSearch =
      (req.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.prescriptionId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.medicineName || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    return matchesSearch && req.fulfillmentType === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "#3B82F6";
      case "Preparing": return "#F59E0B";
      case "Ready for Pickup": return "#10B981";
      case "Out for Delivery": return "#A855F7";
      case "Completed": return "#64748B";
      default: return "#94A3B8";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.title}>{pharmacyName}</Text>
        <Text style={styles.subtitle}>📍 {branchName}</Text>
      </View>

      <Text style={styles.sectionHeading}>Overview</Text>

      {/* METRIC GRIDS */}
      <View style={styles.grid}>
        {stats.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => setSelectedCard(item)}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.count}</Text>
            <Text style={styles.cardInfo}>{item.info}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH AND FILTERS */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, patient, or medicine..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabSection}>
        {["All", "Pickup", "Delivery"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab} Requests
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PIPELINE LISTS FEED */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Recent Orders ({filteredRequests.length})</Text>

        {filteredRequests.map((order) => (
          <View key={order.prescriptionId} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.prescriptionId}</Text>
              <View style={[styles.badge, { backgroundColor: order.fulfillmentType === "Delivery" ? "#F3E8FF" : "#FEF3C7" }]}>
                <Text style={[styles.badgeText, { color: order.fulfillmentType === "Delivery" ? "#6B21A8" : "#92400E" }]}>
                  {order.fulfillmentType}
                </Text>
              </View>
            </View>

            <Text style={styles.patientName}>{order.patientName}</Text>
            <Text style={styles.medicineName}>{order.medicineName} — {order.quantity}</Text>

            {!!(order.fulfillmentType === "Delivery" && order.deliveryAddress) && (
              <Text style={styles.addressText}>📍 {order.deliveryAddress}</Text>
            )}

            {!!(order.fulfillmentType === "Pickup" && order.pickupSchedule) && (
              <Text style={styles.addressText}>⏰ Pickup: {order.pickupSchedule}</Text>
            )}

            <View style={styles.trackerRow}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.status) }]} />
              <Text style={styles.statusText}>
                {"Status: "}
                <Text style={{ fontWeight: "700", color: getStatusColor(order.status) }}>{order.status || "Processing"}</Text>
              </Text>
            </View>

            {/* ACTION FOOTER */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setSelectedPatient(order)}
              >
                <Text style={styles.secondaryButtonText}>Patient info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setSelectedPrescription(order)}
              >
                <Text style={styles.secondaryButtonText}>Rx Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* MODALS RENDER SECTION */}
      <Modal visible={selectedCard !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedCard?.title}</Text>
            <Text style={styles.modalCount}>{selectedCard?.count}</Text>
            <Text style={styles.modalInfo}>{selectedCard?.info}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCard(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={selectedPrescription !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rx Order Reference</Text>
            <View style={styles.rxContainer}>
              <Text style={styles.rxLabel}>Doctor assigned:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.doctorName || "N/A"}</Text>
              <Text style={styles.rxLabel}>Medicine allocation:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.medicineName} ({selectedPrescription?.quantity})</Text>
              <Text style={styles.rxLabel}>Ticket reference:</Text>
              <Text style={styles.rxValue}>{selectedPrescription?.ticketId || "N/A"}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPrescription(null)}>
              <Text style={styles.closeText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={selectedPatient !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Patient Demographics</Text>
            <View style={styles.rxContainer}>
              <Text style={styles.rxLabel}>Full Name:</Text>
              <Text style={styles.rxValue}>{selectedPatient?.patientName}</Text>
              <Text style={styles.rxLabel}>Branch Link:</Text>
              <Text style={styles.rxValue}>{selectedPatient?.pickupBranch || "Home Delivery Outpost"}</Text>
              <Text style={styles.rxLabel}>Assigned Courier:</Text>
              <Text style={styles.rxValue}>{selectedPatient?.riderName || "Pending Dispatch Assignment"}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPatient(null)}>
              <Text style={styles.closeText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: { marginTop: 12, marginBottom: 20 }, 
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "600" },
  sectionHeading: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 12, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginBottom: 16 },
  card: { backgroundColor: "#FFFFFF", width: "48%", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 4, elevation: 1 },
  cardTitle: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  cardCount: { fontSize: 24, fontWeight: "800", color: "#0F172A", marginTop: 4 },
  cardInfo: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  searchSection: { marginVertical: 4 },
  searchInput: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", fontSize: 13, color: "#334155" },
  tabSection: { flexDirection: "row", justifyContent: "space-between", marginVertical: 12 },
  tabButton: { flex: 1, backgroundColor: "#E2E8F0", paddingVertical: 9, marginHorizontal: 3, borderRadius: 6, alignItems: "center" },
  activeTabButton: { backgroundColor: "#0F172A" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  activeTabText: { color: "#FFFFFF" },
  section: { marginTop: 4, paddingBottom: 40 },
  orderCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontWeight: "700", color: "#2563EB", fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  patientName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 6 },
  medicineName: { color: "#334155", fontSize: 13, marginTop: 2 },
  addressText: { color: "#64748B", fontSize: 12, marginTop: 6, fontStyle: "italic" },
  trackerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: "#F8FAFC", padding: 8, borderRadius: 6 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: "#475569" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionButton: { flex: 1, paddingVertical: 9, borderRadius: 6, alignItems: "center" },
  secondaryButton: { backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
  secondaryButtonText: { color: "#475569", fontSize: 12, fontWeight: "600" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#FFFFFF", width: "85%", padding: 20, borderRadius: 14, alignItems: "center", elevation: 5 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  modalCount: { fontSize: 36, fontWeight: "800", color: "#0F172A", marginVertical: 6 },
  modalInfo: { color: "#64748B", marginBottom: 14, fontSize: 12 },
  rxContainer: { width: "100%", marginVertical: 12, backgroundColor: "#F8FAFC", padding: 12, borderRadius: 8 },
  rxLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginTop: 4 },
  rxValue: { fontSize: 13, color: "#1E293B", fontWeight: "500", marginBottom: 4 },
  closeButton: { backgroundColor: "#0F172A", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 6, marginTop: 8, width: "100%", alignItems: "center" },
  closeText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
});