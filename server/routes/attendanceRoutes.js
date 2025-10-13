const express = require("express")
const router = express.Router()
const { auth, roleAuth } = require("../middleware/auth")
const {
  markAttendance,
  getMyHistory,
  getMyMonthlySummary,
  rectifyAttendance,
  getTeamSummary,
  getAuditLogs,
} = require("../controllers/attendanceController")


router.post("/mark", auth, roleAuth(["employee"]), markAttendance)
router.get("/history", auth, roleAuth(["employee"]), getMyHistory)
router.get("/summary", auth, roleAuth(["employee"]), getMyMonthlySummary)

router.patch("/rectify", auth, roleAuth(["manager", "admin"]), rectifyAttendance)
router.get("/team-summary", auth, roleAuth(["manager", "admin"]), getTeamSummary)


router.get("/audit-logs", auth, roleAuth(["admin"]), getAuditLogs)

module.exports = router
