import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";

export default function OrderHistoryScreen() {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Filters matching your top design buttons
  const [selectedFulfillment, setSelectedFulfillment] = useState("All"); // All, Pickup, Delivery
  const [selectedStatus, setSelectedStatus] = useState("All");          // All, Completed, Cancelled
  const [selectedOrder, setSelectedOrder] = useState(null);              // For details modal

  const BASE_URL = "http://172.16.83.253:1337";

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/pharmacy/requests`);
      const data = await response.json();
      
      // Filter for history views: Only display finalized records
      const finalized = data.filter(
        (item) => item.status === "Completed" || item.status === "Cancelled"
      );
      setHistoryOrders(finalized);
      setLoading(false);
    } catch (error) {
      console.log("Error loading history stream:", error);
      setLoading(false);
    }
  };

  // COMPUTE DYNAMIC METRICS FROM THE FINALIZED DATA STREAM SUBSET
  const totalCompleted = historyOrders.filter((o) => o.status === "Completed").length;
  const totalPickup = historyOrders.filter((o) => o.fulfillmentType === "Pickup").length;
  const totalDelivery = historyOrders.filter((o) => o.fulfillmentType === "Delivery").length;

  // Filter pipeline handling both design filter bars + search parameters
  const filteredOrders = historyOrders.filter((order) => {
    const matchesSearch =
      (order.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.prescriptionId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.medicineName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFulfillment =
      selectedFulfillment === "All" || order.fulfillmentType === selectedFulfillment;

    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;

    return matchesSearch && matchesFulfillment && matchesStatus;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* FULLY DYNAMIC 3-COLUMN SUMMARY BANNER */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderLeftColor: "#10B981" }]}>
          <Text style={styles.metricNumber}>{totalCompleted}</Text>
          <Text style={styles.metricLabel}>Total Completed</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#3B82F6" }]}>
          <Text style={styles.metricNumber}>{totalPickup}</Text>
          <Text style={styles.metricLabel}>Pickup Orders</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#A855F7" }]}>
          <Text style={styles.metricNumber}>{totalDelivery}</Text>
          <Text style={styles.metricLabel}>Delivery Orders</Text>
        </View>
      </View>

      {/* SEARCH BOX CONTROLLER */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search past patients, RX codes, or items..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* FILTER BUTTON GROUP 1: Fulfillment Type */}
      <View style={styles.filterBar}>
        <Text style={styles.filterBarLabel}>Type:</Text>
        {["All", "Pickup", "Delivery"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, selectedFulfillment === type && styles.activeChip]}
            onPress={() => setSelectedFulfillment(type)}
          >
            <Text style={[styles.chipText, selectedFulfillment === type && styles.activeChipText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FILTER BUTTON GROUP 2: Status */}
      <View style={[styles.filterBar, { marginBottom: 12 }]}>
        <Text style={styles.filterBarLabel}>Status:</Text>
        {["All", "Completed", "Cancelled"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, selectedStatus === status && styles.activeChip]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[styles.chipText, selectedStatus === status && styles.activeChipText]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* COMPACT LIST STREAM */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No archival records found matching criteria.</Text>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.prescriptionId} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.rxId}>{order.prescriptionId}</Text>
                  <Text style={styles.patientName}>{order.patientName}</Text>
                </View>
                
                {/* STATUS CHIP BADGE */}
                <View style={[
                  styles.statusBadge,
                  order.status === "Cancelled" ? styles.badgeCancelled : styles.badgeCompleted
                ]}>
                  <Text style={[
                    styles.badgeText,
                    order.status === "Cancelled" ? styles.textCancelled : styles.textCompleted
                  ]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.medText}>💊 {order.medicineName} — {order.quantity}</Text>
              
              <View style={styles.metaDivider} />
              
              <View style={styles.metaRow}>
                <Text style={styles.metaDetail}>
                  {order.fulfillmentType === "Delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                </Text>
                <Text style={styles.metaDetail}>🧑‍⚕️ {order.pharmacistName || "Maria Garcia"}</Text>
              </View>
              
              <Text style={styles.dateText}>📅 Closed: {order.completedDate || "2026-05-04 11:30 AM"}</Text>

              {/* DETAILED DRILLDOWN ACTION TRIGGER */}
              <TouchableOpacity 
                style={styles.viewDetailsBtn}
                onPress={() => setSelectedOrder(order)}
              >
                <Text style={styles.viewDetailsBtnText}>View Full Log Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* FULL LOG CONTEXT MODAL DETAIL POPUP */}
      <Modal visible={selectedOrder !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Archived Transaction Summary</Text>
            
            <View style={styles.detailsContainer}>
              <Text style={styles.detailLabel}>Prescription Identifier</Text>
              <Text style={styles.detailValue}>{selectedOrder?.prescriptionId}</Text>

              <Text style={styles.detailLabel}>Patient Account</Text>
              <Text style={styles.detailValue}>{selectedOrder?.patientName}</Text>

              <Text style={styles.detailLabel}>Disbursed Medication</Text>
              <Text style={styles.detailValue}>{selectedOrder?.medicineName} ({selectedOrder?.quantity})</Text>

              <Text style={styles.detailLabel}>Fulfillment Channel</Text>
              <Text style={styles.detailValue}>
                {selectedOrder?.fulfillmentType === "Delivery" ? "🚚 Home Delivery" : "🏪 In-Branch Pickup"}
              </Text>

              <Text style={styles.detailLabel}>Processing Sign-off Officer</Text>
              <Text style={styles.detailValue}>{selectedOrder?.pharmacistName || "Maria Garcia"}</Text>

              <Text style={styles.detailLabel}>Final Processing Action Timestamp</Text>
              <Text style={styles.detailValue}>{selectedOrder?.completedDate || "2026-05-04 11:30 AM"}</Text>
            </View>

            <TouchableOpacity style={styles.dismissBtn} onPress={() => setSelectedOrder(null)}>
              <Text style={styles.dismissBtnText}>Dismiss Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  metricsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  metricCard: { flex: 1, backgroundColor: "#FFFFFF", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 4, alignItems: "center" },
  metricNumber: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  metricLabel: { fontSize: 10, color: "#64748B", fontWeight: "600", marginTop: 2, textAlign: "center" },
  
  searchInput: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, fontSize: 13, color: "#334155" },
  
  // Horizontal Filter Chips Layout
  filterBar: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  filterBarLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", width: 45 },
  filterChip: { backgroundColor: "#E2E8F0", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  activeChip: { backgroundColor: "#0F172A" },
  chipText: { fontSize: 11, color: "#475569", fontWeight: "600" },
  activeChipText: { color: "#FFFFFF" },
  
  // Archival Layout Cards
  historyCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  rxId: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  patientName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  medText: { fontSize: 13, color: "#334155", marginVertical: 4 },
  
  metaDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 8 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  metaDetail: { fontSize: 12, color: "#475569", fontWeight: "500" },
  dateText: { fontSize: 11, color: "#94A3B8", fontStyle: "italic" },
  
  // Badges
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeCompleted: { backgroundColor: "#D1FAE5" },
  badgeCancelled: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  textCompleted: { color: "#059669" },
  textCancelled: { color: "#DC2626" },
  
  viewDetailsBtn: { backgroundColor: "#F1F5F9", width: "100%", paddingVertical: 8, borderRadius: 6, alignItems: "center", marginTop: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  viewDetailsBtnText: { color: "#475569", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40, fontSize: 14 },
  
  // Modal Overlays
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "center", alignItems: "center" },
  modalBody: { backgroundColor: "#FFFFFF", width: "85%", padding: 20, borderRadius: 14, elevation: 5 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 12, textAlign: "center" },
  detailsContainer: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 8, gap: 8, marginBottom: 16 },
  detailLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" },
  detailValue: { fontSize: 13, color: "#1E293B", fontWeight: "500", marginBottom: 4 },
  dismissBtn: { backgroundColor: "#0F172A", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  dismissBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 }
});