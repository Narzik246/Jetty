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
} from "react-native";

export default function DeliveryOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://172.16.83.253:1337";

  useEffect(() => {
    loadDeliveryOrders();
  }, []);

  const loadDeliveryOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/pharmacy/requests`);
      const data = await response.json();
      
      const deliveryOnly = data.filter((item) => item.fulfillmentType === "Delivery");
      setOrders(deliveryOnly);
      setLoading(false);
    } catch (error) {
      console.log("Error syncing delivery mobile stream:", error);
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (prescriptionId, nextStatus, customFields = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/api/pharmacy/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prescriptionId, 
          status: nextStatus,
          ...customFields 
        }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Delivery Updated", `Order ${prescriptionId} updated to ${nextStatus}.`);
        
        setOrders((prev) =>
          prev.map((order) =>
            order.prescriptionId === prescriptionId 
              ? { ...order, status: nextStatus, ...customFields } 
              : order
          )
        );
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to sync action with Sails backend.");
    }
  };

  // DYNAMIC LIVE AGGREGATIONS FOR THE 2x2 METRIC GRID
  const countPreparing = orders.filter(o => o.status === "New" || o.status === "Preparing").length;
  const countOut = orders.filter(o => o.status === "Out for Delivery").length;
  const countDelivered = orders.filter(o => o.status === "Completed").length;
  const countFailed = orders.filter(o => o.status === "Failed Delivery").length; // Extensible backup status count

  const filteredOrders = orders.filter((order) =>
    (order.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.prescriptionId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.deliveryAddress || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* FULLY DYNAMIC 2x2 METRIC GRID LAYOUT */}
      <View style={styles.gridContainer}>
        <View style={[styles.metricCard, { borderLeftColor: "#F59E0B" }]}>
          <Text style={styles.metricNumber}>{countPreparing}</Text>
          <Text style={styles.metricLabel}>Preparing</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#A855F7" }]}>
          <Text style={styles.metricNumber}>{countOut}</Text>
          <Text style={styles.metricLabel}>In Transit</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#10B981" }]}>
          <Text style={styles.metricNumber}>{countDelivered}</Text>
          <Text style={styles.metricLabel}>Delivered Today</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: "#EF4444" }]}>
          <Text style={styles.metricNumber}>{countFailed}</Text>
          <Text style={styles.metricLabel}>Failed Delivery</Text>
        </View>
      </View>

      {/* SEARCH BOX FILTER */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Patient, RX ID, or Address..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* MOBILE DELIVERY CARD FEED */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No delivery records match parameters.</Text>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.prescriptionId} style={styles.deliveryCard}>
              
              <View style={styles.cardHeader}>
                <Text style={styles.rxId}>{order.prescriptionId}</Text>
                
                <View style={[
                  styles.badge,
                  order.status === "Out for Delivery" && styles.badgeTransit,
                  (order.status === "New" || order.status === "Preparing") && styles.badgePreparing,
                  order.status === "Completed" && styles.badgeCompleted
                ]}>
                  <Text style={[
                    styles.badgeText,
                    order.status === "Out for Delivery" && styles.badgeTextTransit,
                    (order.status === "New" || order.status === "Preparing") && styles.badgeTextPreparing,
                    order.status === "Completed" && styles.badgeTextCompleted
                  ]}>
                    {order.status === "Out for Delivery" ? "In Transit" : order.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.patientName}>{order.patientName}</Text>
              <Text style={styles.medText}>💊 {order.medicineName} × {order.quantity}</Text>
              <Text style={styles.addressText}>📍 {order.deliveryAddress || "No address listed"}</Text>

              <View style={styles.riderRow}>
                <Text style={styles.riderLabel}>Rider / Courier:</Text>
                <Text style={[
                  styles.riderValue, 
                  !order.riderName || order.riderName === "Not Assigned" ? { color: "#EF4444", fontWeight: "700" } : { color: "#1E293B" }
                ]}>
                  👤 {order.riderName || "Not Assigned"}
                </Text>
              </View>

              <View style={styles.footerActions}>
                {(order.status === "New" || order.status === "Preparing") && (
                  <TouchableOpacity
                    style={styles.btnAssign}
                    onPress={() => updateDeliveryStatus(order.prescriptionId, "Out for Delivery", { riderName: "Express Dispatcher" })}
                  >
                    <Text style={styles.btnText}>Assign Rider & Dispatch</Text>
                  </TouchableOpacity>
                )}

                {order.status === "Out for Delivery" && (
                  <TouchableOpacity
                    style={styles.btnDeliver}
                    onPress={() => updateDeliveryStatus(order.prescriptionId, "Completed")}
                  >
                    <Text style={styles.btnText}>Mark Delivered</Text>
                  </TouchableOpacity>
                )}

                {order.status === "Completed" && (
                  <View style={styles.completeBanner}>
                    <Text style={styles.completeText}>✓ Package Handover Finished</Text>
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
  
  gridContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    gap: 10, 
    marginBottom: 16,
    zIndex: 1,
  },
  metricCard: { 
    backgroundColor: "#FFFFFF", 
    width: "48%", 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#E2E8F0", 
    borderLeftWidth: 4, 
    elevation: 1 
  },
  metricNumber: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  metricLabel: { fontSize: 11, color: "#64748B", fontWeight: "600", marginTop: 2 },
  
  searchInput: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 14, fontSize: 13, color: "#334155" },
  
  deliveryCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rxId: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  patientName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
  medText: { fontSize: 13, color: "#334155", marginBottom: 6 },
  addressText: { fontSize: 13, color: "#64748B", lineHeight: 18, marginBottom: 12 },
  
  riderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#F1F5F9", marginBottom: 12 },
  riderLabel: { fontSize: 12, color: "#475569", fontWeight: "500" },
  riderValue: { fontSize: 12, fontWeight: "600" },
  
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePreparing: { backgroundColor: "#FEF3C7" },
  badgeTransit: { backgroundColor: "#F3E8FF" },
  badgeCompleted: { backgroundColor: "#D1FAE5" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  badgeTextPreparing: { color: "#D97706" },
  badgeTextTransit: { color: "#6B21A8" },
  badgeTextCompleted: { color: "#065F46" },
  
  footerActions: { marginTop: 2 },
  btnAssign: { backgroundColor: "#2563EB", width: "100%", paddingVertical: 11, borderRadius: 6, alignItems: "center" },
  btnDeliver: { backgroundColor: "#10B981", width: "100%", paddingVertical: 11, borderRadius: 6, alignItems: "center" },
  btnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  completeBanner: { backgroundColor: "#F1F5F9", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  completeText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 30, fontSize: 14 }
});