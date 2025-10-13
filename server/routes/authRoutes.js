const express = require("express")
const router = express.Router()
const { auth, roleAuth } = require("../middleware/auth")
const {
  register,
  login,
  myProfile,
  adminWelcome,
  managerWelcome,
  employeeWelcome,
} = require("../controllers/authController")

router.get("/", (req, res) => res.send("Welcome!"))

router.post("/register", register)
router.post("/login", login)
router.get("/myprofile", auth, myProfile)

router.get("/admin", auth, roleAuth(["admin"]), adminWelcome)
router.get("/manager", auth, roleAuth(["admin", "manager"]), managerWelcome)
router.get("/employee", auth, roleAuth(["admin", "manager", "employee"]), employeeWelcome)

module.exports = router
