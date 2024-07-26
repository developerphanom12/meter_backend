const jwt = require('jsonwebtoken');
const secretKey = 'b178c3318b86646b1e6a9cea8860680723e9070bcde26dg456ttyt';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized user, please provide a token' });
  }

  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const token = tokenParts[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(400).json({ status: false,  message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;


