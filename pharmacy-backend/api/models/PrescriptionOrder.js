/**
 * PrescriptionOrder.js
 *
 * @description :: Tracks medical prescription orders through fulfillment states (Pickup / Delivery).
 */

module.exports = {
  attributes: {
    prescriptionId:  { type: 'string', required: true, unique: true }, // e.g., "RX-1234"
    ticketId:        { type: 'string', required: true },                // e.g., "TKT-5678"
    patientName:     { type: 'string', required: true },
    doctorName:      { type: 'string', required: true },
    medicineName:    { type: 'string', required: true },
    quantity:        { type: 'string', required: true },                // e.g., "21 tablets"
    fulfillmentType: { type: 'string', isIn: ['Pickup', 'Delivery'], required: true },
    
    status: { 
      type: 'string', 
      isIn: ['New', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'], 
      defaultsTo: 'New' 
    },

    // Fulfillment details based on type selected
    pickupBranch:    { type: 'string', defaultsTo: 'Central Branch' },
    pickupSchedule:  { type: 'string' }, // e.g., "2026-05-04 2:00 PM"
    deliveryAddress: { type: 'string' },
    riderName:       { type: 'string', defaultsTo: 'Not Assigned' }
  },
};