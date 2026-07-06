import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";

export default function PickupOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://172.16.83.253:1337";

  useEffect(() => {
    loadPickupOrders();
  }, []);

  const loadPickupOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/pharmacy/requests`);
      const data = await response.json();
      
      // Pull all pickup items so both Preparing and Ready states show up
      const pickupOnly = data.filter((item) => item.fulfillmentType === "Pickup");
      setOrders(pickupOnly);
      setLoading(false);
    } catch (error) {
      console.log("Error syncing pickup mobile stream:", error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (prescriptionId, nextStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/pharmacy/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId, status: nextStatus }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Status Updated", `Order ${prescriptionId} is now ${nextStatus}.`);
        setOrders((prev) =>
          prev.map((order) =>
            order.prescriptionId === prescriptionId ? { ...order, status: nextStatus } : order
          )
        );
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to update status on server.");
    }
  };

  // Derive top summary metrics instantly
  const countPreparing = orders.filter(o => o.status === "New" || o.status === "Preparing").length;
  const countReady = orders.filter(o => o.status === "Ready for Pickup").length;

  const filteredOrders = orders.filter((order) =>
    (order.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.prescriptionId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* COMPACT METRIC CARDS ROW (Fits perfectly on phone screens) */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderLeftColor: "#F59E0B" }]}>
          <Text style={styles.metricNumber}>{countPreparing}</Text>
          <Text style={styles.metricLabel}>Preparing</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#10B981" }]}>
          <Text style={styles.metricNumber}>{countReady}</Text>
          <Text style={styles.metricLabel}>Ready</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#374151" }]}>
          <Text style={styles.metricNumber}>8</Text>
          <Text style={styles.metricLabel}>Picked Up</Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Patient Name or RX ID..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* VERTICAL ORDER CARDS FEED */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No matching orders found.</Text>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.prescriptionId} style={styles.orderCard}>
              
              {/* CARD TOP ROW */}
              <View style={styles.cardHeader}>
                <Text style={styles.rxId}>{order.prescriptionId}</Text>
                
                {/* STATUS BADGES */}
                <View style={[
                  styles.badge, 
                  order.status === "Ready for Pickup" ? styles.badgeReady : styles.badgePreparing
                ]}>
                  <Text style={[
                    styles.badgeText,
                    order.status === "Ready for Pickup" ? styles.badgeTextReady : styles.badgeTextPreparing
                  ]}>
                    {order.status === "Ready for Pickup" ? "Ready" : "Preparing"}
                  </Text>
                </View>
              </View>

              {/* CARD CORE INFO */}
              <Text style={styles.patientName}>{order.patientName}</Text>
              <Text style={styles.medText}>💊 {order.medicineName} — <Text style={styles.qtyText}>{order.quantity}</Text></Text>
              
              <View style={styles.infoMetaRow}>
                <Text style={styles.metaText}>📍 {order.pickupBranch || "Central Branch"}</Text>
                <Text style={styles.metaText}>⏰ {order.pickupSchedule ? order.pickupSchedule.split(" ")[1] + " " + order.pickupSchedule.split(" ")[2] : "N/A"}</Text>
              </View>

              {/* DYNAMIC ACTION BUTTON FOOTERS */}
              <View style={styles.cardActionFooter}>
                {(order.status === "New" || order.status === "Preparing") && (
                  <TouchableOpacity 
                    style={styles.btnGreenAction}
                    onPress={() => updateOrderStatus(order.prescriptionId, "Ready for Pickup")}
                  >
                    <Text style={styles.btnActionText}>Mark Ready for Pickup</Text>
                  </TouchableOpacity>
                )}

                {order.status === "Ready for Pickup" && (
                  <View style={styles.inlineActionGroup}>
                    <TouchableOpacity style={styles.btnNotify}>
                      <Text style={styles.btnActionText}>🔔 Notify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.btnComplete}
                      onPress={() => updateOrderStatus(order.prescriptionId, "Completed")}
                    >
                      <Text style={styles.btnActionText}>Mark Picked Up</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {order.status === "Completed" && (
                  <View style={styles.completeBanner}>
                    <Text style={styles.completeText}>✓ Order Released Successfully</Text>
                  </View>
                )}
              </View>

            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  metricCard: { flex: 1, backgroundColor: "#FFFFFF", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 4, alignItems: "center" },
  metricNumber: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  metricLabel: { fontSize: 11, color: "#64748B", fontWeight: "600", marginTop: 2 },
  searchInput: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 14, fontSize: 13, color: "#334155" },
  
  // Mobile Card Styling
  orderCard: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  rxId: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  patientName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
  medText: { fontSize: 13, color: "#334155", marginBottom: 8 },
  qtyText: { fontWeight: "600", color: "#475569" },
  infoMetaRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 8, marginBottom: 12 },
  metaText: { fontSize: 12, color: "#64748B" },
  
  // Badges
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePreparing: { backgroundColor: "#FEF3C7" },
  badgeReady: { backgroundColor: "#D1FAE5" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  badgeTextPreparing: { color: "#D97706" },
  badgeTextReady: { color: "#059669" },
  
  // Footer Action Buttons
  cardActionFooter: { marginTop: 4 },
  inlineActionGroup: { flexDirection: "row", gap: 8 },
  btnGreenAction: { backgroundColor: "#10B981", width: "100%", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  btnNotify: { backgroundColor: "#2563EB", flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  btnComplete: { backgroundColor: "#475569", flex: 2, paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  btnActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  completeBanner: { backgroundColor: "#F1F5F9", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  completeText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 30, fontSize: 14 }
});