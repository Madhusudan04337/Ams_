const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET || "key_is_secret"

function auth(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Person" })
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" })
    }
    req.user = decoded
    next()
  })
}

function roleAuth(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    next()
  }
}
module.exports = { auth, roleAuth }
