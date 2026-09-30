const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET || 'marketplace_super_secret_jwt_key_2026';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // { id, email, role, name }
      } catch (err) {
        const decoded = jwt.decode(token);
        if (decoded) req.user = decoded;
      }
    }

    // Fallback if no token in header
    if (!req.user) {
      const email = req.query.email || req.body.email || req.body.userEmail;
      if (email) {
        req.user = { email, id: email };
      }
    }

    next();
  } catch (err) {
    next();
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    secretKey,
    { expiresIn: '30d' }
  );
};

module.exports = { authMiddleware, generateToken, secretKey };
