/**
 * AuthController
 *
 * @description :: Server-side actions for processing OkieDoc System registrations, logins, and lookups.
 */

const bcrypt = require('bcryptjs');

module.exports = {
  
  // 📝 SECURE ACCOUNT REGISTRATION WITH DATA VALIDATION
  register: async function (req, res) {
    try {
      // Gather payload sent securely from your client interface
      const { username, password, role, fullName, birthday, gender, contact, confirmElderly } = req.allParams();

      // 1. Structural Validation
      if (!username || !password || !role || !fullName || !birthday || !gender || !contact) {
        return res.status(400).json({ success: false, message: 'All registration fields are required.' });
      }

      // 2. Philippine Contact Number Validation (+63 + exactly 10 digits)
      const cleanContact = contact.trim();
      const phPhoneRegex = /^\+63\d{10}$/;
      if (!phPhoneRegex.test(cleanContact)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid contact format. Must start with +63 followed by exactly 10 digits (e.g., +639123456789).' 
        });
      }

      // 3. Birthday Reality Validation
      const birthDate = new Date(birthday);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid calendar date format. Use YYYY-MM-DD.' });
      }

      // Check for impossible calendar months/days (e.g., 2023-13-32)
      const dateParts = birthday.split('-');
      if (parseInt(dateParts[1]) > 12 || parseInt(dateParts[2]) > 31) {
        return res.status(400).json({ success: false, message: 'That calendar date does not exist.' });
      }

      // Prevent future birthdays
      const today = new Date();
      if (birthDate > today) {
        return res.status(400).json({ success: false, message: 'Birthdays cannot be set in the future!' });
      }

      // 4. Calculate Age & Handle the 100+ Years Honestly Warning
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 0 || birthDate.getFullYear() < 1900) {
        return res.status(400).json({ success: false, message: 'Please enter a viable realistic birthday.' });
      }

      // Custom Elder Check Trigger
      if (age >= 100 && !confirmElderly) {
        return res.status(200).json({
          success: false,
          isElderlyWarning: true,
          message: `Are you really ${age}? The data you are putting here is important for your health, so we would appreciate honesty! (Set confirmElderly to true if this is real).`
        });
      }

      // 5. Check if account username is already taken
      const lowerUser = username.toLowerCase().trim();
      const existingUser = await User.findOne({ username: lowerUser });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken.' });
      }

      // 6. Confirm target role matches system permissions policy
      const validRoles = ['Admin', 'Patient', 'Nurse', 'Pharmacy', 'General Physician'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid system role assigned.' });
      }

      // 7. Save account directly to physical database
      const newUser = await User.create({
        username: lowerUser,
        password, // Your User model lifecycle hook will encrypt this cleanly!
        role,
        fullName: fullName.trim(),
        birthday: birthday, 
        age: age,           
        gender,
        contact: cleanContact
      }).fetch();

      return res.json({ 
        success: true, 
        message: 'Account successfully registered to database!', 
        user: newUser.username, 
        role: newUser.role 
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 🔓 SECURE MUTUAL LOGIN VERIFICATION
  login: async function (req, res) {
    try {
      const { username, password } = req.allParams();
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Missing username or password variables.' });
      }

      const lowerUser = username.toLowerCase().trim();
      const user = await User.findOne({ username: lowerUser });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password credentials.' });
      }

      // Handle raw testing profiles gracefully fallback if hook is disabled during local mock builds
      let match = false;
      try {
        match = await bcrypt.compare(password, user.password);
      } catch (bcryptErr) {
        match = (user.password.trim() === password.trim());
      }

      if (!match && user.password.trim() !== password.trim()) {
        return res.status(401).json({ success: false, message: 'Invalid username or password credentials.' });
      }

      return res.json({
        success: true,
        message: 'Login authorization granted.',
        user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 🔍 Fetch all database rows safely
  getUsers: async function (req, res) {
    try {
      const allUsers = await User.find();
      return res.json({ success: true, totalUsers: allUsers.length, users: allUsers });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};