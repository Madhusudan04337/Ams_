const mongoose = require("mongoose")
const Attendance = require("../models/attendanceSchema")
const User = require("../models/userSchema")
const AuditLog = require("../models/auditLogSchema")

function normalizeToDateOnly(date) {                         //reference
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function monthRange(year, month) {                            //reference
  const start = new Date(year, month - 1, 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}

async function markAttendance(req, res) {
  try {
    const userId = req.user.id
    const today = normalizeToDateOnly(new Date())
    const status = (req.body && req.body.status) || "present" 

    if (!["present", "absent", "on_leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const exists = await Attendance.findOne({ user: userId, date: today })
    if (exists) {
      return res.status(400).json({ message: "Attendance already marked for today" })
    }

    const record = await Attendance.create({
      user: userId,
      date: today,
      status,
    })
    return res.status(201).json({ message: "Attendance marked", attendance: record })
  } catch (err) {
    console.error("markAttendance error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

async function getMyHistory(req, res) {
  try {
    const userId = req.user.id
    const { month, year } = req.query
    const query = { user: userId }
    if (month && year) {
      const { start, end } = monthRange(Number(year), Number(month))
      query.date = { $gte: start, $lte: end }
    }
    const records = await Attendance.find(query).sort({ date: -1 })
    return res.json({ history: records })
  } catch (err) {
    console.error("getMyHistory error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

async function getMyMonthlySummary(req, res) {
  try {
    const userId = req.user.id
    const month = Number(req.query.month)
    const year = Number(req.query.year)
    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" })
    }
    const { start, end } = monthRange(year, month)
    const agg = await Attendance.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    const summary = { present: 0, absent: 0, on_leave: 0 }
    agg.forEach((row) => {
      summary[row._id] = row.count
    })
    return res.json({ month, year, summary })
  } catch (err) {
    console.error("getMyMonthlySummary error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

async function rectifyAttendance(req, res) {
  try {
    const actor = req.user
    const { userId, date, newStatus } = req.body

    if (!userId || !date || !newStatus) {
      return res.status(400).json({ message: "userId, date, and newStatus are required" })
    }
    if (!["present", "absent", "on_leave"].includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    if (actor.role === "manager") {
      const target = await User.findById(userId).select("_id managerId")
      if (!target || String(target.managerId) !== String(actor.id)) {
        return res.status(403).json({ message: "Forbidden: outside your team" })
      }
    }

    const day = normalizeToDateOnly(new Date(date))
    const record = await Attendance.findOne({ user: userId, date: day })

    const previousStatus = record ? record.status : null
    if (record) {
      record.status = newStatus
      record.rectifiedBy = actor.id
      await record.save()
    } else {
      await Attendance.create({
        user: userId,
        date: day,
        status: newStatus,
        rectifiedBy: actor.id,
      })
    }

    await AuditLog.create({
      action: "rectify",
      performedBy: actor.id,
      targetUser: userId,
      attendanceDate: day,
      previousStatus,
      newStatus,
    })

    return res.json({ message: "Attendance rectified" })
  } catch (err) {
    console.error("rectifyAttendance error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

async function getTeamSummary(req, res) {
  try {
    const { month, year } = req.query
    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" })
    }
    const { start, end } = monthRange(Number(year), Number(month))

    let usersQuery = {}
    if (req.user.role === "manager") {
      usersQuery = { managerId: req.user.id }
    }

    const teamUsers = await User.find(usersQuery).select("_id username email")
    const userIds = teamUsers.map((u) => u._id)

    if (req.user.role === "manager" && userIds.length === 0) {
      return res.json({ month: Number(month), year: Number(year), team: [] })
    }

    const agg = await Attendance.aggregate([
      {
        $match: {
          user: { $in: userIds.length ? userIds : undefined },
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: { user: "$user", status: "$status" }, count: { $sum: 1 } } },
    ])

    const map = new Map()
    teamUsers.forEach((u) => {
      map.set(String(u._id), {
        userId: u._id,
        username: u.username,
        email: u.email,
        present: 0,
        absent: 0,
        on_leave: 0,
      })
    })
    agg.forEach((row) => {
      const userId = String(row._id.user)
      const status = row._id.status
      if (!map.has(userId)) return
      map.get(userId)[status] = row.count
    })

    return res.json({
      month: Number(month),
      year: Number(year),
      team: Array.from(map.values()),
    })
  } catch (err) {
    console.error("getTeamSummary error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

async function getAuditLogs(req, res) {
  try {
    const logs = await AuditLog.find({})
      .populate("performedBy", "username email role")
      .populate("targetUser", "username email role")
      .sort({ createdAt: -1 })
    return res.json({ logs })
  } catch (err) {
    console.error("getAuditLogs error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  markAttendance,
  getMyHistory,
  getMyMonthlySummary,
  rectifyAttendance,
  getTeamSummary,
  getAuditLogs,
}
