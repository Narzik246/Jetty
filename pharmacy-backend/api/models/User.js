module.exports = {
  attributes: {
    username: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    role: { type: 'string', required: true },
    fullName: { type: 'string', required: true },
    birthday: { type: 'string', required: true }, // Format: YYYY-MM-DD
    age: { type: 'number', required: true },      // Kept here so system calculations remain unbroken!
    gender: { type: 'string', required: true },
    contact: { type: 'string', required: true }
  },

  beforeCreate: async function (values, proceed) {
    const bcrypt = require('bcryptjs');
    try {
      const hashedPassword = await bcrypt.hash(values.password, 10);
      values.password = hashedPassword;
      return proceed();
    } catch (err) {
      return proceed(err);
    }
  }
};