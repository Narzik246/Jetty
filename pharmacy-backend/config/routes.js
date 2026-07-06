/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 */

module.exports.routes = {

  '/test': function (req, res) {
    return res.send('WORKING');
  },

  // 🔑 Authentication Endpoints
  'POST /api/auth/register': 'AuthController.register',
  'POST /api/auth/login':    'AuthController.login',
  'GET /api/auth/users':     'AuthController.getUsers',

  // 💊 OkieDoc+ Pharmacy Portal System Routes
  'GET /api/pharmacy/requests':        'PharmacyController.getRequests',
  'GET /api/pharmacy/inventory':       'PharmacyController.getInventory',
  'POST /api/pharmacy/update-status':  'PharmacyController.updateStatus',
  'GET /api/pharmacy/dashboard-stats': 'PharmacyController.getDashboardStats',

};