const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Access Denied: No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
};

const isUser = (req, res, next) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Users only' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isUser
};
