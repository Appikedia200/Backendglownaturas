const jwt = require('jsonwebtoken');

exports.generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.sendTokenResponse = (admin, statusCode, res) => {
  const token = this.generateJWT(admin._id);
  
  res.status(statusCode).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isEmailVerified: admin.isEmailVerified
    }
  });
};

