// USE FLATICON INSTEAD OF EMOJIS
import React, { useState } from "react";
import { Feather } from '@expo/vector-icons';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  StatusBar,
  Platform
} from "react-native";

// Import your custom layout views safely
import PharmacyDashboardView from "./screens/PharmacyDashboardView";
import InventoryScreen from "./screens/InventoryScreen";
import PickupOrdersScreen from "./screens/PickupOrdersScreen";
import DeliveryOrdersScreen from './screens/DeliveryOrdersScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import PrescriptionOrdersScreen from './screens/PrescriptionOrdersScreen';
import PharmacyProfileScreen from './screens/PharmacyProfileScreen';

const { width } = Dimensions.get("window");

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Render the selected view dynamically
  const renderScreen = () => {
    switch (currentScreen) {
      case "Dashboard":
         return <PharmacyDashboardView />;
      case "Prescription Orders":
        return <PrescriptionOrdersScreen />;
      case "Medicine Inventory":
        return <InventoryScreen />;
      case "Pickup Orders":
        return <PickupOrdersScreen />;
      case "Delivery Orders":
        return <DeliveryOrdersScreen />;
      case "Order History":
        return <OrderHistoryScreen />;
      case "Pharmacy Profile":
      return <PharmacyProfileScreen />;
      case "Reports":
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>{currentScreen} Screen Coming Soon</Text>
          </View>
        );
    }
  };

  const navigateTo = (screenName) => {
    setCurrentScreen(screenName);
    setIsSidebarOpen(false); // Auto-close sidebar on navigation choice
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Status Bar config to look seamless with your dark header */}
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Feather name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentScreen}</Text>
        <View style={{ width: 40 }} /> {/* Layout balancer */}
      </View>

      {/* VIEWPORT CONTROLLER */}
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>

      {/* CUSTOM SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.dismissLayer} 
            onPress={() => setIsSidebarOpen(false)} 
          />
          
          <View style={styles.sidebarPanel}>
            <Text style={styles.sidebarTitle}>OkieDoc+</Text>
            <Text style={styles.sidebarSubtitle}>Pharmacy Portal</Text>
            
            <View style={styles.divider} />

            {/* 1. Dashboard */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Dashboard" && styles.activeNavItem]}
              onPress={() => navigateTo("Dashboard")}
            >
              <View style={styles.navRow}>
                <Feather name="grid" size={20} color={currentScreen === "Dashboard" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Dashboard" && styles.activeNavText]}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Prescription Orders */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Prescription Orders" && styles.activeNavItem]}
              onPress={() => navigateTo("Prescription Orders")}
            >
              <View style={styles.navRow}>
                <Feather name="file-text" size={20} color={currentScreen === "Prescription Orders" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Prescription Orders" && styles.activeNavText]}>Prescription Orders</Text>
              </View>
            </TouchableOpacity>

            {/* 3. Pickup Orders */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Pickup Orders" && styles.activeNavItem]}
              onPress={() => navigateTo("Pickup Orders")}
            >
              <View style={styles.navRow}>
                <Feather name="shopping-bag" size={20} color={currentScreen === "Pickup Orders" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Pickup Orders" && styles.activeNavText]}>Pickup Orders</Text>
              </View>
            </TouchableOpacity>

            {/* 4. Delivery Orders */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Delivery Orders" && styles.activeNavItem]}
              onPress={() => navigateTo("Delivery Orders")}
            >
              <View style={styles.navRow}>
                <Feather name="truck" size={20} color={currentScreen === "Delivery Orders" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Delivery Orders" && styles.activeNavText]}>Delivery Orders</Text>
              </View>
            </TouchableOpacity>

            {/* 5. Medicine Inventory */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Medicine Inventory" && styles.activeNavItem]}
              onPress={() => navigateTo("Medicine Inventory")}
            >
              <View style={styles.navRow}>
                <Feather name="package" size={20} color={currentScreen === "Medicine Inventory" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Medicine Inventory" && styles.activeNavText]}>Medicine Inventory</Text>
              </View>
            </TouchableOpacity>

            {/* 6. Order History */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Order History" && styles.activeNavItem]}
              onPress={() => navigateTo("Order History")}
            >
              <View style={styles.navRow}>
                <Feather name="clock" size={20} color={currentScreen === "Order History" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Order History" && styles.activeNavText]}>Order History</Text>
              </View>
            </TouchableOpacity>

            {/* 7. Pharmacy Profile */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Pharmacy Profile" && styles.activeNavItem]}
              onPress={() => navigateTo("Pharmacy Profile")}
            >
              <View style={styles.navRow}>
                <Feather name="home" size={20} color={currentScreen === "Pharmacy Profile" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Pharmacy Profile" && styles.activeNavText]}>Pharmacy Profile</Text>
              </View>
            </TouchableOpacity>

            {/* 8. Reports */}
            <TouchableOpacity 
              style={[styles.navItem, currentScreen === "Reports" && styles.activeNavItem]}
              onPress={() => navigateTo("Reports")}
            >
              <View style={styles.navRow}>
                <Feather name="bar-chart-2" size={20} color={currentScreen === "Reports" ? "#2563EB" : "#4B5563"} />
                <Text style={[styles.navText, currentScreen === "Reports" && styles.activeNavText]}>Reports</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F2937",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 60,
    backgroundColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  menuButton: {
    padding: 10,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 9999,
    // FIXED: Guarantees full display context isolation over heavy viewport controls on Android
    elevation: 100, 
  },
  dismissLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sidebarPanel: {
    width: 260,
    backgroundColor: "#FFFFFF",
    height: "100%",
    paddingTop: 40,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    paddingHorizontal: 10,
  },
  sidebarSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 15,
    marginHorizontal: 10,
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeNavItem: {
    backgroundColor: "#EEF2F6",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  navText: {
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "500",
    marginLeft: 12,
  },
  activeNavText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 16,
  }
});