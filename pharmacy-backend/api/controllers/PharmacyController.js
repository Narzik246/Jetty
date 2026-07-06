/**
 * PharmacyController
 *
 * @description :: Server-side actions for processing OkieDoc System pharmacy data using local arrays.
 */

// 1. Mock Requests Database
let requests = [
  {
    prescriptionId: "RX-1234",
    ticketId: "TKT-5678",
    patientName: "Garen Crownguard",
    doctorName: "Dr. Roberto Cruz",
    medicineName: "Amoxicillin 500mg",
    quantity: "21 tablets",
    fulfillmentType: "Pickup",
    status: "New",
    pickupBranch: "Central Branch",
    pickupSchedule: "2026-05-04 3:00 PM",
    deliveryAddress: "",
    riderName: "Not Assigned"
  },
  {
    prescriptionId: "RX-1233",
    ticketId: "TKT-5677",
    patientName: "Sarah Fortune",
    doctorName: "Dr. Elena Rivera",
    medicineName: "Metformin 850mg",
    quantity: "60 tablets",
    fulfillmentType: "Delivery",
    status: "Preparing",
    pickupBranch: "",
    pickupSchedule: "",
    deliveryAddress: "456 West Ave, Quezon City",
    riderName: "Not Assigned"
  },
  {
    prescriptionId: "RX-1232",
    ticketId: "TKT-5676",
    patientName: "Soraka Starchild",
    doctorName: "Dr. Michael Tan",
    medicineName: "Losartan 50mg",
    quantity: "30 tablets",
    fulfillmentType: "Pickup",
    status: "Ready for Pickup",
    pickupBranch: "Central Branch",
    pickupSchedule: "2026-05-04 2:00 PM",
    deliveryAddress: "",
    riderName: "Not Assigned"
  },
  {
    prescriptionId: "RX-1231",
    ticketId: "TKT-5675",
    patientName: "Yasuo Unforgiven",
    doctorName: "Dr. Sarah Lim",
    medicineName: "Omeprazole 20mg",
    quantity: "30 capsules",
    fulfillmentType: "Delivery",
    status: "Out for Delivery",
    pickupBranch: "",
    pickupSchedule: "",
    deliveryAddress: "123 Main St, Makati City",
    riderName: "John Driver"
  }
];

// 2. Mock Medicine Inventory
let medicineInventory = [
  { id: 1, medicineName: "Amoxicillin", genericName: "Amoxicillin", brand: "Amoxil", dosage: "500mg", form: "Capsule", stock: 250, status: "Available", price: 12.50, rxRequired: true },
  { id: 2, medicineName: "Metformin", genericName: "Metformin HCl", brand: "Glucophage", dosage: "850mg", form: "Tablet", stock: 180, status: "Available", price: 8.75, rxRequired: true },
  { id: 3, medicineName: "Losartan", genericName: "Losartan Potassium", brand: "Cozaar", dosage: "50mg", form: "Tablet", stock: 45, status: "Low Stock", price: 15.00, rxRequired: true },
  { id: 4, medicineName: "Omeprazole", genericName: "Omeprazole", brand: "Prilosec", dosage: "20mg", form: "Capsule", stock: 0, status: "Out of Stock", price: 10.25, rxRequired: true },
  { id: 5, medicineName: "Cetirizine", genericName: "Cetirizine HCl", brand: "Zyrtec", dosage: "10mg", form: "Tablet", stock: 320, status: "Available", price: 5.50, rxRequired: false },
  { id: 6, medicineName: "Paracetamol", genericName: "Paracetamol", brand: "Biogesic", dosage: "500mg", form: "Tablet", stock: 28, status: "Low Stock", price: 3.00, rxRequired: false },
  { id: 7, medicineName: "Atorvastatin", genericName: "Atorvastatin Calcium", brand: "Lipitor", dosage: "20mg", form: "Tablet", stock: 150, status: "Available", price: 18.50, rxRequired: true },
  { id: 8, medicineName: "Ambroxol Syrup", genericName: "Ambroxol HCl", brand: "Mucosolvan", dosage: "15mg/5mL", form: "Syrup", stock: 18, status: "Low Stock", price: 125.00, rxRequired: false }
];

module.exports = {

  // GET /api/pharmacy/requests
  getRequests: async function (req, res) {
    return res.json(requests);
  },

  // GET /api/pharmacy/inventory
  getInventory: async function (req, res) {
    return res.json(medicineInventory);
  },

  // POST /api/pharmacy/update-status
  updateStatus: async function (req, res) {
    let id = req.params.id || req.body.id || req.body.prescriptionId;
    let newStatus = req.body.status;

    let index = requests.findIndex(r => r.prescriptionId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Order request profile not found." });
    }

    requests[index].status = newStatus;

    return res.json({
      success: true,
      message: "Status updated inside memory array.",
      id: id,
      status: newStatus
    });
  },

  // GET /api/pharmacy/dashboard-stats
  getDashboardStats: async function (req, res) {
    const preparing = requests.filter(r => r.status === 'Preparing').length;
    const readyForPickup = requests.filter(r => r.status === 'Ready for Pickup').length;
    const outForDelivery = requests.filter(r => r.status === 'Out for Delivery').length;
    
    const deliveredToday = 12; 
    const failedDelivery = 0;

    const available = medicineInventory.filter(m => m.status === 'Available').length;
    const lowStock = medicineInventory.filter(m => m.status === 'Low Stock').length;
    const outOfStock = medicineInventory.filter(m => m.status === 'Out of Stock').length;

    // Fixed: Using Express standard res.json configuration to ensure flawless mobile client loading
    return res.json({
      success: true,
      metrics: {
        orders: { preparing, readyForPickup, outForDelivery, deliveredToday, failedDelivery },
        inventory: { available, lowStock, outOfStock }
      }
    });
  }
};