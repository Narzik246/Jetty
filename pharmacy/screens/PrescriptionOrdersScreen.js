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
  Alert,
} from "react-native";

export default function PrescriptionOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All"); // All, New, Preparing, Ready for Pickup, Out for Delivery
  const [selectedOrder, setSelectedOrder] = useState(null); // Detail sheet modal pointer

  const BASE_URL = "http://172.16.83.253:1337";

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/pharmacy/requests`);
      const data = await response.json();
      
      // Exclude finalized archival history logs out of the main active command view
      const activePipeline = data.filter(item => item.status !== "Completed" && item.status !== "Cancelled");
      setOrders(activePipeline);
      setLoading(false);
    } catch (error) {
      console.log("Error loading incoming pipeline stream:", error);
      setLoading(false);
    }
  };

  const updateStatusPipeline = async (prescriptionId, nextStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/pharmacy/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId, status: nextStatus }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Status Synced", `Order ${prescriptionId} advanced to ${nextStatus}.`);
        setOrders((prev) =>
          prev.map((order) =>
            order.prescriptionId === prescriptionId ? { ...order, status: nextStatus } : order
          )
        );
      }
    } catch (error) {
      Alert.alert("Sync Failure", "Failed to update Sails instance state.");
    }
  };

  // Status mapping matching filters from image_db3e4a.png
  const filterTabs = ["All", "New", "Preparing", "Ready for Pickup", "Out for Delivery"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.prescriptionId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.doctorName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "All" || order.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HORIZONTAL SCROLLABLE STATUS CHIP BAR */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterChip,
                selectedStatusFilter === tab && styles.activeChip
              ]}
              onPress={() => setSelectedStatusFilter(tab)}
            >
              <Text style={[styles.chipText, selectedStatusFilter === tab && styles.activeChipText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SEARCH INTERFACE COMPONENT */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Rx ID, Patient, or Doctor..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* ACTIVE MASTER FLOW CARDS */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No active prescription workflows found.</Text>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.prescriptionId} style={styles.orderCard}>
              
              {/* COMPACT HEAD HEADER ROW */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.rxText}>{order.prescriptionId}</Text>
                  <Text style={styles.ticketText}>🎫 {order.ticketId}</Text>
                </View>

                {/* VISUAL PIPELINE STATUS BADGE */}
                <View style={[
                  styles.statusBadge,
                  order.status === "New" && styles.badgeNew,
                  order.status === "Preparing" && styles.badgePrep,
                  order.status === "Ready for Pickup" && styles.badgePickup,
                  order.status === "Out for Delivery" && styles.badgeDelivery,
                ]}>
                  <Text style={[
                    styles.badgeText,
                    order.status === "New" && styles.textNew,
                    order.status === "Preparing" && styles.textPrep,
                    order.status === "Ready for Pickup" && styles.textPickup,
                    order.status === "Out for Delivery" && styles.textDelivery,
                  ]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* MEDICAL DETAIL ATTRIBUTES */}
              <Text style={styles.patientName}>{order.patientName}</Text>
              <Text style={styles.doctorName}>🧑‍⚕️ {order.doctorName}</Text>
              <Text style={styles.medicineText}>📦 {order.medicineName} — {order.quantity}</Text>

              {/* FULFILLMENT MODE EMBEDDED FLAG */}
              <View style={styles.fulfillmentRow}>
                <Text style={styles.fulfillmentLabel}>Fulfillment Channel:</Text>
                <Text style={styles.fulfillmentValue}>
                  {order.fulfillmentType === "Delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                </Text>
              </View>

              {/* CONTEXTUAL ACTION CONTROLLER ROW */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.btnSecondary} 
                  onPress={() => setSelectedOrder(order)}
                >
                  <Text style={styles.btnSecondaryText}>👁 Details</Text>
                </TouchableOpacity>

                {order.status === "New" && (
                  <TouchableOpacity
                    style={[styles.btnPrimary, { backgroundColor: "#2563EB" }]}
                    onPress={() => updateStatusPipeline(order.prescriptionId, "Preparing")}
                  >
                    <Text style={styles.btnPrimaryText}>Accept Order</Text>
                  </TouchableOpacity>
                )}

                {order.status === "Preparing" && (
                  <TouchableOpacity
                    style={[styles.btnPrimary, { backgroundColor: "#8B5CF6" }]}
                    onPress={() => 
                      updateStatusPipeline(
                        order.prescriptionId, 
                        order.fulfillmentType === "Delivery" ? "Out for Delivery" : "Ready for Pickup"
                      )
                    }
                  >
                    <Text style={styles.btnPrimaryText}>Dispatch Pipeline</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>
          ))
        )}
      </ScrollView>

      {/* QUICK DRILLDOWN SYSTEM DATA MODAL SHEET */}
      <Modal visible={selectedOrder !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Prescription Reference Sheet</Text>
            
            <View style={styles.infoWrapper}>
              <Text style={styles.infoLabel}>Prescription ID</Text>
              <Text style={styles.infoVal}>{selectedOrder?.prescriptionId}</Text>

              <Text style={styles.infoLabel}>Ticket ID Association</Text>
              <Text style={styles.infoVal}>{selectedOrder?.ticketId}</Text>

              <Text style={styles.infoLabel}>Patient Name</Text>
              <Text style={styles.infoVal}>{selectedOrder?.patientName}</Text>

              <Text style={styles.infoLabel}>Prescribing Medical Professional</Text>
              <Text style={styles.infoVal}>{selectedOrder?.doctorName}</Text>

              <Text style={styles.infoLabel}>Item Content Allocation</Text>
              <Text style={styles.infoVal}>{selectedOrder?.medicineName} ({selectedOrder?.quantity})</Text>

              <Text style={styles.infoLabel}>Routing Configuration</Text>
              <Text style={styles.infoVal}>{selectedOrder?.fulfillmentType}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedOrder(null)}>
              <Text style={styles.closeBtnText}>Close Sheet</Text>
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
  
  // Tab List Styling
  filterRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
  filterChip: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  activeChip: { backgroundColor: "#10B981", borderColor: "#10B981" },
  chipText: { fontSize: 12, color: "#475569", fontWeight: "600" },
  activeChipText: { color: "#FFFFFF", fontWeight: "700" },
  
  searchInput: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 14, fontSize: 13, color: "#334155" },
  
  // Custom Card Blueprint Structuring
  orderCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  rxText: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  ticketText: { fontSize: 11, color: "#64748B", marginTop: 1 },
  patientName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 2 },
  doctorName: { fontSize: 12, color: "#475569", marginBottom: 8 },
  medicineText: { fontSize: 13, fontWeight: "600", color: "#1E293B", backgroundColor: "#F8FAFC", padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#F1F5F9", marginBottom: 10 },
  
  fulfillmentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  fulfillmentLabel: { fontSize: 12, color: "#64748B" },
  fulfillmentValue: { fontSize: 12, fontWeight: "600", color: "#334155" },
  
  // Badges Matching Layout Specs
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeNew: { backgroundColor: "#EFF6FF" },
  badgePrep: { backgroundColor: "#FEF3C7" },
  badgePickup: { backgroundColor: "#D1FAE5" },
  badgeDelivery: { backgroundColor: "#F3E8FF" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  textNew: { color: "#1D4ED8" },
  textPrep: { color: "#B45309" },
  textPickup: { color: "#065F46" },
  textDelivery: { color: "#6B21A8" },
  
  // Context Controllers
  actionRow: { flexDirection: "row", gap: 8 },
  btnSecondary: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  btnSecondaryText: { color: "#475569", fontSize: 12, fontWeight: "600" },
  btnPrimary: { flex: 2, paddingVertical: 10, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  btnPrimaryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40, fontSize: 14 },

  // Details Layer Overlay Pop Sheet
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBody: { backgroundColor: "#FFFFFF", width: "85%", padding: 20, borderRadius: 14 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 14, textAlign: "center" },
  infoWrapper: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 8, gap: 6, marginBottom: 16 },
  infoLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" },
  infoVal: { fontSize: 13, color: "#1E293B", fontWeight: "600", marginBottom: 4 },
  closeBtn: { backgroundColor: "#0F172A", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  closeBtnText: { color: "#FFFFFF", fontWeight: "600" }
});