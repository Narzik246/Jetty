import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // Added for quick tab filtering
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://172.16.83.253:1337";

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/pharmacy/inventory`);
      const data = await response.json();
      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.log("Error loading inventory:", error);
      setLoading(false);
    }
  };

  // Enhanced search + status tab filter logic
  const filteredInventory = inventory.filter((item) => {
    const medName = item.medicineName || "";
    const genName = item.genericName || "";
    const status = item.status || "Available";
    
    const matchesSearch = 
      medName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      genName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "All") return matchesSearch;
    if (activeFilter === "In Stock") return matchesSearch && status === "Available";
    if (activeFilter === "Critical") return matchesSearch && (status === "Low Stock" || status === "Out of Stock");
    
    return matchesSearch;
  });

  const getStockStatusColor = (status) => {
    switch (status) {
      case "Available": return "#10B981";
      case "Low Stock": return "#F59E0B";
      case "Out of Stock": return "#EF4444";
      default: return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by medicine or generic name..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* FILTER TABS: Mirroring the clean segmentation of the order pipelines */}
      <View style={styles.tabSection}>
        {[
          { label: "All Items", key: "All" },
          { label: "In Stock", key: "In Stock" },
          { label: "Critical Alert", key: "Critical" }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeFilter === tab.key && styles.activeTabButton]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text style={[styles.tabText, activeFilter === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredInventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matching medicines found.</Text>
        </View>
      ) : (
        filteredInventory.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.medName}>
                  {item.medicineName || ""}
                  {" "}
                  <Text style={styles.dosage}>{item.dosage || ""}</Text>
                </Text>
                <Text style={styles.genericName}>{item.genericName || ""} ({item.brand || "Generic"})</Text>
              </View>
              <Text style={styles.price}>₱{Number(item.price || 0).toFixed(2)}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsText}>
                {"Form: "}
                <Text style={{fontWeight: '600'}}>{item.form || "N/A"}</Text>
              </Text>
              <Text style={styles.detailsText}>
                {"Stock: "}
                <Text style={{fontWeight: '600', color: item.stock <= 10 ? '#EF4444' : '#4B5563'}}>{item.stock || 0} pcs</Text>
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStockStatusColor(item.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStockStatusColor(item.status) }]}>{item.status || "Unknown"}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  searchInput: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  tabSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  tabButton: { flex: 1, backgroundColor: "#E5E7EB", paddingVertical: 8, marginHorizontal: 3, borderRadius: 8, alignItems: "center" },
  activeTabButton: { backgroundColor: "#1F2937" },
  tabText: { fontSize: 11, fontWeight: "600", color: "#4B5563" },
  activeTabText: { color: "#FFFFFF" },
  itemCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB", elevation: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  medName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  dosage: { fontSize: 13, color: "#6B7280", fontWeight: "400" },
  genericName: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  price: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  detailsText: { fontSize: 13, color: "#4B5563" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#9CA3AF", fontSize: 14 }
});