/**
 * Medicine.js
 *
 * @description :: A model definition represents a database record of pharmacy inventory.
 */

module.exports = {
  attributes: {
    medicineName: { type: 'string', required: true },
    genericName:  { type: 'string', required: true },
    brand:        { type: 'string', required: true },
    dosage:       { type: 'string', required: true }, // e.g., "500mg", "15mg/5mL"
    form:         { type: 'string', required: true }, // e.g., "Capsule", "Tablet", "Syrup"
    stock:        { type: 'number', required: true }, // e.g., 250
    status:       { type: 'string', isIn: ['Available', 'Low Stock', 'Out of Stock'], defaultsTo: 'Available' },
    price:        { type: 'number', required: true }, // e.g., 12.50
    rxRequired:   { type: 'boolean', defaultsTo: true }
  },
};